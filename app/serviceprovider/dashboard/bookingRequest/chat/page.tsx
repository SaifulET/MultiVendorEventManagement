'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  MessageSquare,
  Search,
  Send,
  ShieldCheck,
  Wifi,
  WifiOff,
} from 'lucide-react';

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
    return participants.customer;
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

const getStatusTone = (status?: string) => {
  switch (status) {
    case 'confirmed':
    case 'active':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'pending':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'rejected':
    case 'cancelled':
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200';
  }
};

export default function ServiceProviderBookingRequestChatPage() {
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
  const [showMobileThread, setShowMobileThread] = useState(false);
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
  }, [messages]);

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
  }, [
    connectionState,
    selectedConversationId,
    activeBooking?._id,
    selectedConversation?.latestBooking?._id,
  ]);

  const handleSelectConversation = async (conversation: OrderChatConversationItem) => {
    try {
      setShowMobileThread(true);
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

  const handleBackToInbox = () => {
    setShowMobileThread(false);
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
                  response.conversation?._id ||
                    response.data?.conversationId ||
                    selectedConversationId,
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
              response.conversation?._id ||
                response.data?.conversationId ||
                selectedConversationId,
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
    <div className="min-h-screen bg-[#F7F8FC]">
      <div className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-5 md:px-10">
          <div className="flex items-center gap-4">
            <Link
              href="/serviceprovider/dashboard/bookingRequest"
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#B74140]">
                Booking Chat
              </p>
              <h1 className="text-2xl font-bold text-slate-900">
                Reply To Your Clients
              </h1>
            </div>
          </div>

          <div
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
              connectionState === 'connected'
                ? 'bg-emerald-50 text-emerald-700'
                : connectionState === 'connecting'
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-slate-100 text-slate-600'
            }`}
          >
            {connectionState === 'connected' ? (
              <Wifi className="h-4 w-4" />
            ) : (
              <WifiOff className="h-4 w-4" />
            )}
            {connectionState}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] px-6 py-6 md:px-10">
        {error ? (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid min-h-[calc(100vh-190px)] grid-cols-1 gap-6 xl:grid-cols-[370px_minmax(0,1fr)]">
          <section
            className={`overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.06)] ${
              showMobileThread ? 'hidden xl:block' : 'block'
            }`}
          >
            <div className="border-b border-slate-100 p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Active Conversations</h2>
                  <p className="text-sm text-slate-500">
                    Confirm details and keep bookings moving.
                  </p>
                </div>
                <div className="rounded-full bg-[#B7414014] px-3 py-1 text-sm font-semibold text-[#B74140]">
                  {conversations.length}
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by client or booking..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-[#B74140] focus:bg-white"
                />
              </div>
            </div>

            <div className="max-h-[calc(100vh-330px)] overflow-y-auto p-4">
              {isLoadingConversations ? (
                <div className="py-12 text-center text-sm text-slate-500">
                  Loading conversations...
                </div>
              ) : filteredConversations.length ? (
                <div className="space-y-3">
                  {filteredConversations.map((conversation) => {
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
                        className={`w-full rounded-3xl border px-4 py-4 text-left transition ${
                          isSelected
                            ? 'border-[#B74140] bg-[#B741400D] shadow-[0_12px_30px_rgba(183,65,64,0.12)]'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="mb-3 flex items-start gap-3">
                          <div className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#B74140] to-[#7f2d2c] text-sm font-semibold text-white">
                            {buildInitials(conversation.counterpart.fullName)}
                            {conversation.counterpart.isOnline ? (
                              <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
                            ) : null}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate font-semibold text-slate-900">
                                  {conversation.counterpart.fullName}
                                </p>
                                <p className="truncate text-xs uppercase tracking-[0.16em] text-slate-400">
                                  {conversation.counterpart.role.replaceAll('_', ' ')}
                                </p>
                              </div>
                              <span className="flex-shrink-0 text-xs text-slate-400">
                                {formatThreadTime(latestTimestamp)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mb-3 flex flex-wrap gap-2">
                          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {conversation.latestBooking?.targetName || 'Booking'}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusTone(
                              conversation.latestBooking?.status || conversation.conversation.status
                            )}`}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {conversation.latestBooking?.status || conversation.conversation.status}
                          </span>
                        </div>

                        <p className="truncate text-sm text-slate-600">
                          {conversation.latestMessage?.content || 'No messages yet'}
                        </p>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-500">
                  <MessageSquare className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                  <p className="text-sm">No chat threads found.</p>
                </div>
              )}
            </div>
          </section>

          <section className={`${showMobileThread ? 'block' : 'hidden xl:block'}`}>
            <div className="flex min-h-[calc(100vh-190px)] flex-col overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.06)]">
              {selectedConversation && counterpart ? (
                <>
                  <div className="border-b border-slate-100 bg-[radial-gradient(circle_at_top_left,_rgba(183,65,64,0.10),_transparent_35%),linear-gradient(180deg,#ffffff_0%,#fff8f7_100%)] p-5 md:p-6">
                    <div className="mb-5 flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={handleBackToInbox}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-600 transition hover:bg-white xl:hidden"
                        >
                          <ArrowLeft className="h-5 w-5" />
                        </button>

                        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#B74140] to-[#7f2d2c] text-base font-semibold text-white">
                          {buildInitials(counterpart.fullName)}
                          {counterpart.isOnline ? (
                            <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-white bg-emerald-500" />
                          ) : null}
                        </div>

                        <div>
                          <h2 className="text-xl font-semibold text-slate-900">
                            {counterpart.fullName}
                          </h2>
                          <p className="text-sm text-slate-500">
                            {counterpart.isOnline
                              ? 'Online now'
                              : counterpart.lastSeenAt
                                ? `Last seen ${formatThreadTime(counterpart.lastSeenAt)}`
                                : 'Offline'}
                          </p>
                        </div>
                      </div>

                      <div className="hidden rounded-2xl border border-slate-200 bg-white px-4 py-3 text-right sm:block">
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                          Conversation
                        </p>
                        <p className="font-mono text-xs text-slate-600">
                          #{activeConversation?._id?.slice(-6)}
                        </p>
                      </div>
                    </div>

                    {activeBooking ? (
                      <div className="grid gap-3 rounded-3xl border border-slate-200 bg-white p-4 sm:grid-cols-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                            Booking
                          </p>
                          <p className="mt-1 font-semibold text-slate-900">
                            {activeBooking.targetName || activeBooking.targetType}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                            Category
                          </p>
                          <p className="mt-1 font-semibold capitalize text-slate-900">
                            {activeBooking.targetType}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                            Status
                          </p>
                          <span
                            className={`mt-1 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusTone(
                              activeBooking.status
                            )}`}
                          >
                            {activeBooking.status}
                          </span>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="flex-1 overflow-y-auto bg-[linear-gradient(180deg,#fafbfc_0%,#f7f8fc_100%)] px-4 py-5 md:px-6">
                    {isLoadingMessages ? (
                      <div className="py-16 text-center text-sm text-slate-500">
                        Loading messages...
                      </div>
                    ) : messages.length ? (
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <div
                            key={message._id}
                            className={`flex ${
                              message.isMine ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <div className="max-w-[88%] md:max-w-2xl">
                              <div
                                className={`rounded-3xl px-4 py-3 text-sm leading-6 md:text-[15px] ${
                                  message.type === 'system'
                                    ? 'border border-amber-200 bg-amber-50 text-amber-800'
                                    : message.isMine
                                      ? 'rounded-br-md bg-[#B74140] text-white shadow-[0_16px_30px_rgba(183,65,64,0.18)]'
                                      : 'rounded-bl-md border border-slate-200 bg-white text-slate-800 shadow-sm'
                                }`}
                              >
                                {message.content}
                              </div>
                              <span
                                className={`mt-1.5 block text-xs ${
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
                      <div className="py-16 text-center text-slate-500">
                        <ShieldCheck className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                        <p className="text-sm">
                          No messages yet. Reply when you are ready.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-slate-100 bg-white p-4 md:p-5">
                    <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-3 shadow-inner">
                      <div className="flex items-end gap-3">
                        <input
                          type="text"
                          value={messageText}
                          onChange={(event) => setMessageText(event.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Write a helpful reply for your client..."
                          className="min-h-[52px] flex-1 rounded-2xl border-0 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-1 ring-slate-200 transition focus:ring-2 focus:ring-[#B74140]"
                        />
                        <button
                          onClick={() => void handleSendMessage()}
                          disabled={!messageText.trim() || isSending || !activeBooking?._id}
                          className="inline-flex h-[52px] items-center gap-2 rounded-2xl bg-[#B74140] px-5 text-sm font-semibold text-white transition hover:bg-[#982f2e] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isSending ? 'Sending...' : 'Reply'}
                          <Send className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-1 items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(183,65,64,0.08),_transparent_35%)] px-6">
                  <div className="max-w-md text-center">
                    <MessageSquare className="mx-auto mb-4 h-14 w-14 text-slate-300" />
                    <h2 className="text-2xl font-semibold text-slate-800">
                      Open A Booking Conversation
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-slate-500">
                      Select a client from the inbox to review booking context and send
                      a reply from the service provider dashboard.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
