'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

const BookingConfirmation: React.FC = () => {
  const router= useRouter()
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 md:p-8 lg:p-10 w-full max-w-md">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-[#B74140] rounded-full flex items-center justify-center">
            <Check className="w-8 h-8 md:w-10 md:h-10 text-white" strokeWidth={3} />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-10">
          Booking Confirmed
        </h1>

        {/* Booking Details */}
        <div className="space-y-5 md:space-y-6 mb-6 md:mb-8">
          {/* Booked Item */}
          <div className="flex justify-between items-start gap-4">
            <span className="text-gray-600 text-sm md:text-base whitespace-nowrap">
              Booked Item
            </span>
            <span className="text-right font-medium text-sm md:text-base">
              Grand Palace Convention Hall
            </span>
          </div>

          {/* Date */}
          <div className="flex justify-between items-start gap-4">
            <span className="text-gray-600 text-sm md:text-base whitespace-nowrap">
              Date
            </span>
            <span className="text-right font-medium text-sm md:text-base">
              24 March 2025
            </span>
          </div>

          {/* Time */}
          <div className="flex justify-between items-start gap-4">
            <span className="text-gray-600 text-sm md:text-base whitespace-nowrap">
              Time
            </span>
            <span className="text-right font-medium text-sm md:text-base">
              6:00 PM – 11:00 PM
            </span>
          </div>

          {/* Amount Paid */}
          <div className="flex justify-between items-start gap-4">
            <span className="text-gray-600 text-sm md:text-base whitespace-nowrap">
              Amount Paid
            </span>
            <span className="text-right font-bold text-base md:text-lg">
              $45,000
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 mb-6">
          <button onClick={()=>{router.push("/pages/venueBookings/details")}} className="w-full bg-[#B74140] hover:bg-[#a33736] text-white font-medium py-3 md:py-3.5 rounded-lg transition-colors text-sm md:text-base">
            View Booking Details
          </button>
          
          <button className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 md:py-3.5 rounded-lg border border-gray-300 transition-colors text-sm md:text-base">
            Rate Your Experience
          </button>
        </div>

        {/* Confirmation Message */}
        <p className="text-center text-xs md:text-sm text-gray-500">
          A confirmation email has been sent to your email address.
        </p>
      </div>
    </div>
  );
};

export default BookingConfirmation;