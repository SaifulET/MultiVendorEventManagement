'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Check, X, MessageSquare, MapPin, ExternalLink, LoaderCircle } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

import { getApiErrorMessage } from '@/lib/api';
import {
  approveEventPlannerBooking,
  fetchEventPlannerBookingDetails,
  formatBookingDate,
  formatBookingTime,
  formatCurrencyAmount,
  getBookingStatus,
  getBookingStatusLabel,
  getCustomerAvatar,
  getCustomerEmail,
  getCustomerName,
  getCustomerPhone,
  getPlannerDescription,
  getPlannerName,
  getPlannerType,
  rejectEventPlannerBooking,
  type EventPlannerBooking,
} from '@/lib/event-planner-bookings';

interface BookingData {
  requestedDate: string;
  eventTime: string;
  eventType: string;
  duration: string;
  status: 'pending' | 'approved' | 'rejected';
  client: {
    name: string;
    phone: string;
    email: string;
    maskedPhone: string;
    maskedEmail: string;
    avatar: string;
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
    currency: string;
  };
}

const maskPhone = (phone: string) => {
  const trimmed = phone.trim();

  if (!trimmed || trimmed === 'Phone unavailable') {
    return trimmed || 'Phone unavailable';
  }

  const digits = trimmed.replace(/\D/g, '');

  if (digits.length < 4) {
    return trimmed;
  }

  const lastFour = digits.slice(-4);
  const prefix = trimmed.startsWith('+') ? '+' : '';
  return `${prefix}${'*'.repeat(Math.max(digits.length - 4, 3))}${lastFour}`;
};

const maskEmail = (email: string) => {
  const trimmed = email.trim();

  if (!trimmed || trimmed === 'Email unavailable' || !trimmed.includes('@')) {
    return trimmed || 'Email unavailable';
  }

  const [name, domain] = trimmed.split('@');
  if (!name || !domain) {
    return trimmed;
  }

  const visible = name.slice(0, Math.min(3, name.length));
  return `${visible}${'*'.repeat(Math.max(name.length - visible.length, 3))}@${domain}`;
};

const buildBookingData = (booking: EventPlannerBooking): BookingData => {
  const subtotal = booking.pricing?.subtotal ?? 0;
  const taxAmount = booking.pricing?.taxAmount ?? 0;
  const fullPhone = getCustomerPhone(booking);
  const fullEmail = getCustomerEmail(booking);
  const locationAddress =
    booking.location?.trim() ||
    booking.provider?.eventPlanner?.address?.trim() ||
    'Location unavailable';

  return {
    client: {
      avatar: getCustomerAvatar(booking),
      email: fullEmail,
      maskedEmail: maskEmail(fullEmail),
      maskedPhone: maskPhone(fullPhone),
      name: getCustomerName(booking),
      notes: booking.specialInstructions?.trim() || 'No client notes provided.',
      phone: fullPhone,
    },
    duration:
      typeof booking.durationHours === 'number' && booking.durationHours > 0
        ? `${booking.durationHours} Hour${booking.durationHours > 1 ? 's' : ''}`
        : 'Duration unavailable',
    eventTime: formatBookingTime(booking.hours, booking.durationHours),
    eventType: getPlannerType(booking),
    location: {
      address: locationAddress,
      venue: locationAddress,
    },
    pricing: {
      currency: booking.pricing?.currency ?? 'GBP',
      servicePrice: booking.pricing?.unitAmount ?? 0,
      tax: taxAmount,
      taxRate: subtotal > 0 ? Number(((taxAmount / subtotal) * 100).toFixed(2)) : 0,
      total: booking.pricing?.totalAmount ?? 0,
    },
    requestedDate: formatBookingDate(booking.bookingDate),
    service: {
      description: getPlannerDescription(booking),
      title: getPlannerName(booking),
    },
    status: getBookingStatus(booking),
  };
};

const getStatusBadgeClasses = (status: BookingData['status']) => {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-yellow-100 text-yellow-800';
  }
};

export default function BookingRequestDetails() {
  const [showFullPhone, setShowFullPhone] = useState(false);
  const [showFullEmail, setShowFullEmail] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [booking, setBooking] = useState<EventPlannerBooking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<'approve' | 'reject' | null>(null);
  const params = useParams<{ id: string }>();
  const bookingId = typeof params?.id === 'string' ? params.id : '';
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      if (!bookingId) {
        setError('Booking ID not found.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError('');

        const response = await fetchEventPlannerBookingDetails(bookingId);

        if (!isMounted) {
          return;
        }

        setBooking(response.data ?? null);
      } catch (fetchError) {
        if (!isMounted) {
          return;
        }

        setError(getApiErrorMessage(fetchError));
        setBooking(null);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initialize();

    return () => {
      isMounted = false;
    };
  }, [bookingId]);

  const bookingData = useMemo(() => (booking ? buildBookingData(booking) : null), [booking]);

  const handleAction = async (action: 'approve' | 'reject') => {
    if (!bookingId) {
      return;
    }

    try {
      setActionLoading(action);
      setError('');

      if (action === 'approve') {
        await approveEventPlannerBooking(bookingId);
      } else {
        await rejectEventPlannerBooking(bookingId);
      }

      const response = await fetchEventPlannerBookingDetails(bookingId);
      setBooking(response.data ?? null);
    } catch (actionError) {
      setError(getApiErrorMessage(actionError));
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen px-[104px] py-[32px]">
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 text-center text-gray-500">
          <div className="flex items-center justify-center gap-3">
            <LoaderCircle className="w-5 h-5 animate-spin" />
            Loading booking details...
          </div>
        </div>
      </div>
    );
  }

  if (error || !booking || !bookingData) {
    return (
      <div className="min-h-screen px-[104px] py-[32px]">
        <div className="bg-red-50 rounded-lg border border-red-200 p-6 text-center text-red-700">
          {error || 'Booking details are unavailable right now.'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <div className=" px-[104px] py-[32px]">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Requested Date</div>
                  <div className="text-base font-semibold text-gray-900">{bookingData.requestedDate}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Event Time</div>
                  <div className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    {bookingData.eventTime}
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClasses(
                        bookingData.status
                      )}`}
                    >
                      {getBookingStatusLabel(booking)}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Event Type</div>
                  <div className="text-base font-semibold text-gray-900">{bookingData.eventType}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Duration</div>
                  <div className="text-base font-semibold text-gray-900">{bookingData.duration}</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-[#E5E7EB]">
              <div className=" p-[24px]">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Client Information</h3>
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-lg">
                    <img
                      src={bookingData.client.avatar}
                      alt={bookingData.client.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-semibold text-gray-900 mb-2">
                      {bookingData.client.name}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>Phone:</span>
                        <span>{showFullPhone ? bookingData.client.phone : bookingData.client.maskedPhone}</span>
                        <button
                          onClick={() => setShowFullPhone((value) => !value)}
                          className="text-blue-600 hover:text-blue-700 text-xs font-medium"
                        >
                          {showFullPhone ? 'Hide' : 'Show'}
                        </button>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>Email:</span>
                        <span>{showFullEmail ? bookingData.client.email : bookingData.client.maskedEmail}</span>
                        <button
                          onClick={() => setShowFullEmail((value) => !value)}
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
                    {bookingData.client.notes}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Service Details</h3>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 text-lg">E</span>
                </div>
                <div>
                  <div className="text-base font-semibold text-gray-900 mb-1">
                    {bookingData.service.title}
                  </div>
                  <div className="text-sm text-gray-600">
                    {bookingData.service.description}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Event Location</h3>
              <div className="mb-3">
                <div className="text-base font-semibold text-gray-900 mb-1">
                  {bookingData.location.venue}
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{bookingData.location.address}</span>
                </div>
              </div>

              <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center mb-3 border border-gray-200 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200">
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(90deg,_transparent_95%,_#6b7280_100%),linear-gradient(transparent_95%,_#6b7280_100%)] bg-[length:20px_20px]"></div>
                  </div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="relative">
                      <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                        <MapPin className="w-6 h-6 text-white" />
                      </div>
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-lg shadow-md text-sm font-medium whitespace-nowrap">
                        {bookingData.location.venue}
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

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 sticky top-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Pricing Summary</h3>

              {error ? (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Service Price</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrencyAmount(bookingData.pricing.servicePrice, bookingData.pricing.currency)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">TAX ({bookingData.pricing.taxRate}%)</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrencyAmount(bookingData.pricing.tax, bookingData.pricing.currency)}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-gray-900">Total Payable</span>
                    <span className="text-xl font-bold text-gray-900">
                      {formatCurrencyAmount(bookingData.pricing.total, bookingData.pricing.currency)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {bookingData.status === 'pending' ? (
                  <>
                    <button
                      onClick={() => handleAction('approve')}
                      disabled={actionLoading !== null}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {actionLoading === 'approve' ? <LoaderCircle className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                      Accept Booking
                    </button>

                    <button
                      onClick={() => handleAction('reject')}
                      disabled={actionLoading !== null}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#B74140] hover:bg-[#9e3331] text-white font-semibold rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {actionLoading === 'reject' ? <LoaderCircle className="w-5 h-5 animate-spin" /> : <X className="w-5 h-5" />}
                      Decline Booking
                    </button>
                  </>
                ) : null}

                <button
                  onClick={() => router.push('/eventPlanner/dashboard/bookingRequest/chat')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#B74140] hover:bg-[#9e3331] text-white font-semibold rounded-lg transition-colors"
                >
                  <MessageSquare className="w-5 h-5" />
                  Message Client
                </button>
              </div>

              <div className="text-xs text-center text-gray-500 pt-4 border-t border-gray-200">
                By accepting, you agree to provide the service as described and follow platform guidelines.
              </div>
            </div>
          </div>
        </div>
      </div>

      {showMapModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden">
            <div className="flex items-center justify-between p-6 shadow-lg">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{bookingData.location.venue}</h3>
                <p className="text-gray-600">{bookingData.location.address}</p>
              </div>
              <button
                onClick={() => setShowMapModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close map"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="relative h-[500px]">
              <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0 }}
                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyDummyKeyReplaceWithRealKey&q=${encodeURIComponent(bookingData.location.address)}&zoom=15`}
                allowFullScreen
              ></iframe>

              <div className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center hidden">
                <div className="text-center p-8">
                  <div className="text-4xl mb-4">Map</div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Google Maps Preview</h4>
                  <p className="text-gray-600 mb-4">
                    To view the map, you need a Google Maps API key.
                  </p>
                  <p className="text-gray-500 text-sm">
                    Address: {bookingData.location.address}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-between items-center">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(bookingData.location.address)}`}
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
}
