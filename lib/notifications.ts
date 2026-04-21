import { api } from '@/lib/api';

export interface NotificationMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

export interface AppNotification {
  _id: string;
  recipientId?: string;
  category?: string;
  type?: string;
  title?: string;
  message?: string;
  actionEndpoint?: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  isRead?: boolean;
  readAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface NotificationsResponse {
  success: boolean;
  meta?: NotificationMeta;
  data?: AppNotification[];
}

interface UnreadCountResponse {
  success: boolean;
  data?: {
    unreadCount?: number;
  };
}

export const NOTIFICATIONS_UPDATED_EVENT = 'evenit:notifications-updated';

export const fetchNotifications = async () => {
  const response = await api.get<NotificationsResponse>('/api/v1/notifications');
  return {
    meta: response.data.meta,
    notifications: Array.isArray(response.data.data) ? response.data.data : [],
  };
};

export const fetchUnreadNotificationCount = async () => {
  const response = await api.get<UnreadCountResponse>('/api/v1/notifications/unread-count');
  return response.data.data?.unreadCount ?? 0;
};

export const markAllNotificationsRead = async () => {
  await api.patch('/api/v1/notifications/read-all');

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(NOTIFICATIONS_UPDATED_EVENT));
  }
};

export const markNotificationRead = async (notificationId: string) => {
  await api.patch(`/api/v1/notifications/${notificationId}/read`);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(NOTIFICATIONS_UPDATED_EVENT));
  }
};

export const formatNotificationTime = (value?: string) => {
  if (!value) {
    return 'Recently';
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return 'Recently';
  }

  const diffMs = Date.now() - parsed.getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMinutes < 1) {
    return 'Just now';
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);

  if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  }

  return parsed.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const getNotificationActionPath = (notification: AppNotification) => {
  const endpointBookingId = notification.actionEndpoint?.match(/\/bookings\/([^/?#]+)/)?.[1];
  const targetId = endpointBookingId || notification.entityId;

  if (notification.entityType !== 'booking' || !targetId) {
    return '';
  }

  if (typeof window === 'undefined') {
    return `/home/mybookings/${targetId}`;
  }

  const pathname = window.location.pathname;

  if (pathname.startsWith('/serviceprovider')) {
    return `/serviceprovider/bookingRequest/${targetId}`;
  }

  if (pathname.startsWith('/venueprovider') || pathname.startsWith('/vanueprovider')) {
    return `/venueprovider/bookingRequest/${targetId}`;
  }

  if (pathname.startsWith('/eventPlanner')) {
    return `/eventPlanner/bookingRequest/${targetId}`;
  }

  return `/home/mybookings/${targetId}`;
};
