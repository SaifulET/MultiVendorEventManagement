'use client';

import React from 'react';
import {
  Check,
  X,
  MessageSquare,
  Mail,
  Phone,
  AlertCircle,
  Clock
} from 'lucide-react';
import Navbar from './Navbar';

interface BookingDetails {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: {
    venue: string;
    address: string;
  };
  client: {
    name: string;
    title: string;
    email: string;
    phone: string;
  };
  guests: number;
  pricing: {
    subtotal: number;
    tax: number;
    taxRate: number;
    total: number;
  };
  specialRequests: string;
  payment: {
    depositRequired: boolean;
    depositAmount: number;
    depositPercentage: number;
    status: 'pending' | 'paid' | 'overdue';
  };
  status: 'pending' | 'approved' | 'rejected';
  timeline: {
    submitted: string;
  };
}

interface BookingRequestDetailsProps {
  booking?: BookingDetails;
  onAccept?: () => void;
  onReject?: () => void;
  onMessage?: () => void;
  onBack?: () => void;
}

const defaultBooking: BookingDetails = {
  id: '1',
  title: 'Corporate Annual Gala',
  description: 'Premium event catering and venue services',
  date: 'March 15, 2024',
  time: '7:00 PM - 11:00 PM',
  location: {
    venue: 'Grand Ballroom, Downtown Hotel',
    address: '123 Business Avenue, City Center'
  },
  client: {
    name: 'Sarah Johnson',
    title: 'Event Coordinator, TechCorp Inc.',
    email: 'sarah.johnson@techcorp.com',
    phone: '(555) 123-4567'
  },
  guests: 150,
  pricing: {
    subtotal: 12500,
    tax: 1620,
    taxRate: 12,
    total: 15120
  },
  specialRequests: "Please ensure dietary accommodations for 15 vegetarian guests and 8 gluten-free meals. The event will include a presentation ceremony at 9:00 PM, so we'll need microphone setup. Also, please coordinate with our AV team for lighting adjustments during the ceremony.",
  payment: {
    depositRequired: true,
    depositAmount: 7560,
    depositPercentage: 50,
    status: 'pending'
  },
  status: 'pending',
  timeline: {
    submitted: '2 hours ago'
  }
};

const BookingRequestDetails: React.FC<BookingRequestDetailsProps> = ({
  booking = defaultBooking,
  onAccept,
  onReject,
  onMessage,
  onBack
}) => {
  return (
    <div className="min-h-screen ">
      {/* Header - Now extracted to Navbar component */}
      

      {/* Main Content */}
      <div className="px-[104px] py-[32px]">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Overview Card */}
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-8">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h2 className="font-inter font-bold text-[30px] leading-9 tracking-normal mb-2">
                    {booking.title}
                  </h2>
                  <p className="font-inter font-normal text-lg leading-7 tracking-normal text-gray-600 mb-[24px]">
                    {booking.description}
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#FFB94F] text-white text-sm font-medium rounded-full">
                  <Clock className="w-3.5 h-3.5" />
                  Pending
                </span>
              </div>

              <div className="grid grid-cols-2">
                {/* Date & Time */}
                <div className='mb-[16px]'>
                  <p className="text-sm text-gray-500 mb-1">Date & Time</p>
                  <p className="font-inter font-semibold text-lg leading-7 tracking-normal text-gray-900">
                    {booking.date} • {booking.time}
                  </p>
                </div>

                {/* Client */}
                <div className='mb-[16px]'>
                  <p className="text-sm text-gray-500 mb-1">Client</p>
                  <p className="font-inter font-semibold text-lg leading-7 tracking-normal text-gray-900">
                    {booking.client.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {booking.client.title}
                  </p>
                </div>

                {/* Location */}
                <div className='mb-[16px]'>
                  <p className="text-sm text-gray-500 mb-1">Location</p>
                  <p className="font-inter font-semibold text-lg leading-7 tracking-normal text-gray-900">
                    {booking.location.venue}
                  </p>
                  <p className="text-sm text-gray-600">
                    {booking.location.address}
                  </p>
                </div>

                {/* Expected Guests */}
                <div className='mb-[16px]'>
                  <p className="text-sm text-gray-500 mb-1">Expected Guests</p>
                  <p className="font-inter font-semibold text-lg leading-7 tracking-normal text-gray-900">
                    {booking.guests} People
                  </p>
                </div>
              </div>
            </div>

            {/* Pricing Details Card */}
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-8">
              <h3 className="font-inter font-bold text-2xl leading-8 tracking-normal text-gray-900 mb-8">
                Pricing Details
              </h3>

              <div className="space-y-2 mb-8">
                <div className="flex items-center justify-between">
                  <span className="text-base text-gray-600">Subtotal</span>
                  <span className="text-base text-gray-900">
                    ${booking.pricing.subtotal.toLocaleString()}.00
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-base text-gray-600">
                    Tax ({booking.pricing.taxRate}%)
                  </span>
                  <span className="text-base text-gray-900">
                    ${booking.pricing.tax.toLocaleString()}.00
                  </span>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className="text-lg font-semibold text-gray-900">
                    Total Amount
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    ${booking.pricing.total.toLocaleString()}.00
                  </span>
                </div>
              </div>

              {/* Special Requests */}
              <div className="border-b  border-[#E5E7EB] pb-8 mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Special Requests & Notes
                </h4>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-base text-gray-700 leading-relaxed">
                    {booking.specialRequests}
                  </p>
                </div>
              </div>

              {/* Payment Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Payment Information
                </h4>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-base font-semibold text-gray-900 mb-1">
                        Deposit Required
                      </p>
                      <p className="text-sm text-gray-600">
                        {booking.payment.depositPercentage}% deposit (${booking.payment.depositAmount.toLocaleString()}) due upon acceptance
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-yellow-200 text-yellow-900 text-sm font-medium rounded-full">
                      Pending
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Actions Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 sticky top-8">
              {/* Actions */}
              <h3 className="text-xl font-bold text-gray-900 mb-6">Actions</h3>
              
              <div className="space-y-4 mb-8">
                <button
                  onClick={onAccept}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Check className="w-5 h-5" />
                  Accept Booking
                </button>

                <button
                  onClick={onReject}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#DC2626] text-white font-semibold rounded-lg hover:bg-[#941515] transition-colors"
                >
                  <X className="w-5 h-5" />
                  Reject Booking
                </button>

                <button
                  onClick={onMessage}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#B74140] text-white font-semibold rounded-lg hover:bg-[#A03A39] transition-colors"
                >
                  <MessageSquare className="w-5 h-5" />
                  Message Client
                </button>
              </div>

              {/* Client Contact */}
              <div className="mb-8 pt-6 border-t  border-[#E5E7EB]">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Client Contact
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-700">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-base">{booking.client.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-base">{booking.client.phone}</span>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="pt-6 border-t border-gray-100">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Timeline
                </h4>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Request Submitted</span>
                  <span className="text-sm text-gray-900 font-medium">
                    {booking.timeline.submitted}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingRequestDetails;