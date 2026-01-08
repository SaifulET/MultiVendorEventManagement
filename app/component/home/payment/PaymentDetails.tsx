'use client'
import React from 'react';
import { MapPin, Users, Star, Calendar, Clock, CreditCard, CalendarCheck } from 'lucide-react';
import payment from "@/public/payment.png"
const PaymentDetails = () => {
  return (
    <div className="min-h-screen ">
      <div className="">
        {/* Header */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-[32px] ">
          Payment Details
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Venue Card */}
            <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Venue Image */}
                <div className="w-full sm:w-24 h-48 sm:h-24 flex-shrink-0">
                  <img
                    src={payment.src}
                    alt="Grand Ballroom"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>

                {/* Venue Info */}
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                    <h2 className="text-lg md:text-xl font-bold text-gray-900">
                      Grand Ballroom at The Plaza
                    </h2>
                    <div className="flex flex-col items-start sm:items-end gap-1">
                      <span className="text-xs text-gray-500">Booking ID</span>
                      <span className="text-sm font-semibold text-gray-900">#VB-2024-8492</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-gray-600 text-sm mb-2">
                    <MapPin className="w-4 h-4 text-[#B74140]" />
                    <span>5th Avenue, New York, NY 10019</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-gray-700">
                      <Users className="w-4 h-4 text-[#B74140]" />
                      <span>Capacity: <strong>300</strong></span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-gray-900">4.8</span>
                      <span className="text-gray-600">(142 reviews)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Event Type Section */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <span className="text-sm text-gray-500">Event Type</span>
                    <p className="text-base font-semibold text-gray-900">Corporate Conference</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#3CCF911A] bg-opacity-10 text-[#3CCF91] w-fit">
                    <span className="w-2 h-2 bg-[#3CCF91] rounded-full"></span>
                    Confirmed
                  </span>
                </div>
              </div>

              {/* Event Date & Time */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500 flex items-center gap-1.5 mb-1">
                      
                      Event Date
                    </span>
                    <p className="text-base font-semibold text-gray-900 flex items-center gap-1"><Calendar className="w-4 h-4 text-[#B74140]" />March 15, 2024</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 flex items-center gap-1.5 mb-1">
                     
                      Event Time
                    </span>
                    <p className="text-base font-semibold text-gray-900 flex gap-1 items-center"> <Clock className="w-4 h-4 text-[#B74140]" />2:00 PM - 8:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Event Details Card */}
            <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-[#B74140]" />
                Event Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div>
                  <span className="text-sm text-gray-500 block mb-1">Event Date</span>
                  <p className="text-base font-semibold text-gray-900">Friday, March 15, 2024</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 block mb-1">Time Slot</span>
                  <p className="text-base font-semibold text-gray-900">2:00 PM - 8:00 PM</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 block mb-1">Duration</span>
                  <p className="text-base font-semibold text-gray-900">6 Hours</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 block mb-1">Expected Guests</span>
                  <p className="text-base font-semibold text-gray-900">250 People</p>
                </div>
              </div>

              {/* Special Instructions */}
              <div className="pt-4 border-t border-gray-200">
                <span className="text-sm font-semibold text-gray-700 block mb-2">
                  Special Instructions
                </span>
                <p className="text-sm text-gray-600 leading-relaxed">
                  We require a stage setup with projector and sound system for presentations. Catering will be provided by external vendor. Please ensure the venue is ready by 1:00 PM for setup and decoration.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Payment Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Payment Summary</h3>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#3CCF911A] bg-opacity-10 text-[#3CCF91]">
                  <span className="w-2 h-2 bg-[#3CCF91] rounded-full"></span>
                  Completed
                </span>
              </div>

              {/* Transaction Details */}
              <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                <div>
                  <span className="text-xs text-gray-500 block mb-1">Transaction ID</span>
                  <p className="text-sm font-mono text-gray-900">TXN-20240218-4829</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block mb-1">Payment Date & Time</span>
                  <p className="text-sm font-semibold text-gray-900">Feb 18, 2024 at 3:42 PM</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block mb-1">Payment Method</span>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-semibold text-gray-900">Visa •••• 4242</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">via Stripe</p>
                </div>
              </div>

              {/* Amount Breakdown */}
              <div className="space-y-3 mb-4">
                <h4 className="text-sm font-bold text-gray-900">Amount Breakdown</h4>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Venue Price</span>
                    <span className="font-semibold text-gray-900">$4,500.00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (8.5%)</span>
                    <span className="font-semibold text-gray-900">$401.63</span>
                  </div>
                </div>
              </div>

              {/* Total */}
              <div className="pt-4 border-t-2 border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-gray-900">Total Paid</span>
                  <span className="text-xl md:text-2xl font-bold text-[#3CCF91]">$5,126.63</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-2">
                <button className="w-full px-4 py-2.5 bg-[#B74140] text-white rounded-lg text-sm font-semibold hover:bg-[#9a3635] transition-colors">
                  Download Invoice
                </button>
                <button className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors">
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetails;