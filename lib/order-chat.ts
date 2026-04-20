import { io, type Socket } from "socket.io-client";

import { api } from "@/lib/api";
import { getStoredToken } from "@/lib/auth-storage";

export interface OrderChatMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface OrderChatConversationSummary {
  _id: string;
  customerId: string;
  providerId: string;
  status: string;
  activatedAt?: string;
  lastMessageId?: string;
  lastMessageAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderChatBookingSummary {
  _id: string;
  targetType: string;
  targetId: string;
  targetName?: string;
  status: string;
  customerId: string;
  providerId: string;
  conversationId?: string;
  bookingDate?: string;
}

export interface OrderChatPresenceUser {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  isOnline: boolean;
  lastSeenAt: string | null;
}

export interface OrderChatMessage {
  _id: string;
  conversationId: string;
  bookingId: string;
  senderId: string;
  receiverId: string;
  type: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isMine: boolean;
}

export interface OrderChatParticipants {
  customer: OrderChatPresenceUser;
  provider: OrderChatPresenceUser;
}

export interface OrderChatConversationItem {
  conversation: OrderChatConversationSummary;
  counterpart: OrderChatPresenceUser;
  latestBooking: OrderChatBookingSummary | null;
  latestMessage: OrderChatMessage | null;
}

export interface OrderChatConversationListResponse {
  success: boolean;
  meta: OrderChatMeta;
  data: OrderChatConversationItem[];
}

export interface OrderChatMessagesResponse {
  success: boolean;
  meta: OrderChatMeta;
  conversation: OrderChatConversationSummary;
  bookings: OrderChatBookingSummary[];
  participants: OrderChatParticipants;
  data: OrderChatMessage[];
}

export interface OrderChatSendMessageResponse {
  success: boolean;
  conversation?: OrderChatConversationSummary;
  booking?: OrderChatBookingSummary;
  latestBooking?: OrderChatBookingSummary;
  bookings?: OrderChatBookingSummary[];
  participants?: OrderChatParticipants;
  data?: OrderChatMessage;
}

export interface OrderChatPresenceUpdatePayload {
  success: boolean;
  data: {
    userId: string;
    isOnline: boolean;
    lastSeenAt: string | null;
  };
}

export interface OrderChatNewMessagePayload {
  success: boolean;
  conversation?: OrderChatConversationSummary;
  booking?: OrderChatBookingSummary;
  latestBooking?: OrderChatBookingSummary;
  participants?: OrderChatParticipants;
  data: OrderChatMessage;
}

const getSocketBaseUrl = () => {
  const configuredBaseUrl =
    typeof api.defaults.baseURL === "string" && api.defaults.baseURL.trim()
      ? api.defaults.baseURL
      : typeof window !== "undefined"
        ? window.location.origin
        : "";

  if (!configuredBaseUrl) {
    return "";
  }

  return new URL(configuredBaseUrl, configuredBaseUrl).origin;
};

export const fetchOrderChatConversations = async ({
  page = 1,
  limit = 20,
}: {
  page?: number;
  limit?: number;
} = {}) => {
  const response = await api.get<OrderChatConversationListResponse>("/api/v1/order-chats", {
    params: {
      page,
      limit,
      sortBy: "updatedAt",
      sortOrder: "desc",
    },
  });

  return response.data;
};

export const fetchOrderChatMessages = async ({
  conversationId,
  page = 1,
  limit = 50,
}: {
  conversationId: string;
  page?: number;
  limit?: number;
}) => {
  const response = await api.get<OrderChatMessagesResponse>(
    `/api/v1/order-chats/conversations/${conversationId}/messages`,
    {
      params: { page, limit },
    }
  );

  return response.data;
};

export const sendOrderChatMessage = async ({
  conversationId,
  bookingId,
  content,
}: {
  conversationId: string;
  bookingId: string;
  content: string;
}) => {
  const response = await api.post<OrderChatSendMessageResponse>(
    `/api/v1/order-chats/conversations/${conversationId}/messages`,
    { bookingId, content }
  );

  return response.data;
};

export const createOrderChatSocket = () => {
  const token = getStoredToken();

  if (!token) {
    return null;
  }

  return io(getSocketBaseUrl(), {
    autoConnect: false,
    transports: ["websocket", "polling"],
    auth: {
      token: `Bearer ${token}`,
    },
  });
};

export type OrderChatSocketClient = Socket;
