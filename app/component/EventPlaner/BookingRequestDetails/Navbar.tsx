'use client';

import React from 'react';
import { ArrowLeft, MessageCircle, Bell, User } from 'lucide-react';

interface NavbarProps {
  currentPage: 'booking-details' | 'notifications' | 'chat' | 'profile';
  onBack?: () => void;
  onNavigate: (page: 'booking-details' | 'notifications' | 'chat' | 'profile') => void;
  title?: string;
  showBackButton?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onBack,
  onNavigate,
  title = 'Booking Request Details',
  showBackButton = false
}) => {
 

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="px-[104px]">
        <div className="flex items-center justify-between h-16">
          {/* Left: Back button and title */}
          <div className="flex items-center gap-4">
           
              <button 
                onClick={onBack}
                className="text-gray-600 hover:text-gray-900 transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
            
            <h1 className="font-inter font-semibold text-2xl leading-8 tracking-normal">
              Booking Request Details
            </h1>
          </div>

          {/* Right: User actions */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => onNavigate('chat')}
              className={`w-8 h-8 flex items-center justify-center border rounded-full transition-colors ${
                currentPage === 'chat' 
                  ? 'bg-blue-100 border-blue-300 text-blue-600' 
                  : 'bg-gray-50 border-gray-300 text-gray-900 hover:bg-gray-100'
              }`}
              aria-label="Messages"
            >
              <MessageCircle className="w-5 h-5" />
            </button>
            
            <button 
              onClick={() => onNavigate('notifications')}
              className={`w-8 h-8 flex items-center justify-center border rounded-full transition-colors ${
                currentPage === 'notifications' 
                  ? 'bg-yellow-100 border-yellow-300 text-yellow-600' 
                  : 'bg-gray-50 border-gray-300 text-gray-900 hover:bg-gray-100'
              }`}
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
            </button>
            
            <button 
              onClick={() => onNavigate('profile')}
              className="relative"
              aria-label="Profile"
            >
              <div className={`w-8 h-8 rounded-full overflow-hidden border-2 ${
                currentPage === 'profile' ? 'border-blue-500' : 'border-transparent'
              }`}>
                <img 
                  src="https://i.pravatar.cc/150?img=1" 
                  alt="User profile" 
                  className="w-full h-full object-cover"
                />
              </div>
              {currentPage === 'profile' && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;