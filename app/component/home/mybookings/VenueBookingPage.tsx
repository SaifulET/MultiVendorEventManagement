'use client';
import React, { useState } from 'react';
import { CheckCircle, MapPin, Wifi, Car, Utensils, Volume2, X, Calendar, Clock, MessageSquare, User, AlertTriangle, Music, CarFront, Check, Flag } from 'lucide-react';

interface Amenity {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

interface VenueData {
  name: string;
  location: string;
  address: string;
  image: string;
  price: number;
}

interface BookingData {
  date: string;
  eventDate: string;
  setupTime: string;
  guestCount: number;
  capacity: number;
  eventType: string;
}

interface PaymentData {
  method: string;
  status: string;
  refundAmount: number;
  refundPercentage: number;
}

interface BookingDetails {
  venue: VenueData;
  booking: BookingData;
  payment: PaymentData;
  specialNotes: string;
  amenities: Amenity[];
  rules: string[];
}

interface ServiceProvider {
  name: string;
  service: string;
  avatar: string;
}

const VenueBookingPage: React.FC = () => {
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);

  const serviceProvider: ServiceProvider = {
    name: "Sarah Johnson",
    service: "Event Photography",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80"
  };

  const bookingData: BookingDetails = {
    venue: {
      name: "Grand Ballroom Elite",
      location: "Downtown Convention Center, New York",
      address: "1234 Convention Ave, Downtown, New York, NY 10001",
      image: "https://images.unsplash.com/photo-1519167758481-83f29da8013c?w=800&q=80",
      price: 850.00
    },
    booking: {
      date: "March 15, 2024",
      eventDate: "March 15, 2024",
      setupTime: "9:00 AM",
      guestCount: 150,
      capacity: 200,
      eventType: "Corporate Holiday Party"
    },
    payment: {
      method: "•••• 4242",
      status: "Paid",
      refundAmount: 425.00,
      refundPercentage: 50
    },
    specialNotes: "Please arrive 30 minutes early for setup. The event location has limited parking, so please plan accordingly. Contact me if you need any specific equipment.",
    amenities: [
      { icon: Wifi, label: "Free WiFi" },
      { icon: CarFront, label: "Parking" },
      { icon: Utensils, label: "Catering" },
      { icon: Music, label: "Sound System" }
    ],
    rules: [
      "No smoking inside the venue",
      "Music must end by 11:00 PM",
      "Maximum capacity: 200 guests",
      "Decorations must be approved in advance"
    ]
  };

  const handleCancelBooking = (): void => {
    alert('Booking cancelled');
    setShowCancelModal(false);
  };
const handleViwServiceProvider = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    window.location.href = '/home/venueBooking/service-provider/sarah-johnson';
  }
  return (
    <div className="min-h-screen px-4 sm:px-6 md:px-8 lg:px-[144px]">
      <div className="px-4 sm:px-6 lg:px-[32px] py-6 lg:py-[24px]">
        {/* Header */}
        <div className="mb-6 lg:mb-[32px]">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Your Booking is Confirmed</h1>
          <p className="text-sm sm:text-base text-gray-600">Here are the details of your booked service provider</p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Booking Status */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">Booking Status</h2>
              <div className="relative px-2 sm:px-4">
                <div className="flex justify-between items-start relative">
                  {/* Background Line */}
                  <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-0"></div>
                  
                  {/* Progress Line - green line up to current state */}
                  <div className="absolute top-5 left-0 h-0.5 bg-[#3CCF91] -z-0" style={{ width: 'calc(66.66%)' }}></div>
                  
                  {/* Status Steps - Mobile: smaller spacing, Desktop: normal spacing */}
                  <div className="flex flex-col items-center relative z-10">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#3CCF91] flex items-center justify-center mb-2">
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 text-white"  />
                    </div>
                    <span className="text-xs font-semibold text-gray-900 whitespace-nowrap">Booked</span>
                  </div>

                  <div className="flex flex-col items-center relative z-10">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#3CCF91] flex items-center justify-center mb-2">
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 text-white"  />
                    </div>
                    <span className="text-xs font-semibold text-gray-900 whitespace-nowrap">Confirmed</span>
                  </div>

                  <div className="flex flex-col items-center relative z-10">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#3CCF91] flex items-center justify-center mb-2 ">
                      <Clock  className="w-4 h-4 sm:w-5 sm:h-5 text-white"/>
                    </div>
                    <span className="text-xs font-semibold text-gray-900 whitespace-nowrap">Upcoming</span>
                  </div>

                  <div className="flex flex-col items-center relative z-10">
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mb-2">
                      <Flag className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-gray-400 whitespace-nowrap">Completed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Booked Date & Time */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">Booked Date & Time</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-4">
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Date</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={bookingData.booking.eventDate}
                      readOnly
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700"
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Duration</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value="4 Hours"
                      readOnly
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700"
                    />
                    <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-2 block">Start Time</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={bookingData.booking.setupTime}
                    readOnly
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700"
                  />
                  <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Your Instructions */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Your Instructions</h2>
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <p className="text-sm text-gray-700 leading-relaxed">
                  {bookingData.specialNotes}
                </p>
              </div>
            </div>

            {/* Contact Service Provider */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Contact Service Provider</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 bg-[#B74140] hover:bg-[#a03635] text-white font-medium py-3 px-4 rounded-lg transition-colors text-sm sm:text-base">
                  <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                  Message Provider
                </button>
                <button onClick={handleViwServiceProvider} className="flex items-center justify-center gap-2 border-2 border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors text-sm sm:text-base">
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  View service provider Profile
                </button>
              </div>
            </div>

            {/* Cancel Booking */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Cancel Booking</h2>
              
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-orange-900 mb-1">Cancellation Policy</p>
                    <p className="text-xs sm:text-sm text-orange-800">
                      Free cancellation up to 24 hours before the service. 50% refund within 24 hours.
                    </p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setShowCancelModal(true)}
                className="w-full bg-[#FF5A5A] hover:bg-[#ff4040] text-white font-medium py-3 px-4 rounded-lg transition-colors text-sm sm:text-base"
              >
                Cancel Booking
              </button>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4 sm:space-y-6">
            {/* Booking Summary */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">Booking Summary</h2>
              
              {/* Service Provider */}
              <div className="flex items-center gap-3 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-gray-200">
                <img 
                  src={serviceProvider.avatar}
                  alt={serviceProvider.name}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{serviceProvider.name}</h3>
                  <p className="text-xs sm:text-sm text-gray-600">{serviceProvider.service}</p>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Date</span>
                  <span className="font-semibold text-gray-900">{bookingData.booking.eventDate}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Time</span>
                  <span className="font-semibold text-gray-900">{bookingData.booking.setupTime}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-semibold text-gray-900">4 Hours</span>
                </div>
              </div>

              {/* Total Price */}
              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm sm:text-base font-semibold text-gray-900">Total Price</span>
                  <span className="text-xl sm:text-2xl font-bold text-gray-900">${bookingData.venue.price}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 bg-[#3CCF91] text-white text-xs font-semibold px-[6px] sm:px-[8px] py-[3px] sm:py-[4px] rounded-full">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                  Paid
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">Payment Details</h2>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Price</span>
                  <span className="text-lg sm:text-xl font-bold text-gray-900">${bookingData.venue.price}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm items-center">
                  <span className="text-gray-600">Payment Method</span>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className="w-7 h-4 sm:w-8 sm:h-5 bg-gray-800 rounded flex items-center justify-center">
                      <span className="text-white text-[8px] sm:text-[10px] font-bold">VISA</span>
                    </div>
                    <span className="font-medium text-gray-900 text-xs sm:text-sm">{bookingData.payment.method}</span>
                  </div>
                </div>
                <div className="flex justify-between text-xs sm:text-sm items-center">
                  <span className="text-gray-600">Status</span>
                  <div className="flex items-center gap-1 sm:gap-1.5 text-[#3CCF91] font-semibold">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                    {bookingData.payment.status}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-4 sm:p-6 mx-2">
            <div className="flex justify-between items-start mb-3 sm:mb-4">
              <h3 className="text-lg sm:text-xl font-semibold">Cancel Booking?</h3>
              <button 
                onClick={() => setShowCancelModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
            <p className="text-sm sm:text-base text-gray-600 mb-4">
              Are you sure you want to cancel this booking? You will receive a refund of ${bookingData.payment.refundAmount.toFixed(2)} ({bookingData.payment.refundPercentage}%).
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button 
                onClick={() => setShowCancelModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg hover:bg-gray-50 text-sm sm:text-base"
              >
                Keep Booking
              </button>
              <button 
                onClick={handleCancelBooking}
                className="flex-1 bg-[#FF5A5A] text-white font-medium py-2 px-4 rounded-lg hover:bg-[#ff4040] text-sm sm:text-base"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VenueBookingPage;