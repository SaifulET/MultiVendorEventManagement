"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  MessageSquare,
  Search,
  Send,
  Wifi,
  WifiOff,
} from "lucide-react";

import { getApiErrorMessage } from "@/lib/api";
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
} from "@/lib/order-chat";
import { useAuthStore } from "@/store/useAuthStore";
import type { AuthUser } from "@/types/auth";

interface BookingRequestChatPageProps {
  dashboardName: string;
  emptyStateDescription: string;
  searchPlaceholder: string;
  sendButtonLabel: string;
  composerPlaceholder: string;
}

const formatThreadTime = (value?: string | null) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
};

const formatMessageTime = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const buildInitials = (name?: string | null) => {
  const normalized = name?.trim();

  if (!normalized) {
    return "U";
  }

  return normalized
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
};

const formatRoleLabel = (role?: string | null) => {
  if (!role) {
    return "participant";
  }

  return role.replaceAll("_", " ").toLowerCase();
};

const formatDisplayedMessageContent = (message: OrderChatMessage) => {
  if (message.type !== "system") {
    return message.content;
  }

  return message.content
    .replace(/\b[a-f0-9]{20,}\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.!?])/g, "$1")
    .trim();
};

const getCurrentChatUserId = (
  user: AuthUser | null,
  participants?: OrderChatParticipants | null
) => {
  const userRecord = (user ?? {}) as {
    id?: string;
    userId?: string;
    _id?: string;
    email?: string;
    role?: string;
  };

  if (participants) {
    if (userRecord.email) {
      if (participants.customer.email === userRecord.email) {
        return participants.customer._id;
      }

      if (participants.provider.email === userRecord.email) {
        return participants.provider._id;
      }
    }

    if (userRecord.role === "customer") {
      return participants.customer._id;
    }

    if (userRecord.role) {
      return participants.provider._id;
    }
  }

  return userRecord.id || userRecord.userId || userRecord._id || "";
};

const withMessageOwnership = (
  message: OrderChatMessage,
  userId?: string
): OrderChatMessage => ({
  ...message,
  isMine: userId ? message.senderId === userId : message.isMine,
});

const withMessageOwnershipList = (
  items: OrderChatMessage[],
  userId?: string
) => items.map((message) => withMessageOwnership(message, userId));

const sortMessages = (items: OrderChatMessage[]) =>
  [...items].sort(
    (left, right) =>
      new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
  );

const upsertMessage = (
  items: OrderChatMessage[],
  nextMessage: OrderChatMessage
) => {
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
    counterpart?: OrderChatConversationItem["counterpart"] | null;
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
        counterpart: options?.counterpart as OrderChatConversationItem["counterpart"],
        latestBooking: options?.latestBooking ?? null,
        latestMessage,
      };

  return [
    nextConversation,
    ...conversations.filter((item) => item.conversation._id !== conversationId),
  ];
};

export default function BookingRequestChatPage({
  dashboardName,
  emptyStateDescription,
  searchPlaceholder,
  sendButtonLabel,
  composerPlaceholder,
}: BookingRequestChatPageProps) {
  const user = useAuthStore((state) => state.user);
  const [conversations, setConversations] = useState<OrderChatConversationItem[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState("");
  const [activeConversation, setActiveConversation] =
    useState<OrderChatConversationSummary | null>(null);
  const [activeBookings, setActiveBookings] = useState<OrderChatBookingSummary[]>([]);
  const [participants, setParticipants] = useState<OrderChatParticipants | null>(null);
  const [messages, setMessages] = useState<OrderChatMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileThread, setShowMobileThread] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [connectionState, setConnectionState] = useState<
    "connecting" | "connected" | "disconnected"
  >("disconnected");
  const [error, setError] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<OrderChatSocketClient | null>(null);
  const activeConversationRef = useRef("");
  const activeBookingIdRef = useRef("");
  const joinedConversationRef = useRef("");

  const selectedConversation =
    conversations.find(
      (conversation) => conversation.conversation._id === selectedConversationId
    ) ?? null;
  const activeBooking =
    activeBookings[0] ?? selectedConversation?.latestBooking ?? null;
  const currentChatUserId = getCurrentChatUserId(user, participants);
  const counterpart =
    participants && currentChatUserId
      ? getCounterpartFromParticipants(participants, currentChatUserId)
      : selectedConversation?.counterpart ?? null;

  const filteredConversations = conversations.filter((conversation) => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return true;
    }

    return (
      conversation.counterpart.fullName.toLowerCase().includes(normalizedQuery) ||
      conversation.counterpart.email.toLowerCase().includes(normalizedQuery) ||
      (conversation.latestMessage?.content ?? "").toLowerCase().includes(normalizedQuery)
    );
  });

  useEffect(() => {
    activeConversationRef.current = selectedConversationId;
  }, [selectedConversationId]);

  useEffect(() => {
    activeBookingIdRef.current = activeBooking?._id ?? "";
  }, [activeBooking?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!currentChatUserId) {
      return;
    }

    setMessages((current) =>
      sortMessages(withMessageOwnershipList(current, currentChatUserId))
    );
  }, [currentChatUserId]);

  useEffect(() => {
    const loadConversations = async () => {
      try {
        setIsLoadingConversations(true);
        setError("");

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
    setConnectionState("connecting");

    const handleConnect = () => {
      setConnectionState("connected");
    };

    const handleDisconnect = () => {
      setConnectionState("disconnected");
    };

    const handleConnectError = (socketError: Error) => {
      setConnectionState("disconnected");
      setError(socketError.message || "Unable to connect to chat server.");
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

      const nextMessage = withMessageOwnership(payload.data, currentChatUserId);

      if (conversationId === activeConversationRef.current) {
        setMessages((current) => upsertMessage(current, nextMessage));

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
        ? getCounterpartFromParticipants(
            payload.participants,
            getCurrentChatUserId(user, payload.participants)
          )
        : null;

      setConversations((current) =>
        updateConversationOrder(current, conversationId, nextMessage, {
          conversation: payload.conversation ?? null,
          counterpart: nextCounterpart,
          latestBooking: payload.latestBooking ?? payload.booking ?? null,
        })
      );
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("order-chat:presence:update", handlePresenceUpdate);
    socket.on("order-chat:message:new", handleNewMessage);
    socket.connect();

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("order-chat:presence:update", handlePresenceUpdate);
      socket.off("order-chat:message:new", handleNewMessage);
      socket.disconnect();
      socketRef.current = null;
      joinedConversationRef.current = "";
    };
  }, [currentChatUserId, user]);

  useEffect(() => {
    const socket = socketRef.current;
    const bookingId = activeBooking?._id ?? selectedConversation?.latestBooking?._id ?? "";

    if (!socket || !socket.connected || !selectedConversationId) {
      return;
    }

    if (
      joinedConversationRef.current &&
      joinedConversationRef.current !== selectedConversationId
    ) {
      socket.emit("order-chat:leave", {
        conversationId: joinedConversationRef.current,
        bookingId: activeBookingIdRef.current,
      });
    }

    socket.emit(
      "order-chat:join",
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
      setError("");

      const response = await fetchOrderChatMessages({
        conversationId: conversation.conversation._id,
        page: 1,
        limit: 50,
      });

      setActiveConversation(response.conversation);
      setActiveBookings(response.bookings);
      setParticipants(response.participants);
      const resolvedChatUserId = getCurrentChatUserId(user, response.participants);
      setMessages(
        sortMessages(withMessageOwnershipList(response.data, resolvedChatUserId))
      );
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleBackToInbox = () => {
    setShowMobileThread(false);
  };

  const handleSendMessage = async () => {
    const content = messageText.trim();
    const bookingId = activeBooking?._id;

    if (!content || !selectedConversationId || !bookingId) {
      return;
    }

    try {
      setIsSending(true);
      setError("");

      const socket = socketRef.current;

      if (socket?.connected) {
        await new Promise<void>((resolve, reject) => {
          socket.emit(
            "order-chat:message:send",
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
                reject(new Error(response?.message || "Failed to send message."));
                return;
              }

              const nextMessage = withMessageOwnership(
                response.data as OrderChatMessage,
                currentChatUserId
              );

              setMessages((current) => upsertMessage(current, nextMessage));

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
                ? getCounterpartFromParticipants(
                    response.participants,
                    getCurrentChatUserId(user, response.participants)
                  )
                : null;

              setConversations((current) =>
                updateConversationOrder(
                  current,
                  response.conversation?._id ||
                    response.data?.conversationId ||
                    selectedConversationId,
                  nextMessage,
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
          const nextMessage = withMessageOwnership(
            response.data as OrderChatMessage,
            currentChatUserId
          );

          setMessages((current) => upsertMessage(current, nextMessage));

          const nextCounterpart = response.participants
            ? getCounterpartFromParticipants(
                response.participants,
                getCurrentChatUserId(user, response.participants)
              )
            : counterpart;

          setConversations((current) =>
            updateConversationOrder(
              current,
              response.conversation?._id ||
                response.data?.conversationId ||
                selectedConversationId,
              nextMessage,
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

      setMessageText("");
    } catch (sendError) {
      setError(getApiErrorMessage(sendError));
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSendMessage();
    }
  };

  return (
    <div className="flex h-[calc(100vh-9.25rem)] min-h-[640px] overflow-hidden rounded-[28px] border border-[#E5E7EB] bg-white">
      <section
        className={`w-full border-r border-[#E5E7EB] bg-white lg:max-w-[320px] ${
          showMobileThread ? "hidden lg:block" : "block"
        }`}
      >
        <div className="border-b border-[#E5E7EB] px-6 py-7">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h1 className="text-[20px] font-bold text-[#0F172A]">Messages</h1>
            <div
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                connectionState === "connected"
                  ? "bg-[#EAF8EF] text-[#059669]"
                  : connectionState === "connecting"
                    ? "bg-[#FFF7E7] text-[#D97706]"
                    : "bg-[#F1F5F9] text-[#64748B]"
              }`}
            >
              {connectionState === "connected" ? (
                <Wifi className="h-3.5 w-3.5" />
              ) : (
                <WifiOff className="h-3.5 w-3.5" />
              )}
              {connectionState}
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={searchPlaceholder}
              className="h-11 w-full rounded-2xl border border-transparent bg-[#F8FAFC] pl-11 pr-4 text-sm text-[#0F172A] outline-none transition focus:border-[#E2E8F0] focus:bg-white"
            />
          </div>

          {error ? (
            <div className="mt-4 rounded-2xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-xs text-[#B91C1C]">
              {error}
            </div>
          ) : null}
        </div>

        <div className="h-[calc(100%-117px)] overflow-y-auto px-3 py-4">
          {isLoadingConversations ? (
            <div className="px-3 py-10 text-sm text-[#64748B]">
              Loading conversations...
            </div>
          ) : filteredConversations.length ? (
            <div className="space-y-2">
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
                    className={`w-full rounded-3xl px-4 py-4 text-left transition ${
                      isSelected
                        ? "bg-[#FBF1F1]"
                        : "bg-white hover:bg-[#F8FAFC]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative mt-0.5 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#B74140] text-sm font-semibold text-white">
                        {buildInitials(conversation.counterpart.fullName)}
                        <span
                          className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white ${
                            conversation.counterpart.isOnline
                              ? "bg-[#10B981]"
                              : "bg-[#CBD5E1]"
                          }`}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <p className="truncate text-[15px] font-bold text-[#0F172A]">
                            {conversation.counterpart.fullName}
                          </p>
                          <span className="shrink-0 text-xs text-[#64748B]">
                            {formatThreadTime(latestTimestamp)}
                          </span>
                        </div>

                        <p className="mt-1 text-xs capitalize text-[#7C8DB5]">
                          {formatRoleLabel(conversation.counterpart.role)}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="px-3 py-12 text-center text-sm text-[#64748B]">
              <MessageSquare className="mx-auto mb-3 h-10 w-10 text-[#CBD5E1]" />
              No chat threads found.
            </div>
          )}
        </div>
      </section>

      <section className={`${showMobileThread ? "block" : "hidden lg:block"} flex-1`}>
        <div className="flex h-full flex-col bg-white">
          {selectedConversation && counterpart ? (
            <>
              <div className="border-b border-[#E5E7EB] px-6 py-6">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleBackToInbox}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E2E8F0] text-[#475569] lg:hidden"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>

                  <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-[#B74140] text-sm font-semibold text-white">
                    {buildInitials(counterpart.fullName)}
                    <span
                      className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white ${
                        counterpart.isOnline ? "bg-[#10B981]" : "bg-[#CBD5E1]"
                      }`}
                    />
                  </div>

                  <div>
                    <h2 className="text-[16px] font-bold text-[#0F172A]">
                      {counterpart.fullName}
                    </h2>
                    <p className="text-sm text-[#64748B]">
                      {counterpart.isOnline ? "Online" : "Offline"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto bg-white px-6 py-6">
                {isLoadingMessages ? (
                  <div className="py-16 text-center text-sm text-[#64748B]">
                    Loading messages...
                  </div>
                ) : messages.length ? (
                  <div className="space-y-5">
                    {messages.map((message) => (
                      <div
                        key={message._id}
                        className={`flex ${
                          message.isMine ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div className="max-w-[85%]">
                          <div
                            className={`rounded-[18px] px-4 py-3 text-sm leading-6 ${
                              message.type === "system"
                                ? "border border-[#FDE68A] bg-[#FFFBEB] text-[#92400E]"
                                : message.isMine
                                  ? "bg-[#C34444] text-white"
                                  : "bg-[#F8FAFC] text-[#0F172A]"
                            }`}
                          >
                            {formatDisplayedMessageContent(message)}
                          </div>
                          <p
                            className={`mt-1 text-xs ${
                              message.isMine
                                ? "text-right text-[#64748B]"
                                : "text-[#94A3B8]"
                            }`}
                          >
                            {formatMessageTime(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <div className="max-w-sm text-center">
                      <MessageSquare className="mx-auto mb-3 h-12 w-12 text-[#CBD5E1]" />
                      <h3 className="text-lg font-semibold text-[#0F172A]">
                        Start the conversation
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-[#64748B]">
                        Send a quick message from the {dashboardName} dashboard.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-[#E5E7EB] bg-white px-6 py-4">
                <div className="flex items-center gap-3 rounded-[20px] border border-[#E5E7EB] bg-white px-3 py-3">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(event) => setMessageText(event.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={composerPlaceholder}
                    className="flex-1 border-0 bg-transparent px-2 text-sm text-[#0F172A] outline-none"
                  />
                  <button
                    onClick={() => void handleSendMessage()}
                    disabled={!messageText.trim() || isSending || !activeBooking?._id}
                    className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[#C34444] px-4 text-sm font-semibold text-white transition hover:bg-[#AB3737] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSending ? "Sending..." : sendButtonLabel}
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center px-6">
              <div className="max-w-md text-center">
                <MessageSquare className="mx-auto mb-4 h-14 w-14 text-[#CBD5E1]" />
                <h2 className="text-2xl font-semibold text-[#0F172A]">
                  Open a conversation
                </h2>
                <p className="mt-3 text-sm leading-6 text-[#64748B]">
                  Select a message from the left panel to chat from the {dashboardName}
                  {" "}dashboard. {emptyStateDescription}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
