'use client';

import { Bell, CheckCircle, LoaderCircle, MessageSquare, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { getApiErrorMessage } from '@/lib/api';
import {
  type AppNotification,
  fetchNotifications,
  formatNotificationTime,
  getNotificationActionPath,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/lib/notifications';

const getNotificationIcon = (notification: AppNotification) => {
  const type = notification.type?.toLowerCase() ?? '';

  if (type.includes('message')) {
    return <MessageSquare className="h-6 w-6" />;
  }

  if (type.includes('cancel') || type.includes('reject')) {
    return <X className="h-6 w-6" />;
  }

  if (type.includes('accept') || type.includes('confirm') || type.includes('approved')) {
    return <CheckCircle className="h-6 w-6" />;
  }

  return <Bell className="h-6 w-6" />;
};

const getIconClasses = (notification: AppNotification) => {
  const type = notification.type?.toLowerCase() ?? '';

  if (type.includes('cancel') || type.includes('reject')) {
    return 'bg-red-100 text-red-600';
  }

  if (type.includes('accept') || type.includes('confirm') || type.includes('approved')) {
    return 'bg-green-100 text-green-600';
  }

  if (type.includes('message')) {
    return 'bg-blue-100 text-blue-600';
  }

  return 'bg-[#F7EAEA] text-[#B74140]';
};

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [error, setError] = useState('');

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  useEffect(() => {
    let isMounted = true;

    const loadNotifications = async () => {
      try {
        setIsLoading(true);
        setError('');

        const response = await fetchNotifications();

        if (!isMounted) {
          return;
        }

        setNotifications(response.notifications);
      } catch (fetchError) {
        if (!isMounted) {
          return;
        }

        setNotifications([]);
        setError(getApiErrorMessage(fetchError));
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadNotifications();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleNotificationClick = async (notification: AppNotification) => {
    if (!notification.isRead) {
      await markNotificationRead(notification._id);
      setNotifications((current) =>
        current.map((item) => (item._id === notification._id ? { ...item, isRead: true } : item))
      );
    }

    const actionPath = getNotificationActionPath(notification);

    if (actionPath) {
      router.push(actionPath);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setIsMarkingAll(true);
      await markAllNotificationsRead();
      setNotifications((current) => current.map((notification) => ({ ...notification, isRead: true })));
    } finally {
      setIsMarkingAll(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="mt-1 text-sm text-gray-500">{unreadCount} unread notifications</p>
        </div>
        <button
          type="button"
          onClick={() => void handleMarkAllRead()}
          disabled={isMarkingAll || unreadCount === 0}
          className="rounded-lg bg-[#B74140] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#963533] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isMarkingAll ? 'Marking...' : 'Mark all as read'}
        </button>
      </div>

      {isLoading ? (
        <div className="rounded-lg border border-[#E5E7EB] bg-white p-10 text-center text-gray-500">
          <div className="flex items-center justify-center gap-3">
            <LoaderCircle className="h-5 w-5 animate-spin" />
            Loading notifications...
          </div>
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : notifications.length ? (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <button
              type="button"
              key={notification._id}
              onClick={() => void handleNotificationClick(notification)}
              className={`block w-full rounded-lg border-l-4 bg-white p-4 text-left shadow-sm transition-all hover:shadow-md ${
                notification.isRead ? 'border-l-gray-200' : 'border-l-[#B74140]'
              }`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${getIconClasses(notification)}`}>
                  {getNotificationIcon(notification)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {!notification.isRead ? (
                        <span className="h-2 w-2 rounded-full bg-[#B74140]" />
                      ) : null}
                      <h3 className="text-base font-semibold text-gray-900">
                        {notification.title || 'Notification'}
                      </h3>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatNotificationTime(notification.createdAt)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">
                    {notification.message || 'You have a new notification.'}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-[#E5E7EB] bg-white p-10 text-center text-sm text-gray-500">
          No notifications yet.
        </div>
      )}
    </div>
  );
}
