'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, MessageSquare, Search, Send, Wifi, WifiOff } from 'lucide-react';

import { getApiErrorMessage } from '@/lib/api';
import {
  createOrderChatSocket,
  fetchOrderChatConversations,
  fetchOrderChatMessages,
  sendOrderChatMessage,
  type OrderChatBookingSummary,
  type OrderChatConversationItem,
  type OrderChatConversationSummary,
  type OrderChatMessage,
  type OrderChatNewMessagePayload,
  type OrderChatParticipants,
  type OrderChatPresenceUpdatePayload,
  type OrderChatSocketClient,
} from '@/lib/order-chat';
import { useAuthStore } from '@/store/useAuthStore';

const styles = `
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

const formatThreadTime = (value?: string | null) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date);
};

const formatMessageTime = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
};

const buildInitials = (name?: string | null) => {
  const normalized = name?.trim();

  if (!normalized) {
    return 'U';
  }

  return normalized
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
};

const sortMessages = (items: OrderChatMessage[]) =>
  [...items].sort(
    (left, right) =>
      new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
  );

const upsertMessage = (items: OrderChatMessage[], nextMessage: OrderChatMessage) => {
  const existingIndex = items.findIndex((item) => item._id === nextMessage._id);

  if (existingIndex >= 0) {
    const nextItems = [...items];
    nextItems[existingIndex] = nextMessage;
    return sortMessages(nextItems);
  }

  return sortMessages([...items, nextMessage]);
};

const getCounterpartFromParticipants = (
  participants: OrderChatParticipants,
  userId?: string
) => {
  if (!userId) {
    return participants.provider;
  }

  return participants.customer._id === userId
    ? participants.provider
    : participants.customer;
};

const upsertBooking = (
  items: OrderChatBookingSummary[],
  nextBooking?: OrderChatBookingSummary | null
) => {
  if (!nextBooking) {
    return items;
  }

  const existingIndex = items.findIndex((item) => item._id === nextBooking._id);

  if (existingIndex >= 0) {
    const nextItems = [...items];
    nextItems[existingIndex] = {
      ...nextItems[existingIndex],
      ...nextBooking,
    };
    return nextItems;
  }

  return [nextBooking, ...items];
};

const updateConversationOrder = (
  conversations: OrderChatConversationItem[],
  conversationId: string,
  latestMessage: OrderChatMessage,
  options?: {
    conversation?: OrderChatConversationSummary | null;
    counterpart?: OrderChatConversationItem['counterpart'] | null;
    latestBooking?: OrderChatBookingSummary | null;
  }
) => {
  const existingConversation = conversations.find(
    (item) => item.conversation._id === conversationId
  );

  if (!existingConversation && (!options?.conversation || !options?.counterpart)) {
    return conversations;
  }

  const nextConversation: OrderChatConversationItem = existingConversation
    ? {
        ...existingConversation,
        conversation: {
          ...existingConversation.conversation,
          ...(options?.conversation ?? {}),
        },
        counterpart: options?.counterpart ?? existingConversation.counterpart,
        latestBooking:
          options?.latestBooking ?? existingConversation.latestBooking ?? null,
        latestMessage,
      }
    : {
        conversation: options?.conversation as OrderChatConversationSummary,
        counterpart: options?.counterpart as OrderChatConversationItem['counterpart'],
        latestBooking: options?.latestBooking ?? null,
        latestMessage,
      };

  return [
    nextConversation,
    ...conversations.filter((item) => item.conversation._id !== conversationId),
  ];
};

export default function MessagingApp() {
  const user = useAuthStore((state) => state.user);
  const [conversations, setConversations] = useState<OrderChatConversationItem[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState('');
  const [activeConversation, setActiveConversation] =
    useState<OrderChatConversationSummary | null>(null);
  const [activeBookings, setActiveBookings] = useState<OrderChatBookingSummary[]>([]);
  const [participants, setParticipants] = useState<OrderChatParticipants | null>(null);
  const [messages, setMessages] = useState<OrderChatMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [connectionState, setConnectionState] = useState<
    'connecting' | 'connected' | 'disconnected'
  >('disconnected');
  const [error, setError] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<OrderChatSocketClient | null>(null);
  const activeConversationRef = useRef('');
  const activeBookingIdRef = useRef('');
  const joinedConversationRef = useRef('');

  const selectedConversation =
    conversations.find(
      (conversation) => conversation.conversation._id === selectedConversationId
    ) ?? null;
  const activeBooking =
    activeBookings[0] ?? selectedConversation?.latestBooking ?? null;
  const visibleMessages = messages.filter((message) => message.type !== 'system');
  const counterpart =
    participants && user?.id
      ? getCounterpartFromParticipants(participants, user.id)
      : selectedConversation?.counterpart ?? null;

  const filteredConversations = conversations.filter((conversation) => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return true;
    }

    return (
      conversation.counterpart.fullName.toLowerCase().includes(normalizedQuery) ||
      conversation.counterpart.email.toLowerCase().includes(normalizedQuery) ||
      (conversation.latestBooking?.targetName ?? '')
        .toLowerCase()
        .includes(normalizedQuery)
    );
  });

  useEffect(() => {
    activeConversationRef.current = selectedConversationId;
  }, [selectedConversationId]);

  useEffect(() => {
    activeBookingIdRef.current = activeBooking?._id ?? '';
  }, [activeBooking?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [visibleMessages]);

  useEffect(() => {
    const loadConversations = async () => {
      try {
        setIsLoadingConversations(true);
        setError('');

        const response = await fetchOrderChatConversations();
        setConversations(response.data);
      } catch (loadError) {
        setError(getApiErrorMessage(loadError));
      } finally {
        setIsLoadingConversations(false);
      }
    };

    void loadConversations();
  }, []);

  useEffect(() => {
    const socket = createOrderChatSocket();

    if (!socket) {
      return;
    }

    socketRef.current = socket;
    setConnectionState('connecting');

    const handleConnect = () => {
      setConnectionState('connected');
    };

    const handleDisconnect = () => {
      setConnectionState('disconnected');
    };

    const handleConnectError = (socketError: Error) => {
      setConnectionState('disconnected');
      setError(socketError.message || 'Unable to connect to chat server.');
    };

    const handlePresenceUpdate = (payload: OrderChatPresenceUpdatePayload) => {
      setConversations((current) =>
        current.map((conversation) =>
          conversation.counterpart._id === payload.data.userId
            ? {
                ...conversation,
                counterpart: {
                  ...conversation.counterpart,
                  isOnline: payload.data.isOnline,
                  lastSeenAt: payload.data.lastSeenAt,
                },
              }
            : conversation
        )
      );

      setParticipants((current) => {
        if (!current) {
          return current;
        }

        return {
          customer:
            current.customer._id === payload.data.userId
              ? {
                  ...current.customer,
                  isOnline: payload.data.isOnline,
                  lastSeenAt: payload.data.lastSeenAt,
                }
              : current.customer,
          provider:
            current.provider._id === payload.data.userId
              ? {
                  ...current.provider,
                  isOnline: payload.data.isOnline,
                  lastSeenAt: payload.data.lastSeenAt,
                }
              : current.provider,
        };
      });
    };

    const handleNewMessage = (payload: OrderChatNewMessagePayload) => {
      const conversationId =
        payload.conversation?._id || payload.data.conversationId;

      if (!conversationId) {
        return;
      }

      if (conversationId === activeConversationRef.current) {
        setMessages((current) => upsertMessage(current, payload.data));

        if (payload.participants) {
          setParticipants(payload.participants);
        }

        if (payload.conversation) {
          setActiveConversation(payload.conversation);
        }

        setActiveBookings((current) =>
          upsertBooking(current, payload.latestBooking ?? payload.booking)
        );
      }

      const nextCounterpart = payload.participants
        ? getCounterpartFromParticipants(payload.participants, user?.id)
        : null;

      setConversations((current) =>
        updateConversationOrder(current, conversationId, payload.data, {
          conversation: payload.conversation ?? null,
          counterpart: nextCounterpart,
          latestBooking: payload.latestBooking ?? payload.booking ?? null,
        })
      );
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('order-chat:presence:update', handlePresenceUpdate);
    socket.on('order-chat:message:new', handleNewMessage);
    socket.connect();

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off('order-chat:presence:update', handlePresenceUpdate);
      socket.off('order-chat:message:new', handleNewMessage);
      socket.disconnect();
      socketRef.current = null;
      joinedConversationRef.current = '';
    };
  }, [user?.id]);

  useEffect(() => {
    const socket = socketRef.current;
    const bookingId = activeBooking?._id ?? selectedConversation?.latestBooking?._id ?? '';

    if (!socket || !socket.connected || !selectedConversationId) {
      return;
    }

    if (
      joinedConversationRef.current &&
      joinedConversationRef.current !== selectedConversationId
    ) {
      socket.emit('order-chat:leave', {
        conversationId: joinedConversationRef.current,
        bookingId: activeBookingIdRef.current,
      });
    }

    socket.emit(
      'order-chat:join',
      {
        conversationId: selectedConversationId,
        bookingId,
        page: 1,
        limit: 50,
      },
      (response?: {
        success?: boolean;
        message?: string;
        conversation?: OrderChatConversationSummary;
        booking?: OrderChatBookingSummary;
        latestBooking?: OrderChatBookingSummary;
        bookings?: OrderChatBookingSummary[];
        participants?: OrderChatParticipants;
      }) => {
        if (!response?.success) {
          if (response?.message) {
            setError(response.message);
          }
          return;
        }

        joinedConversationRef.current = selectedConversationId;

        if (response.conversation) {
          setActiveConversation(response.conversation);
        }

        if (response.participants) {
          setParticipants(response.participants);
        }

        if (response.bookings) {
          setActiveBookings(response.bookings);
        } else if (response.latestBooking || response.booking) {
          setActiveBookings((current) =>
            upsertBooking(current, response.latestBooking ?? response.booking)
          );
        }
      }
    );
  }, [connectionState, selectedConversationId, activeBooking?._id, selectedConversation?.latestBooking?._id]);

  const handleSelectConversation = async (conversation: OrderChatConversationItem) => {
    try {
      setShowChat(true);
      setSelectedConversationId(conversation.conversation._id);
      setIsLoadingMessages(true);
      setError('');

      const response = await fetchOrderChatMessages({
        conversationId: conversation.conversation._id,
        page: 1,
        limit: 50,
      });

      setActiveConversation(response.conversation);
      setActiveBookings(response.bookings);
      setParticipants(response.participants);
      setMessages(sortMessages(response.data));
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleBackToContacts = () => {
    setShowChat(false);
    setSelectedConversationId('');
    setActiveConversation(null);
    setActiveBookings([]);
    setParticipants(null);
    setMessages([]);
  };

  const handleSendMessage = async () => {
    const content = messageText.trim();
    const bookingId = activeBooking?._id;

    if (!content || !selectedConversationId || !bookingId) {
      return;
    }

    try {
      setIsSending(true);
      setError('');

      const socket = socketRef.current;

      if (socket?.connected) {
        await new Promise<void>((resolve, reject) => {
          socket.emit(
            'order-chat:message:send',
            {
              conversationId: selectedConversationId,
              bookingId,
              content,
            },
            (response?: {
              success?: boolean;
              message?: string;
              conversation?: OrderChatConversationSummary;
              booking?: OrderChatBookingSummary;
              latestBooking?: OrderChatBookingSummary;
              bookings?: OrderChatBookingSummary[];
              participants?: OrderChatParticipants;
              data?: OrderChatMessage;
            }) => {
              if (!response?.success || !response.data) {
                reject(new Error(response?.message || 'Failed to send message.'));
                return;
              }

              setMessages((current) => upsertMessage(current, response.data as OrderChatMessage));

              if (response.participants) {
                setParticipants(response.participants);
              }

              if (response.conversation) {
                setActiveConversation(response.conversation);
              }

              if (response.bookings) {
                setActiveBookings(response.bookings);
              } else {
                setActiveBookings((current) =>
                  upsertBooking(current, response.latestBooking ?? response.booking)
                );
              }

              const nextCounterpart = response.participants
                ? getCounterpartFromParticipants(response.participants, user?.id)
                : null;

              setConversations((current) =>
                updateConversationOrder(
                  current,
                  response.conversation?._id || response.data?.conversationId || selectedConversationId,
                  response.data as OrderChatMessage,
                  {
                    conversation: response.conversation ?? activeConversation,
                    counterpart: nextCounterpart,
                    latestBooking: response.latestBooking ?? response.booking ?? activeBooking,
                  }
                )
              );

              resolve();
            }
          );
        });
      } else {
        const response = await sendOrderChatMessage({
          conversationId: selectedConversationId,
          bookingId,
          content,
        });

        if (response.data) {
          setMessages((current) => upsertMessage(current, response.data as OrderChatMessage));

          const nextCounterpart = response.participants
            ? getCounterpartFromParticipants(response.participants, user?.id)
            : counterpart;

          setConversations((current) =>
            updateConversationOrder(
              current,
              response.conversation?._id || response.data?.conversationId || selectedConversationId,
              response.data as OrderChatMessage,
              {
                conversation: response.conversation ?? activeConversation,
                counterpart: nextCounterpart ?? null,
                latestBooking: response.latestBooking ?? response.booking ?? activeBooking,
              }
            )
          );
        }

        if (response.participants) {
          setParticipants(response.participants);
        }

        if (response.conversation) {
          setActiveConversation(response.conversation);
        }

        if (response.bookings) {
          setActiveBookings(response.bookings);
        } else {
          setActiveBookings((current) =>
            upsertBooking(current, response.latestBooking ?? response.booking)
          );
        }
      }

      setMessageText('');
    } catch (sendError) {
      setError(getApiErrorMessage(sendError));
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void handleSendMessage();
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="flex h-screen bg-gray-50">
        <div
          className={`w-full border-r border-gray-200 bg-white md:w-80 ${
            showChat ? 'hidden md:flex' : 'flex'
          } flex-col`}
        >
          <div className="border-b border-gray-200 p-4 md:p-6">
            <div className="mb-3 flex items-center justify-between">
              <h1 className="text-xl font-semibold text-slate-900">Messages</h1>
              <div
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                  connectionState === 'connected'
                    ? 'bg-emerald-50 text-emerald-700'
                    : connectionState === 'connecting'
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-slate-100 text-slate-600'
                }`}
              >
                {connectionState === 'connected' ? (
                  <Wifi className="h-3.5 w-3.5" />
                ) : (
                  <WifiOff className="h-3.5 w-3.5" />
                )}
                {connectionState}
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full rounded-lg bg-gray-50 py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#B74140]"
              />
            </div>
          </div>

          {error ? (
            <div className="mx-4 mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 md:mx-6">
              {error}
            </div>
          ) : null}

          <div className="hide-scrollbar flex-1 overflow-y-auto py-4 md:py-6">
            {isLoadingConversations ? (
              <div className="px-6 py-10 text-center text-sm text-slate-500">
                Loading conversations...
              </div>
            ) : filteredConversations.length ? (
              filteredConversations.map((conversation) => {
                const isSelected =
                  selectedConversationId === conversation.conversation._id;
                const latestTimestamp =
                  conversation.latestMessage?.createdAt ||
                  conversation.conversation.lastMessageAt ||
                  conversation.conversation.updatedAt;

                return (
                  <button
                    key={conversation.conversation._id}
                    onClick={() => void handleSelectConversation(conversation)}
                    className={`mx-3 flex w-[calc(100%-24px)] items-start gap-3 rounded-2xl px-4 py-4 text-left transition md:mx-4 md:w-[calc(100%-32px)] ${
                      isSelected ? 'bg-[#B7414014]' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#B74140] to-[#812321] text-sm font-semibold text-white">
                      {buildInitials(conversation.counterpart.fullName)}
                      {conversation.counterpart.isOnline ? (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                      ) : null}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-start justify-between gap-3">
                        <span className="truncate font-semibold text-slate-900">
                          {conversation.counterpart.fullName}
                        </span>
                        <span className="flex-shrink-0 text-xs text-slate-500">
                          {formatThreadTime(latestTimestamp)}
                        </span>
                      </div>
                      <p className="truncate text-sm text-slate-600">
                        {conversation.latestMessage?.content ||
                          `${conversation.latestBooking?.targetType ?? 'booking'}: ${
                            conversation.latestBooking?.targetName ?? 'Conversation'
                          }`}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {conversation.counterpart.role.replaceAll('_', ' ')}
                      </p>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="px-6 py-12 text-center text-slate-500">
                <MessageSquare className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                <p className="text-sm">No conversations found.</p>
              </div>
            )}
          </div>
        </div>

        <div
          className={`flex-1 flex-col ${
            !showChat ? 'hidden md:flex' : 'flex'
          }`}
        >
          {selectedConversation && counterpart ? (
            <>
              <div className="flex items-center justify-between border-b border-gray-200 bg-white p-4 md:p-6">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleBackToContacts}
                    className="rounded-full p-2 transition hover:bg-gray-100 md:hidden"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>

                  <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#B74140] to-[#812321] text-sm font-semibold text-white">
                    {buildInitials(counterpart.fullName)}
                    {counterpart.isOnline ? (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                    ) : null}
                  </div>

                  <div>
                    <h2 className="font-semibold text-slate-900">
                      {counterpart.fullName}
                    </h2>
                    <p className="text-sm text-slate-500">
                      {counterpart.isOnline
                        ? 'Online'
                        : counterpart.lastSeenAt
                          ? `Last seen ${formatThreadTime(counterpart.lastSeenAt)}`
                          : activeBooking?.targetName || 'Conversation'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="hide-scrollbar flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
                {isLoadingMessages ? (
                  <div className="py-12 text-center text-sm text-slate-500">
                    Loading messages...
                  </div>
                ) : visibleMessages.length ? (
                  <div className="space-y-4">
                    {visibleMessages.map((message) => (
                      <div
                        key={message._id}
                        className={`flex ${message.isMine ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className="max-w-[85%] md:max-w-2xl">
                          <div
                            className={`rounded-2xl px-4 py-3 text-sm md:text-base ${
                              message.isMine
                                ? 'rounded-br-sm bg-[#B74140] text-white'
                                : 'rounded-bl-sm bg-white text-slate-800 shadow-sm'
                            }`}
                          >
                            {message.content}
                          </div>
                          <span
                            className={`mt-1 block text-xs ${
                              message.isMine
                                ? 'text-right text-slate-500'
                                : 'text-slate-400'
                            }`}
                          >
                            {formatMessageTime(message.createdAt)}
                          </span>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                ) : (
                  <div className="py-12 text-center text-sm text-slate-500">
                    No messages yet. Start the conversation.
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 bg-white p-3 md:p-4">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(event) => setMessageText(event.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    className="flex-1 rounded-lg bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#B74140]"
                  />
                  <button
                    onClick={() => void handleSendMessage()}
                    disabled={!messageText.trim() || isSending || !activeBooking?._id}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#B74140] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#9d3635] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className="hidden sm:inline">
                      {isSending ? 'Sending...' : 'Send'}
                    </span>
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center bg-gray-50">
              <div className="px-6 text-center">
                <MessageSquare className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                <h2 className="text-xl font-semibold text-slate-700">
                  Select a conversation
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Choose a conversation to view messages.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
