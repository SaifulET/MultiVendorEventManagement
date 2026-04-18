'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Check,
  X,
  MessageSquare,
  Mail,
  Phone,
  AlertCircle,
  Clock,
  LoaderCircle,
} from 'lucide-react';
import { useParams } from 'next/navigation';

import { getApiErrorMessage } from '@/lib/api';
import {
  approveVenueProviderBooking,
  fetchVenueProviderBookingDetails,
  formatBookingDate,
  formatBookingTime,
  formatCurrencyMinor,
  formatDateTimeLabel,
  formatPaymentStatus,
  getBookingStatus,
  getBookingStatusLabel,
  getCustomerEmail,
  getCustomerName,
  getCustomerPhone,
  getVenueName,
  type VenueProviderBooking,
} from '@/lib/venue-provider-bookings';
import { rejectVenueProviderBooking } from '@/lib/venue-provider-bookings';

interface BookingRequestDetailsProps {
  onAccept?: () => void;
  onReject?: () => void;
  onMessage?: () => void;
  onBack?: () => void;
}

const getStatusBadgeClasses = (status: 'pending' | 'approved' | 'rejected') => {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-[#FFB94F] text-white';
  }
};

const getPaymentBadgeClasses = (status: 'pending' | 'approved' | 'rejected') => {
  switch (status) {
    case 'approved':
      return 'bg-green-200 text-green-900';
    case 'rejected':
      return 'bg-red-200 text-red-900';
    default:
      return 'bg-yellow-200 text-yellow-900';
  }
};

const getBookingSummary = (booking: VenueProviderBooking) => {
  const venueName = getVenueName(booking);
  const customerName = getCustomerName(booking);
  const bookingStatus = getBookingStatus(booking);
  const paymentCurrency = booking.pricing?.currency ?? 'GBP';

  return {
    bookingStatus,
    client: {
      email: getCustomerEmail(booking),
      name: customerName,
      phone: getCustomerPhone(booking),
      title: 'Customer',
    },
    date: formatBookingDate(booking.bookingDate),
    description: `${customerName} requested a venue booking for ${venueName}.`,
    location: {
      address: booking.location?.trim() || 'Location unavailable',
      venue: venueName,
    },
    payment: {
      detail: `${formatPaymentStatus(booking.payment?.status)} • Total ${formatCurrencyMinor(
        booking.pricing?.totalAmount,
        paymentCurrency
      )}`,
      title: 'Payment Status',
    },
    pricing: {
      subtotal: formatCurrencyMinor(booking.pricing?.subtotal, paymentCurrency),
      tax: formatCurrencyMinor(booking.pricing?.taxAmount, paymentCurrency),
      total: formatCurrencyMinor(booking.pricing?.totalAmount, paymentCurrency),
      unitAmount: formatCurrencyMinor(booking.pricing?.unitAmount, paymentCurrency),
    },
    specialRequests: booking.specialInstructions?.trim() || 'No special requests were provided.',
    statusLabel: getBookingStatusLabel(booking),
    time: formatBookingTime(booking.hours, booking.durationHours),
    timeline: {
      submitted: formatDateTimeLabel(booking.createdAt),
    },
    title: venueName,
  };
};

export default function BookingRequestDetails({
  onAccept,
  onReject,
  onMessage,
}: BookingRequestDetailsProps) {
  const params = useParams<{ id: string }>();
  const bookingId = typeof params?.id === 'string' ? params.id : '';
  const [booking, setBooking] = useState<VenueProviderBooking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<'approve' | 'reject' | null>(null);

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

        const response = await fetchVenueProviderBookingDetails(bookingId);

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

  const bookingSummary = useMemo(() => {
    if (!booking) {
      return null;
    }

    return getBookingSummary(booking);
  }, [booking]);

  const handleAction = async (action: 'approve' | 'reject') => {
    if (!bookingId) {
      return;
    }

    try {
      setActionLoading(action);
      setError('');

      if (action === 'approve') {
        await approveVenueProviderBooking(bookingId);

        if (onAccept) {
          onAccept();
          return;
        }
      } else {
        await rejectVenueProviderBooking(bookingId);

        if (onReject) {
          onReject();
          return;
        }
      }

      const response = await fetchVenueProviderBookingDetails(bookingId);
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
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-8 text-center text-gray-500">
          <div className="flex items-center justify-center gap-3">
            <LoaderCircle className="w-5 h-5 animate-spin" />
            Loading booking details...
          </div>
        </div>
      </div>
    );
  }

  if (error || !booking || !bookingSummary) {
    return (
      <div className="min-h-screen px-[104px] py-[32px]">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center text-red-700">
          {error || 'Booking details are unavailable right now.'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <div className="px-[104px] py-[32px]">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-8">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h2 className="font-inter font-bold text-[30px] leading-9 tracking-normal mb-2">
                    {bookingSummary.title}
                  </h2>
                  <p className="font-inter font-normal text-lg leading-7 tracking-normal text-gray-600 mb-[24px]">
                    {bookingSummary.description}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-full ${getStatusBadgeClasses(
                    bookingSummary.bookingStatus
                  )}`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  {bookingSummary.statusLabel}
                </span>
              </div>

              <div className="grid grid-cols-2">
                <div className="mb-[16px]">
                  <p className="text-sm text-gray-500 mb-1">Date & Time</p>
                  <p className="font-inter font-semibold text-lg leading-7 tracking-normal text-gray-900">
                    {bookingSummary.date} • {bookingSummary.time}
                  </p>
                </div>

                <div className="mb-[16px]">
                  <p className="text-sm text-gray-500 mb-1">Client</p>
                  <p className="font-inter font-semibold text-lg leading-7 tracking-normal text-gray-900">
                    {bookingSummary.client.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {bookingSummary.client.title}
                  </p>
                </div>

                <div className="mb-[16px]">
                  <p className="text-sm text-gray-500 mb-1">Location</p>
                  <p className="font-inter font-semibold text-lg leading-7 tracking-normal text-gray-900">
                    {bookingSummary.location.venue}
                  </p>
                  <p className="text-sm text-gray-600">
                    {bookingSummary.location.address}
                  </p>
                </div>

                <div className="mb-[16px]">
                  <p className="text-sm text-gray-500 mb-1">Expected Guests</p>
                  <p className="font-inter font-semibold text-lg leading-7 tracking-normal text-gray-900">
                    {typeof booking.guest_count === 'number' ? booking.guest_count : 0} People
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#E5E7EB] rounded-xl p-8">
              <h3 className="font-inter font-bold text-2xl leading-8 tracking-normal text-gray-900 mb-8">
                Pricing Details
              </h3>

              <div className="space-y-2 mb-8">
                <div className="flex items-center justify-between">
                  <span className="text-base text-gray-600">Unit Amount</span>
                  <span className="text-base text-gray-900">
                    {bookingSummary.pricing.unitAmount}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-base text-gray-600">Subtotal</span>
                  <span className="text-base text-gray-900">
                    {bookingSummary.pricing.subtotal}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-base text-gray-600">Tax</span>
                  <span className="text-base text-gray-900">
                    {bookingSummary.pricing.tax}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className="text-lg font-semibold text-gray-900">
                    Total Amount
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    {bookingSummary.pricing.total}
                  </span>
                </div>
              </div>

              <div className="border-b border-[#E5E7EB] pb-8 mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Special Requests & Notes
                </h4>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-base text-gray-700 leading-relaxed">
                    {bookingSummary.specialRequests}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Payment Information
                </h4>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-base font-semibold text-gray-900 mb-1">
                        {bookingSummary.payment.title}
                      </p>
                      <p className="text-sm text-gray-600">
                        {bookingSummary.payment.detail}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 text-sm font-medium rounded-full ${getPaymentBadgeClasses(
                        bookingSummary.bookingStatus
                      )}`}
                    >
                      {formatPaymentStatus(booking.payment?.status)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 sticky top-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Actions</h3>

              <div className="space-y-4 mb-8">
                {bookingSummary.bookingStatus === 'pending' ? (
                  <>
                    <button
                      onClick={() => handleAction('approve')}
                      disabled={actionLoading !== null}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {actionLoading === 'approve' ? (
                        <LoaderCircle className="w-5 h-5 animate-spin" />
                      ) : (
                        <Check className="w-5 h-5" />
                      )}
                      Accept Booking
                    </button>

                    <button
                      onClick={() => handleAction('reject')}
                      disabled={actionLoading !== null}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#DC2626] text-white font-semibold rounded-lg hover:bg-[#941515] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {actionLoading === 'reject' ? (
                        <LoaderCircle className="w-5 h-5 animate-spin" />
                      ) : (
                        <X className="w-5 h-5" />
                      )}
                      Reject Booking
                    </button>
                  </>
                ) : null}

                <button
                  onClick={onMessage}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#B74140] text-white font-semibold rounded-lg hover:bg-[#A03A39] transition-colors"
                >
                  <MessageSquare className="w-5 h-5" />
                  Message Client
                </button>
              </div>

              <div className="mb-8 pt-6 border-t border-[#E5E7EB]">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Client Contact
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-700">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-base">{bookingSummary.client.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-base">{bookingSummary.client.phone}</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Timeline
                </h4>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Request Submitted</span>
                  <span className="text-sm text-gray-900 font-medium">
                    {bookingSummary.timeline.submitted}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
