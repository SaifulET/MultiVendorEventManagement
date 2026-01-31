'use client';
import React, { useState } from 'react';
import { CheckCircle, MapPin, Wifi, Car, Utensils, Volume2, Calendar, Users, Clock, X, Check, Flag, CarFront, Music, MessageSquare } from 'lucide-react';
import bg from "@/public/bgforvanue.svg";
import map from "@/public/map.svg";
import { useRouter } from 'next/navigation';

const VenueBookingPage = () => {
  const [showCancelModal, setShowCancelModal] = useState(false);

  const bookingData = {
    venue: {
      name: "Grand Ballroom Elite",
      location: "Downtown Convention Center, New York",
      address: "1234 Convention Ave, Downtown, New York, NY 10001",
      image: "https://images.unsplash.com/photo-1519167758481-83f29da8013c?w=800&q=80",
      price: 2500.00
    },
    booking: {
      date: "December 10, 2024",
      eventDate: "Wednesday, December 25, 2024",
      setupTime: "5:00 PM - 6:00 PM",
      guestCount: 150,
      capacity: 200,
      eventType: "Corporate Holiday Party"
    },
    payment: {
      method: "•••• 4242",
      status: "Paid",
      refundAmount: 2268.00,
      refundPercentage: 80
    },
    specialNotes: "Need projector setup for presentations. Dietary restrictions: 10 vegetarian, 5 vegan meals required.",
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

  const router = useRouter();
const handleVenueDetails = () => {
router.push('/home/viewvenueprofile/details');

}
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Image Section */}
      <div className="relative h-[384px]  w-full overflow-hidden">
        <img 
          src={bg.src}
          alt="Grand Ballroom Elite"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/20 flex flex-col justify-end p-6 md:p-8">
          <span className="inline-block w-fit bg-[#3CCF91] text-white text-xs font-semibold px-3 py-1 rounded mb-3">
            Confirmed
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            {bookingData.venue.name}
          </h1>
          <div className="flex items-center text-white/90 text-sm md:text-base">
            <MapPin className="w-4 h-4 mr-2" />
            {bookingData.venue.location}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className=" px-[24px] py-[24px] md:px-[104px] md:py-[32px]">
      <div className="bg-white rounded-lg shadow-sm p-[12px] md:p-[25px]  mb-[32px]">
          <h2 className="font-inter font-semibold text-[18px] leading-[1] tracking-normal mb-[24px]">Booking Progress</h2>
          <div className="relative px-4">
            <div className="flex justify-between items-start relative">
              {/* Background Line - positioned absolutely behind circles */}
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-0"></div>
              
              {/* Progress Line - green line up to current state */}
              <div className="absolute top-5 left-0 h-0.5 bg-[#3CCF91] -z-0" style={{ width: 'calc(66.66%)' }}></div>
              
              {/* Booked */}
              <div className="flex flex-col items-center relative z-10">
                <div className="w-10 h-10 rounded-full bg-[#3CCF91] flex items-center justify-center mb-2">
                  
                  <Check className="w-5 h-5 text-white"  />
                </div>
                <span className="text-xs md:text-sm font-semibold text-gray-900 whitespace-nowrap">Booked</span>
                <span className="text-xs text-gray-500 whitespace-nowrap">Dec 10, 2024</span>
              </div>

              {/* Confirmed */}
              <div className="flex flex-col items-center relative z-10">
                <div className="w-10 h-10 rounded-full bg-[#3CCF91] flex items-center justify-center mb-2">
                  <Check className="w-5 h-5 text-white"  />
                </div>
                <span className="text-xs md:text-sm font-semibold text-gray-900 whitespace-nowrap">Confirmed</span>
                <span className="text-xs text-gray-500 whitespace-nowrap">Dec 11, 2024</span>
              </div>

              {/* Upcoming - Current State */}
              <div className="flex flex-col items-center relative z-10">
                <div className="w-10 h-10 rounded-full bg-[#3CCF91] flex items-center justify-center mb-2 ">
                 <Clock  className="w-5 h-5 text-white"/>
                </div>
                <span className="text-xs md:text-sm font-semibold text-gray-900 whitespace-nowrap">Upcoming</span>
                <span className="text-xs text-gray-500 whitespace-nowrap">Dec 25, 2024</span>
              </div>

              {/* Completed */}
              <div className="flex flex-col items-center relative z-10">
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mb-2">
                  <Flag  className="w-5 h-5 "/>
                </div>
                <span className="text-xs md:text-sm font-semibold text-gray-400 whitespace-nowrap">Completed</span>
                <span className="text-xs text-gray-400 whitespace-nowrap">Pending</span>
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Summary */}
            <div className="bg-white rounded-lg shadow-sm p-[12px] md:p-[32px] mb-[32px]">
              <h2 className="text-lg font-semibold mb-4">Booking Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Booking Date</p>
                  <p className="text-sm font-medium">{bookingData.booking.date}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Guests Count</p>
                  <p className="text-sm font-medium">{bookingData.booking.guestCount} guests</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Event Type</p>
                  <p className="text-sm font-medium">{bookingData.booking.eventType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Venue Capacity</p>
                  <p className="text-sm font-medium">{bookingData.booking.capacity} guests</p>
                </div>
              </div>
            </div>

            {/* Event Details */}
            <div className="bg-white rounded-lg shadow-sm p-[12px] md:p-[32px] mb-[32px]">
              <h2 className="text-lg font-semibold mb-4">Event Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Event Date</p>
                  <p className="text-sm font-medium">{bookingData.booking.eventDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Setup Time</p>
                  <p className="text-sm font-medium">{bookingData.booking.setupTime}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Special Notes</p>
                <p className="text-sm text-gray-700">{bookingData.specialNotes}</p>
              </div>
            </div>

            {/* Venue Information */}
            <div className="bg-white rounded-lg shadow-sm p-[12px] md:p-[32px] mb-[32px]">
              <h2 className="text-lg font-semibold mb-4">Venue Information</h2>
              <h3 className="font-semibold mb-2">{bookingData.venue.name}</h3>
              <div className="flex items-start text-sm text-gray-600 mb-4">
                <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>{bookingData.venue.address}</span>
              </div>
              
              <img 
                src={map.src}
                alt="Venue"
                className="w-full h-48 object-cover rounded-lg mb-4"
              />

              {/* Amenities */}
              <div className="mb-4">
                <h4 className="font-semibold mb-3">Amenities</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {bookingData.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-700">
                      <amenity.icon className="w-4 h-4 mr-2 text-blue-600" />
                      {amenity.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Rules */}
              <div>
                <h4 className="font-semibold mb-3">Rules & Policies</h4>
                <ul className="space-y-2">
                  {bookingData.rules.map((rule, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start">
                      <span className="mr-2">•</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Payment Details */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Payment Details</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Venue Price</span>
                  <span className="font-semibold">${bookingData.venue.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-gray-600">Payment Method</span>
                  <div className="flex items-center">
                    <div className="w-8 h-5 bg-gray-800 rounded mr-2"></div>
                    <span className="font-medium">{bookingData.payment.method}</span>
                  </div>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-gray-600">Status</span>
                  <span className="text-[#3CCF91] font-semibold">{bookingData.payment.status}</span>
                </div>
              </div>
            </div>

            {/* Contact Venue */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Contact Venue</h2>
              <button onClick={()=>{router.push("/home/dashboard/chat")}} className="w-full bg-[#B74140] hover:bg-[#a03635] text-white font-medium py-3 px-4 rounded-lg mb-3 transition-colors flex items-center justify-center gap-1">
                <MessageSquare size={16} strokeWidth={2.25} /> Message provider
              </button>
              <button onClick={handleVenueDetails} className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors">
                👤 View Venue Profile
              </button>
            </div>

            {/* Cancel Booking */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Cancel Booking</h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-xs font-semibold text-yellow-800 mb-1">Cancellation Policy</p>
                <p className="text-xs text-yellow-700">
                  Cancel 48 hours before event for 80% refund. Cancel 24 hours before for 50% refund.
                </p>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-1">Refund Amount</p>
                <p className="text-2xl font-bold text-[#3CCF91]">
                  ${bookingData.payment.refundAmount.toFixed(2)} ({bookingData.payment.refundPercentage}%)
                </p>
              </div>
              <button 
                onClick={() => setShowCancelModal(true)}
                className="w-full bg-[#FF5A5A] hover:bg-[#ff4040] text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Cancel Booking
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold">Cancel Booking?</h3>
              <button 
                onClick={() => setShowCancelModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Are you sure you want to cancel this booking? You will receive a refund of ${bookingData.payment.refundAmount.toFixed(2)} ({bookingData.payment.refundPercentage}%).
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowCancelModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg hover:bg-gray-50"
              >
                Keep Booking
              </button>
              <button 
                onClick={() => {
                  alert('Booking cancelled');
                  setShowCancelModal(false);
                }}
                className="flex-1 bg-[#FF5A5A] text-white font-medium py-2 px-4 rounded-lg hover:bg-[#ff4040]"
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