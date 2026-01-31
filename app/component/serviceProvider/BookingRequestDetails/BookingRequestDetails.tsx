'use client'
import React, { useState } from 'react';
import { Check, X, MessageSquare, MapPin, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BookingData {
  requestedDate: string;
  eventTime: string;
  eventType: string;
  duration: string;
  status: 'pending' | 'approved' | 'declined';
  client: {
    name: string;
    phone: string;
    email: string;
    avatar?: string;
    notes: string;
  };
  service: {
    title: string;
    description: string;
  };
  location: {
    venue: string;
    address: string;
  };
  pricing: {
    servicePrice: number;
    taxRate: number;
    tax: number;
    total: number;
  };
}

const defaultBooking: BookingData = {
  requestedDate: 'April 20, 2024',
  eventTime: '10:00 AM - 6:00 PM',
  eventType: 'Wedding Photography',
  duration: '8 Hours',
  status: 'pending',
  client: {
    name: 'Sarah Johnson',
    phone: '+1 (555) ***-4567',
    email: 'sarah.j***@email.com',
    notes: '"Looking for a photographer who can capture candid moments during our outdoor wedding ceremony. We prefer natural lighting and minimal editing. Please bring backup equipment as the venue is quite remote."'
  },
  service: {
    title: 'Premium Wedding Photography',
    description: 'Professional wedding photography with edited gallery'
  },
  location: {
    venue: 'Sunset Garden Venue',
    address: '1234 Garden Lane, Riverside, CA 92503'
  },
  pricing: {
    servicePrice: 1200.00,
    taxRate: 5,
    tax: 67.50,
    total: 1417.50
  }
};

const BookingRequestDetails: React.FC<{ booking?: BookingData }> = ({ 
  booking = defaultBooking 
}) => {
  const [showFullPhone, setShowFullPhone] = useState(false);
  const [showFullEmail, setShowFullEmail] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const router = useRouter();

  const handleAccept = () => {
    router.push('/serviceprovider/dashboard/bookingRequest');
  };

  const handleDecline = () => {
    router.push('/serviceprovider/dashboard/bookingRequest');
  };

  const handleMessage = () => {
    router.push('/serviceprovider/dashboard/bookingRequest/chat');
  };

  // Google Maps embed URL for the venue
  const googleMapsEmbedUrl = `https://www.google.com/maps/embed/v1/place?q=${encodeURIComponent(booking.location.address)}&key=YOUR_API_KEY&zoom=15`;

  return (
    <div className="min-h-screen ">
      
      <div className=" px-[104px] py-[32px]">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Overview Card */}
            <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Requested Date</div>
                  <div className="text-base font-semibold text-gray-900">{booking.requestedDate}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Event Time</div>
                  <div className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    {booking.eventTime}
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Pending
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Event Type</div>
                  <div className="text-base font-semibold text-gray-900">{booking.eventType}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Duration</div>
                  <div className="text-base font-semibold text-gray-900">{booking.duration}</div>
                </div>
              </div>

              {/* Client Information */}
              
            </div>

            <div className='bg-white rounded-lg border border-[#E5E7EB]'>
              <div className=" p-[24px]">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Client Information</h3>
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-lg">
                    {booking.client.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-semibold text-gray-900 mb-2">
                      {booking.client.name}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>📞</span>
                        <span>{showFullPhone ? '+1 (555) 123-4567' : booking.client.phone}</span>
                        <button 
                          onClick={() => setShowFullPhone(!showFullPhone)}
                          className="text-blue-600 hover:text-blue-700 text-xs font-medium"
                        >
                          {showFullPhone ? 'Hide' : 'Show'}
                        </button>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>✉️</span>
                        <span>{showFullEmail ? 'sarah.johnson@email.com' : booking.client.email}</span>
                        <button 
                          onClick={() => setShowFullEmail(!showFullEmail)}
                          className="text-blue-600 hover:text-blue-700 text-xs font-medium"
                        >
                          {showFullEmail ? 'Hide' : 'Show'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-sm font-semibold text-gray-900 mb-2">Client Notes</div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {booking.client.notes}
                  </p>
                </div>
              </div>
            </div>


            {/* Service Details Card */}
            <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Service Details</h3>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 text-lg">📷</span>
                </div>
                <div>
                  <div className="text-base font-semibold text-gray-900 mb-1">
                    {booking.service.title}
                  </div>
                  <div className="text-sm text-gray-600">
                    {booking.service.description}
                  </div>
                </div>
              </div>
            </div>

            {/* Event Location Card */}
            <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Event Location</h3>
              <div className="mb-3">
                <div className="text-base font-semibold text-gray-900 mb-1">
                  {booking.location.venue}
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{booking.location.address}</span>
                </div>
              </div>

              {/* Map Preview */}
              <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center mb-3 border border-gray-200 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200">
                  {/* Simple map-like grid pattern */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(90deg,_transparent_95%,_#6b7280_100%),linear-gradient(transparent_95%,_#6b7280_100%)] bg-[length:20px_20px]"></div>
                  </div>
                  {/* Location marker */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="relative">
                      <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                        <MapPin className="w-6 h-6 text-white" />
                      </div>
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-lg shadow-md text-sm font-medium whitespace-nowrap">
                        {booking.location.venue}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowMapModal(true)}
                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <ExternalLink className="w-4 h-4" />
                View in Google Maps
              </button>
            </div>
          </div>

          {/* Right Column - Pricing & Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 sticky top-6">
              {/* Pricing Summary */}
              <h3 className="text-lg font-bold text-gray-900 mb-4">Pricing Summary</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Service Price</span>
                  <span className="font-semibold text-gray-900">
                    ${booking.pricing.servicePrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">TAX ({booking.pricing.taxRate}%)</span>
                  <span className="font-semibold text-gray-900">
                    ${booking.pricing.tax.toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-gray-900">Total Payable</span>
                    <span className="text-xl font-bold text-gray-900">
                      ${booking.pricing.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 mb-6">
                <button
                  onClick={handleAccept}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                >
                  <Check className="w-5 h-5" />
                  Accept Booking
                </button>

                <button
                  onClick={handleDecline}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#B74140] hover:bg-[#9e3331] text-white font-semibold rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                  Decline Booking
                </button>

                
              </div>

              {/* Footer Note */}
              <div className="text-xs text-center text-gray-500 pt-4 border-t border-gray-200">
                By accepting, you agree to provide the service as described and follow platform guidelines.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Google Maps Modal */}
      {showMapModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 shadow-lg">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{booking.location.venue}</h3>
                <p className="text-gray-600">{booking.location.address}</p>
              </div>
              <button
                onClick={() => setShowMapModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close map"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Modal Body - Map */}
            <div className="relative h-[500px]">
              {/* Note: Replace with actual Google Maps Embed API
                  You need to get a Google Maps API key and replace YOUR_API_KEY */}
              <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0 }}
                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyDummyKeyReplaceWithRealKey&q=${encodeURIComponent(booking.location.address)}&zoom=15`}
                allowFullScreen
              ></iframe>
              
              {/* Fallback if API key is not available */}
              <div className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center hidden">
                <div className="text-center p-8">
                  <div className="text-4xl mb-4">🗺️</div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Google Maps Preview</h4>
                  <p className="text-gray-600 mb-4">
                    To view the map, you need a Google Maps API key.
                  </p>
                  <p className="text-gray-500 text-sm">
                    Address: {booking.location.address}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex justify-between items-center">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.location.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                <ExternalLink className="w-5 h-5" />
                Open in Google Maps
              </a>
              <button
                onClick={() => setShowMapModal(false)}
                className="px-6 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingRequestDetails;