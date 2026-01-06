'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import NotificationsPage from './Notification';
import MessagingApp from './Message';
import Navbar from './Navbar';
import BookingRequestDetails from './BookingRequestDetails';
import ProfileSettings from './Profile';
import { PageType } from './types';

const BookingContainer: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageType>('booking-details');
  const [showBackButton, setShowBackButton] = useState(false);
  const router = useRouter();

  const handleNavigation = (page: PageType) => {
    setCurrentPage(page);
    setShowBackButton(page !== 'booking-details');
  };

  const handleBack = () => {
    if (currentPage === 'booking-details') {
      // Navigate back to the booking request list
      router.push('/venueprovider/dashboard/bookingRequest');
    } else {
      // Go back to booking details (default behavior)
      setCurrentPage('booking-details');
      setShowBackButton(false);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'notifications':
        return <NotificationsPage />;
      case 'chat':
        return <MessagingApp />;
      case 'profile':
        return <ProfileSettings />;
      default:
        return (
          <BookingRequestDetails
            onAccept={() =>router.push("/venueprovider/dashboard/bookingRequest")}
            onReject={() => router.push("/venueprovider/dashboard/bookingRequest")}
            onMessage={() => handleNavigation('chat')}
            onBack={handleBack}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        currentPage={currentPage}
        onBack={handleBack}
        onNavigate={handleNavigation}
        showBackButton={showBackButton}
      />
      {renderPage()}
    </div>
  );
};

export default BookingContainer;