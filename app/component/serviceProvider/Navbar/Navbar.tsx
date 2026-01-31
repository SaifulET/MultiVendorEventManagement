"use client";

import { Columns2, Bell, Clock, MessageSquare, CheckCircle, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import profile from "@/public/profile.jpg";

interface Notification {
  id: number;
  type: 'reminder' | 'message' | 'confirmed' | 'venue' | 'cancelled';
  title: string;
  description: string;
  time: string;
  buttonText: string;
  buttonLink: string;
}

interface NavbarProps {
  collapsed: boolean;
  toggleSidebar: () => void;
}

export default function Navbar({ collapsed, toggleSidebar }: NavbarProps) {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Notifications data
  const notifications: Notification[] = [
    {
      id: 1,
      type: 'reminder',
      title: 'Booking Reminder',
      description: "Your event at Riverside Convention Hall is scheduled for tomorrow at 2:00 PM.",
      time: 'Yesterday',
      buttonText: 'View Details',
      buttonLink: '/serviceprovider/bookingRequest/123',
    },
    {
      id: 2,
      type: 'message',
      title: 'New Message from Provider',
      description: 'Sarah Williams sent you a message regarding your upcoming booking.',
      time: '5 hours ago',
      buttonText: 'View Message',
      buttonLink: '/serviceprovider/bookingRequest/456',
    },
    {
      id: 3,
      type: 'confirmed',
      title: 'Booking Confirmed',
      description: 'Your booking at Grand Ballroom has been confirmed for 12 Aug, 9:00 AM.',
      time: '2 hours ago',
      buttonText: 'View Booking',
      buttonLink: '/serviceprovider/bookingRequest/789',
    },
    {
      id: 4,
      type: 'venue',
      title: 'New Venue Available',
      description: 'Check out the newly listed Oceanview Terrace for your next outdoor event.',
      time: '2 days ago',
      buttonText: 'Explore Venue',
      buttonLink: '/serviceprovider/bookingRequest/23',
    },
    {
      id: 5,
      type: 'cancelled',
      title: 'Event Cancelled',
      description: 'Your booking at Sunset Pavilion has been cancelled.',
      time: '3 days ago',
      buttonText: 'View Details',
      buttonLink: '/serviceprovider/bookingRequest/12',
    },
    {
      id: 6,
      type: 'reminder',
      title: 'Payment Due',
      description: 'Payment for your upcoming event is due in 3 days.',
      time: '4 days ago',
      buttonText: 'Pay Now',
      buttonLink: '/serviceprovider/bookingRequest/123',
    },
    {
      id: 7,
      type: 'confirmed',
      title: 'Venue Updated',
      description: 'Your venue preferences have been updated successfully.',
      time: '1 week ago',
      buttonText: 'Check Details',
      buttonLink: '/serviceprovider/bookingRequest/123',
    },
    {
      id: 8,
      type: 'confirmed',
      title: 'Venue Updated',
      description: 'Your venue preferences have been updated successfully.',
      time: '1 week ago',
      buttonText: 'Check Details',
      buttonLink: '/serviceprovider/bookingRequest/123',
    },
  ];

  const handleAddVenue = () => {
    router.push("/serviceprovider/addService");
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'reminder':
        return <Clock className="w-4 h-4" />;
      case 'message':
        return <MessageSquare className="w-4 h-4" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'venue':
        return <Bell className="w-4 h-4" />;
      case 'cancelled':
        return <X className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'reminder':
        return 'text-yellow-600 bg-yellow-100';
      case 'message':
        return 'text-red-600 bg-red-100';
      case 'confirmed':
        return 'text-green-600 bg-green-100';
      case 'venue':
        return 'text-purple-600 bg-purple-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'reminder':
        return 'border-l-yellow-400';
      case 'message':
        return 'border-l-red-400';
      case 'confirmed':
        return 'border-l-green-400';
      case 'venue':
        return 'border-l-purple-400';
      case 'cancelled':
        return 'border-l-red-400';
      default:
        return 'border-l-gray-400';
    }
  };

  const handleNotificationClick = (link: string) => {
    router.push(link);
    setShowNotifications(false);
  };

  const handleViewAllNotifications = () => {
    router.push('/serviceprovider/bookingRequest/4');
    setShowNotifications(false);
  };

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest('button[aria-label="Notifications"]')
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <header
        className={`h-20 bg-white border-b border-gray-200 flex items-center justify-between px-[32px] py-[48px] 
        fixed top-0 z-30 transition-all duration-300 
        ${collapsed ? "left-20 w-[calc(100%-80px)]" : "left-64 w-[calc(100%-256px)]"}`}
      >
        {/* Left Icon (Columns2) */}
       

        {/* Profile Section */}
        <div className="flex gap-4 items-center">
           <button
          onClick={toggleSidebar}
          className="flex items-center justify-center rounded-xl transition"
        >
          <Columns2 className="w-8 h-8" />
        </button>
          <div className="flex flex-col">
            <p className="font-inter font-bold text-2xl leading-8 tracking-normal text-gray-800 mb-[8px]">
              Welcome back, John!
            </p>
            <p className="font-inter font-semibold text-md leading-none tracking-normal rounded-full p-[8px] text-center bg-[#10B9811A] text-[#10B981]">
              Premium Account
            </p>
          </div>

          {/* Avatar */}
          <div className="w-[48px] h-[48px]">
            <Image
              src={profile}
              alt="User avatar"
              width={48}
              height={48}
              className="rounded-full object-cover border border-amber-950"
              priority
            />
          </div>
        </div>

        {/* Right Side - Buttons & Notifications */}
        <div className="flex items-center gap-4">
          {/* Notifications Button */}
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex items-center justify-center text-gray-500 hover:text-gray-800 transition"
            aria-label="Notifications"
          >
            <Bell className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 block w-5 h-5 rounded-full bg-red-500 border-2 border-white text-white text-xs flex items-center justify-center">
              {notifications.length}
            </span>
          </button>

          {/* Add Venue Button */}
          <button
            onClick={handleAddVenue}
            className="bg-[#B74140] text-white py-2 px-4 rounded-lg hover:bg-[#a3312f] transition"
          >
            + Add Service
          </button>
        </div>
      </header>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div
          ref={notificationRef}
          className="fixed top-20 right-8 z-50 w-[400px] max-h-[550px] bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden"
        >
          {/* Dropdown Header */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg text-gray-800">Notifications</h3>
              <span className="text-sm text-gray-500 bg-gray-200 px-2 py-1 rounded">
                {notifications.length} new
              </span>
            </div>
          </div>

          {/* Notifications List - Scrollable */}
          <div className="overflow-y-auto max-h-[400px]">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${getBorderColor(
                  notification.type
                )} border-l-4`}
                onClick={() => handleNotificationClick(notification.buttonLink)}
              >
                <div className="flex gap-3">
                  {/* Notification Icon */}
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getIconColor(
                      notification.type
                    )}`}
                  >
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Notification Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-semibold text-sm text-gray-800 truncate">
                        {notification.title}
                      </h4>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                        {notification.time}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {notification.description}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNotificationClick(notification.buttonLink);
                      }}
                      className="text-xs text-[#B74140] hover:text-[#a3312f] font-medium"
                    >
                      {notification.buttonText} →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dropdown Footer */}
         
        </div>
      )}
    </>
  );
}