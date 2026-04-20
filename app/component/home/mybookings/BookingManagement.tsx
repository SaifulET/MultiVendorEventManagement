"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, Clock, Clock4, Eye, LoaderCircle, MapPin, Receipt, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { formatHourRange } from '@/lib/booking';
import { api, getApiErrorMessage } from '@/lib/api';
import { formatDateDDMMYY } from '@/lib/date';

type BookingStatus = 'pending' | 'upcoming' | 'completed' | 'cancelled';
type BookingType = 'venue' | 'service' | 'event';
type TabId = 'all' | BookingStatus;

interface BookingListMeta {
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
  page: number;
  total: number;
  totalPages: number;
}

interface ApiBooking {
  _id: string;
  bookingDate?: string;
  createdAt?: string;
  durationHours?: number;
  guest_count?: number;
  hours?: number[];
  location?: string;
  payment?: {
    status?: string;
  };
  pricing?: {
    currency?: string;
    totalAmount?: number;
  };
  providerId?: string;
  specialInstructions?: string;
  status?: string;
  targetId?: string;
  targetType?: string;
  updatedAt?: string;
}

interface BookingListResponse {
  success: boolean;
  meta?: BookingListMeta;
  data?: ApiBooking[];
}

interface BookingCard {
  createdAt?: string;
  dateLabel: string;
  id: string;
  location: string;
  paymentAmountLabel: string;
  paymentStatusLabel: string;
  rawStatus: string;
  status: BookingStatus;
  timeLabel: string;
  title: string;
  type: BookingType;
}

const ITEMS_PER_PAGE = 10;

const tabs: Array<{ id: TabId; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'pending', label: 'Pending' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
];

const bookingTypeLabels: Record<BookingType, string> = {
  event: 'Event Planner',
  service: 'Service Provider',
  venue: 'Venue',
};

const formatMinorCurrencyAmount = (amount?: number, currency = 'GBP') => {
  if (typeof amount !== 'number' || !Number.isFinite(amount)) {
    return 'Price unavailable';
  }

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount / 100);
  } catch {
    return `${currency} ${(amount / 100).toFixed(2)}`;
  }
};

const toBookingType = (targetType?: string): BookingType => {
  switch (targetType?.trim().toLowerCase()) {
    case 'venue':
      return 'venue';
    case 'service':
      return 'service';
    default:
      return 'event';
  }
};

const toBookingStatus = (status?: string, bookingDate?: string): BookingStatus => {
  const normalizedStatus = status?.trim().toLowerCase() ?? '';

  if (normalizedStatus === 'completed') {
    return 'completed';
  }

  if (['cancelled', 'canceled', 'declined', 'rejected'].includes(normalizedStatus)) {
    return 'cancelled';
  }

  if (normalizedStatus === 'pending') {
    return 'pending';
  }

  if (bookingDate) {
    const parsedDate = new Date(`${bookingDate}T00:00:00`);
    if (!Number.isNaN(parsedDate.getTime())) {
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

      if (parsedDate >= todayStart) {
        return 'upcoming';
      }
    }
  }

  return 'completed';
};

const buildBookingTitle = (type: BookingType, bookingId: string) =>
  `${bookingTypeLabels[type]} Booking #${bookingId.slice(-6).toUpperCase()}`;

const getReviewPath = (booking: BookingCard) => {
  if (booking.type === 'event') {
    return `/pages/reviewEventPlanner/${booking.id}`;
  }

  return `/pages/reviewProvider/${booking.id}`;
};

const buildQueryStatus = (tab: TabId) => {
  switch (tab) {
    case 'pending':
      return 'pending';
    case 'upcoming':
      return 'approved';
    case 'completed':
      return 'completed';
    case 'cancelled':
      return 'cancelled';
    default:
      return null;
  }
};

const normalizeBooking = (booking: ApiBooking): BookingCard => {
  const type = toBookingType(booking.targetType);
  const status = toBookingStatus(booking.status, booking.bookingDate);
  const currency = booking.pricing?.currency ?? 'GBP';
  const paymentStatus = booking.payment?.status?.replace(/_/g, ' ').trim() || 'Payment pending';
  const timeLabel =
    Array.isArray(booking.hours) && booking.hours.length > 0
      ? formatHourRange(booking.hours)
      : booking.durationHours
        ? `${booking.durationHours} hour${booking.durationHours > 1 ? 's' : ''}`
        : 'Time unavailable';

  return {
    createdAt: booking.createdAt,
    dateLabel: formatDateDDMMYY(booking.bookingDate, 'Date unavailable'),
    id: booking._id,
    location: booking.location?.trim() || 'Location unavailable',
    paymentAmountLabel: formatMinorCurrencyAmount(booking.pricing?.totalAmount, currency),
    paymentStatusLabel: paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1),
    rawStatus: booking.status?.trim() || 'unknown',
    status,
    timeLabel,
    title: buildBookingTitle(type, booking._id),
    type,
  };
};

export default function BookingManagement() {
  const [activeTab, setActiveTab] = useState<TabId>('all');
  const [bookings, setBookings] = useState<BookingCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<BookingListMeta | null>(null);
  const router = useRouter();

  const handleReview = (booking: BookingCard) => {
    if (booking.status !== 'completed') {
      return;
    }

    router.push(getReviewPath(booking));
  };

  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  useEffect(() => {
    let isMounted = true;

    const fetchBookings = async () => {
      try {
        setIsLoading(true);
        setError('');

        const params = new URLSearchParams({
          limit: String(ITEMS_PER_PAGE),
          page: String(page),
          sortBy: 'createdAt',
          sortOrder: 'desc',
        });
        const queryStatus = buildQueryStatus(activeTab);

        if (queryStatus) {
          params.set('status', queryStatus);
        }

        const response = await api.get<BookingListResponse>(`/api/v1/bookings/my?${params.toString()}`);

        if (!isMounted) {
          return;
        }

        const nextBookings = (response.data.data ?? []).map(normalizeBooking);
        const normalizedBookings =
          activeTab === 'all'
            ? nextBookings
            : nextBookings.filter((booking) => booking.status === activeTab);

        setBookings(normalizedBookings);
        setMeta(response.data.meta ?? null);
      } catch (fetchError) {
        if (!isMounted) {
          return;
        }

        setBookings([]);
        setMeta(null);
        setError(getApiErrorMessage(fetchError));
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchBookings();

    return () => {
      isMounted = false;
    };
  }, [activeTab, page]);

  const sortedBookings = useMemo(
    () =>
      [...bookings].sort((left, right) => {
        const leftTime = left.createdAt ? new Date(left.createdAt).getTime() : 0;
        const rightTime = right.createdAt ? new Date(right.createdAt).getTime() : 0;
        return rightTime - leftTime;
      }),
    [bookings]
  );

  const getStatusButton = (status: BookingStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-[#FFF4E5] text-[#FFB94F]">
            <Clock4 className="w-4 h-4" /> &nbsp;Pending
          </span>
        );
      case 'upcoming':
        return (
          <span className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-[#FEE5E5] text-[#B74140]">
            <Clock4 className="w-4 h-4" /> &nbsp;Upcoming
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-[#E5F9F0] text-[#3CCF91]">
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-[#FFE5E5] text-[#FF5A5A]">
            Cancelled
          </span>
        );
    }
  };

  const getActionButton = (booking: BookingCard) => {
    if (booking.status === 'completed') {
      return (
        <button
          onClick={() => handleReview(booking)}
          className="px-4 py-2 bg-[#3CCF91] text-white rounded-lg text-sm font-medium hover:bg-[#2DB67D] transition-colors flex items-center gap-1"
        >
          <Star size={16} />
          Leave Review
        </button>
      );
    }

    return (
      <div className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-[#F8FAFC] text-gray-600 border border-gray-200">
        <Receipt size={16} className="mr-2" />
        {booking.paymentStatusLabel}
      </div>
    );
  };

  return (
    <div className="min-h-screen ">
      <div className="">
        <div className="bg-white rounded-lg shadow-sm mb-6 overflow-x-auto">
          <div className="flex border-b border-gray-200 min-w-max md:min-w-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'text-[#2B7FFF] border-b-2 border-[#2B7FFF]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center text-gray-500">
            <div className="flex items-center justify-center gap-3">
              <LoaderCircle className="h-5 w-5 animate-spin" />
              Loading bookings...
            </div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-lg shadow-sm p-4 md:p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center text-lg font-semibold text-gray-700">
                      {bookingTypeLabels[booking.type].charAt(0)}
                    </div>
                  </div>

                  <div className="flex-grow min-w-0">
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${
                          booking.type === 'venue'
                            ? 'bg-[#EFF6FF] text-[#1D4ED8]'
                            : booking.type === 'service'
                              ? 'bg-[#F3E8FF] text-[#7E22CE]'
                              : 'bg-[#FEF3C7] text-[#92400E]'
                        }`}
                      >
                        {bookingTypeLabels[booking.type]}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-[#DCFCE7] text-[#15803D]">
                        {booking.paymentAmountLabel}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {booking.title}
                    </h3>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {booking.dateLabel}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {booking.timeLabel}
                      </span>
                    </div>

                    <div className="flex items-start gap-1 text-sm text-gray-600 mt-1">
                      <MapPin size={14} className="flex-shrink-0 mt-0.5" />
                      <span className="break-words">{booking.location}</span>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-row items-center gap-3 md:ml-auto">
                    <div className="flex-grow md:flex-grow-0 w-full md:w-auto">
                      {getStatusButton(booking.status)}
                    </div>
                    <div className="flex-grow md:flex-grow-0 w-full md:w-auto">
                      {getActionButton(booking)}
                    </div>
                    <button
                      onClick={() => { router.push(`/home/mybookings/${booking.id}`); }}
                      className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex"
                    >
                      <Eye size={20} />&nbsp;View
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {sortedBookings.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <p className="text-gray-500">No bookings found</p>
              </div>
            )}

            {meta && meta.totalPages > 1 ? (
              <div className="flex items-center justify-between rounded-lg bg-white px-4 py-3 shadow-sm">
                <p className="text-sm text-gray-600">
                  Page {meta.page} of {meta.totalPages}
                </p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setPage((currentPage) => Math.max(currentPage - 1, 1))}
                    disabled={!meta.hasPrevPage}
                    className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((currentPage) => currentPage + 1)}
                    disabled={!meta.hasNextPage}
                    className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
