'use client';

import { Bell, CheckCircle, LoaderCircle, MessageSquare, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import {
  type AppNotification,
  fetchNotifications,
  fetchUnreadNotificationCount,
  formatNotificationTime,
  getNotificationActionPath,
  markAllNotificationsRead,
  markNotificationRead,
  NOTIFICATIONS_UPDATED_EVENT,
} from '@/lib/notifications';

interface NotificationBellProps {
  active?: boolean;
  buttonClassName?: string;
  iconClassName?: string;
  viewAllPath?: string;
}

const getNotificationIcon = (notification: AppNotification) => {
  const type = notification.type?.toLowerCase() ?? '';
  const category = notification.category?.toLowerCase() ?? '';

  if (type.includes('message') || category.includes('message')) {
    return <MessageSquare className="h-4 w-4" />;
  }

  if (type.includes('cancel') || type.includes('reject')) {
    return <X className="h-4 w-4" />;
  }

  if (type.includes('accept') || type.includes('confirm') || type.includes('approved')) {
    return <CheckCircle className="h-4 w-4" />;
  }

  return <Bell className="h-4 w-4" />;
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

export default function NotificationBell({
  active = false,
  buttonClassName,
  iconClassName = 'h-6 w-6',
  viewAllPath,
}: NotificationBellProps) {
  const router = useRouter();
  const notificationRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const refreshNotifications = async () => {
    try {
      setIsLoading(true);
      const [notificationsResponse, nextUnreadCount] = await Promise.all([
        fetchNotifications(),
        fetchUnreadNotificationCount(),
      ]);

      setNotifications(notificationsResponse.notifications);
      setUnreadCount(nextUnreadCount);
    } catch {
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refreshNotifications();

    const handleNotificationsUpdated = () => {
      void refreshNotifications();
    };

    window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, handleNotificationsUpdated);

    return () => {
      window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, handleNotificationsUpdated);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest('button[aria-label="Notifications"]')
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggle = () => {
    setIsOpen((current) => !current);
    void refreshNotifications();
  };

  const handleNotificationClick = async (notification: AppNotification) => {
    if (!notification.isRead) {
      await markNotificationRead(notification._id);
      setNotifications((current) =>
        current.map((item) => (item._id === notification._id ? { ...item, isRead: true } : item))
      );
      setUnreadCount((current) => Math.max(0, current - 1));
    }

    const actionPath = getNotificationActionPath(notification);
    setIsOpen(false);

    if (actionPath) {
      router.push(actionPath);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setIsMarkingAll(true);
      await markAllNotificationsRead();
      setNotifications((current) => current.map((notification) => ({ ...notification, isRead: true })));
      setUnreadCount(0);
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleViewAll = () => {
    setIsOpen(false);

    if (viewAllPath) {
      router.push(viewAllPath);
    }
  };

  return (
    <div className="relative" ref={notificationRef}>
      <button
        type="button"
        onClick={handleToggle}
        className={
          buttonClassName ??
          `relative flex h-8 w-8 items-center justify-center rounded-full transition ${
            active ? 'bg-[#DC3545] text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
          }`
        }
        aria-label="Notifications"
      >
        <Bell className={iconClassName} />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[10px] font-semibold leading-none text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="fixed right-8 top-20 z-50 w-[400px] max-w-[calc(100vw-32px)] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl">
          <div className="border-b border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                <p className="text-xs text-gray-500">{unreadCount} unread</p>
              </div>
              <button
                type="button"
                onClick={() => void handleMarkAllRead()}
                disabled={isMarkingAll || unreadCount === 0}
                className="rounded-md px-3 py-1.5 text-xs font-medium text-[#B74140] transition-colors hover:bg-[#F7EAEA] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isMarkingAll ? 'Marking...' : 'Mark all read'}
              </button>
            </div>
          </div>

          <div className="max-h-[400px] overflow-y-auto notification-scrollbar">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 p-6 text-sm text-gray-500">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Loading notifications...
              </div>
            ) : notifications.length ? (
              notifications.slice(0, 8).map((notification) => (
                <button
                  type="button"
                  key={notification._id}
                  onClick={() => void handleNotificationClick(notification)}
                  className={`block w-full border-b border-gray-100 p-4 text-left transition-colors hover:bg-gray-50 ${
                    notification.isRead ? 'bg-white' : 'bg-[#FFF7F7]'
                  }`}
                >
                  <div className="flex gap-3">
                    <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${getIconClasses(notification)}`}>
                      {getNotificationIcon(notification)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="truncate text-sm font-semibold text-gray-800">
                          {notification.title || 'Notification'}
                        </h4>
                        <span className="whitespace-nowrap text-xs text-gray-500">
                          {formatNotificationTime(notification.createdAt)}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                        {notification.message || 'You have a new notification.'}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-6 text-center text-sm text-gray-500">No notifications yet.</div>
            )}
          </div>

          {viewAllPath ? (
            <div className="border-t border-gray-200 bg-white p-3">
              <button
                type="button"
                onClick={handleViewAll}
                className="w-full rounded-lg border border-[#E5E7EB] py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                View all notifications
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
