'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Clock, MessageSquare, CheckCircle, Bell, X } from 'lucide-react';

// Types
interface Notification {
  id: number;
  type: 'reminder' | 'message' | 'confirmed' | 'venue' | 'cancelled';
  title: string;
  description: string;
  time: string;
  buttonText: string;
  buttonLink: string;
  icon: React.ReactNode;
  iconBg: string;
  borderColor: string;
}

export default function NotificationsPage() {
  const router = useRouter();

  // Notifications data
  const notifications: Notification[] = [
    {
      id: 1,
      type: 'reminder',
      title: 'Booking Reminder',
      description:
        "Your event at Riverside Convention Hall is scheduled for tomorrow at 2:00 PM. Don't forget to arrive 30 minutes early.",
      time: 'Yesterday',
      buttonText: 'View Details',
      buttonLink: '/booking/123',
      icon: <Clock className="w-6 h-6" />,
      iconBg: 'bg-yellow-100',
      borderColor: 'border-l-yellow-400',
    },
    {
      id: 2,
      type: 'message',
      title: 'New Message from Provider',
      description:
        'Sarah Williams sent you a message regarding your upcoming booking at Skyline Events Center.',
      time: '5 hours ago',
      buttonText: 'View Message',
      buttonLink: '/messages/456',
      icon: <MessageSquare className="w-6 h-6" />,
      iconBg: 'bg-red-100',
      borderColor: 'border-l-red-400',
    },
    {
      id: 3,
      type: 'confirmed',
      title: 'Booking Confirmed',
      description:
        'Your booking at Grand Ballroom has been confirmed for 12 Aug, 9:00 AM. The venue is ready for your event.',
      time: '2 hours ago',
      buttonText: 'View Booking',
      buttonLink: '/booking/789',
      icon: <CheckCircle className="w-6 h-6" />,
      iconBg: 'bg-green-100',
      borderColor: 'border-l-green-400',
    },
    {
      id: 4,
      type: 'venue',
      title: 'New Venue Available',
      description:
        'Check out the newly listed Oceanview Terrace – perfect for your next outdoor event with stunning views.',
      time: '2 days ago',
      buttonText: 'Explore Venue',
      buttonLink: '/venue/oceanview',
      icon: <Bell className="w-6 h-6" />,
      iconBg: 'bg-purple-100',
      borderColor: 'border-l-purple-400',
    },
    {
      id: 5,
      type: 'cancelled',
      title: 'Event Cancelled',
      description:
        'Your booking at Sunset Pavilion has been cancelled. Please contact support for more details.',
      time: '3 days ago',
      buttonText: 'View Details',
      buttonLink: '/booking/details',
      icon: <X className="w-6 h-6" />,
      iconBg: 'bg-red-100',
      borderColor: 'border-l-red-400',
    },
  ];

  const handleButtonClick = (link: string) => {
    router.push(link);
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'reminder':
        return 'text-yellow-600';
      case 'message':
        return 'text-red-600';
      case 'confirmed':
        return 'text-green-600';
      case 'venue':
        return 'text-purple-600';
      case 'cancelled':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getButtonStyle = (type: string) => {
    const baseStyle = 'px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm';
    
    switch (type) {
      case 'reminder':
      case 'cancelled':
        return `${baseStyle} bg-gray-100 text-gray-700 hover:bg-gray-200`;
      case 'message':
      case 'confirmed':
      case 'venue':
        return `${baseStyle} bg-red-500 text-white hover:bg-red-600 shadow-md hover:shadow-lg`;
      default:
        return `${baseStyle} bg-gray-100 text-gray-700 hover:bg-gray-200`;
    }
  };

  return (
    <div className="flex  ">
      {/* Main Content Area - Full Width */}
      <div className="flex-1 flex flex-col">
        {/* Notifications Full View */}
        <div className="flex-1 overflow-y-auto ">
          <div className="">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Notifications</h1>
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`bg-white rounded-lg shadow-sm border-l-4 ${notification.borderColor} transition-all duration-200 hover:shadow-md`}
                >
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      {/* Icon */}
                      <div
                        className={`flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 ${notification.iconBg} rounded-full flex items-center justify-center ${getIconColor(
                          notification.type
                        )}`}
                      >
                        {notification.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            {(notification.type === 'message' ||
                              notification.type === 'venue' ||
                              notification.type === 'cancelled') && (
                              <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></span>
                            )}
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                              {notification.title}
                            </h3>
                          </div>
                        </div>

                        <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-3">
                          {notification.description}
                        </p>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <span className="text-xs sm:text-sm text-gray-500">
                            {notification.time}
                          </span>

                          <button
                            onClick={() => handleButtonClick(notification.buttonLink)}
                            className={getButtonStyle(notification.type)}
                          >
                            {notification.buttonText}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}