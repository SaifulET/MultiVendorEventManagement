'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Hash,
  LoaderCircle,
  MapPin,
  MessageSquare,
  Receipt,
  Timer,
  Users,
} from 'lucide-react';
import bg from "@/public/bgforvanue.svg";
import { useParams, useRouter } from 'next/navigation';

import { formatHourLabel, formatHourRange, formatMonthLabel } from '@/lib/booking';
import { api, getApiErrorMessage } from '@/lib/api';
import { formatDateDDMMYY } from '@/lib/date';

type BookingStatus = 'pending' | 'completed' | 'cancelled' | 'upcoming';
type BookingType = 'venue' | 'service' | 'event';

interface BookingDetailsResponse {
  success: boolean;
  data?: BookingDetails;
}

interface BookingDetails {
  _id: string;
  bookingDate?: string;
  createdAt?: string;
  customerId?: string;
  durationHours?: number;
  guest_count?: number;
  hours?: number[];
  location?: string;
  payment?: {
    status?: string;
  };
  pricing?: {
    currency?: string;
    platformFeeAmount?: number;
    subtotal?: number;
    taxAmount?: number;
    totalAmount?: number;
    unitAmount?: number;
  };
  providerId?: string;
  reservedSlots?: string[];
  specialInstructions?: string;
  status?: string;
  targetId?: string;
  targetType?: string;
  updatedAt?: string;
}

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

const getStatusBadgeClasses = (status: BookingStatus) => {
  switch (status) {
    case 'pending':
      return 'bg-[#FFF4E5] text-[#FFB94F]';
    case 'upcoming':
      return 'bg-[#FEE5E5] text-[#B74140]';
    case 'completed':
      return 'bg-[#E5F9F0] text-[#3CCF91]';
    case 'cancelled':
      return 'bg-[#FFE5E5] text-[#FF5A5A]';
  }
};

const getProfileRoute = (bookingType: BookingType, targetId?: string) => {
  if (!targetId) {
    return null;
  }

  switch (bookingType) {
    case 'venue':
      return `/pages/findVenues/${targetId}`;
    case 'service':
      return `/pages/findServiceProvider/${targetId}`;
    case 'event':
      return `/pages/findEventPlanners/${targetId}`;
  }
};

const formatDateTimeLabel = (value?: string) => {
  if (!value) {
    return 'Not available';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString('en-US', {
    day: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const titleFromBooking = (bookingType: BookingType, bookingId: string) =>
  `${bookingTypeLabels[bookingType]} Booking #${bookingId.slice(-6).toUpperCase()}`;

interface ReadOnlyCalendarDay {
  date: Date | null;
  day: number | null;
  isBookedDate: boolean;
  isCurrentMonth: boolean;
  isPast: boolean;
  isoDate: string | null;
}

const formatIsoDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const buildReadOnlyCalendarDays = (month: Date, bookedIsoDate: string | null): ReadOnlyCalendarDay[] => {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstDay = new Date(year, monthIndex, 1);
  const lastDay = new Date(year, monthIndex + 1, 0);
  const startingDayOfWeek = firstDay.getDay();
  const totalDays = lastDay.getDate();
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const days: ReadOnlyCalendarDay[] = [];

  for (let index = 0; index < startingDayOfWeek; index += 1) {
    days.push({
      date: null,
      day: null,
      isBookedDate: false,
      isCurrentMonth: false,
      isPast: false,
      isoDate: null,
    });
  }

  for (let day = 1; day <= totalDays; day += 1) {
    const date = new Date(year, monthIndex, day);
    const isoDate = formatIsoDate(date);

    days.push({
      date,
      day,
      isBookedDate: isoDate === bookedIsoDate,
      isCurrentMonth: true,
      isPast: date < todayStart,
      isoDate,
    });
  }

  return days;
};

const BookingDetailsPage = () => {
  const params = useParams<{ slug?: string | string[] }>();
  const router = useRouter();
  const bookingId = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;

  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeMonth, setActiveMonth] = useState<Date | null>(null);

  useEffect(() => {
    if (!bookingId) {
      setBooking(null);
      setError('Booking not found.');
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const fetchBookingDetails = async () => {
      try {
        setIsLoading(true);
        setError('');

        const response = await api.get<BookingDetailsResponse>(`/api/v1/bookings/${bookingId}`);

        if (!isMounted) {
          return;
        }

        if (!response.data.data) {
          setBooking(null);
          setError('Booking details are unavailable right now.');
          return;
        }

        setBooking(response.data.data);
      } catch (fetchError) {
        if (!isMounted) {
          return;
        }

        setBooking(null);
        setError(getApiErrorMessage(fetchError));
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchBookingDetails();

    return () => {
      isMounted = false;
    };
  }, [bookingId]);

  const bookingType = toBookingType(booking?.targetType);
  const bookingStatus = toBookingStatus(booking?.status, booking?.bookingDate);
  const paymentStatusLabel = booking?.payment?.status?.replace(/_/g, ' ').trim() || 'Payment pending';
  const paymentCurrency = booking?.pricing?.currency ?? 'GBP';
  const bookedProfileRoute = getProfileRoute(bookingType, booking?.targetId);
  const bookingTitle = booking?._id ? titleFromBooking(bookingType, booking._id) : `${bookingTypeLabels[bookingType]} Booking`;
  const timeRangeLabel = Array.isArray(booking?.hours) && booking.hours.length > 0
    ? formatHourRange(booking.hours)
    : 'Time unavailable';
  const reservedSlots = booking?.reservedSlots ?? [];
  const bookingDateObject = useMemo(() => {
    if (!booking?.bookingDate) {
      return null;
    }

    const parsedDate = new Date(`${booking.bookingDate}T00:00:00`);
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
  }, [booking?.bookingDate]);
  const bookingIsoDate = bookingDateObject ? formatIsoDate(bookingDateObject) : null;

  useEffect(() => {
    if (!bookingDateObject) {
      setActiveMonth(null);
      return;
    }

    setActiveMonth(new Date(bookingDateObject.getFullYear(), bookingDateObject.getMonth(), 1));
  }, [bookingDateObject]);

  const readOnlyCalendarDays = useMemo(
    () => (activeMonth ? buildReadOnlyCalendarDays(activeMonth, bookingIsoDate) : []),
    [activeMonth, bookingIsoDate]
  );
  const displayMinHour = useMemo(() => {
    const bookedHours = booking?.hours ?? [];

    if (bookedHours.length === 0) {
      return 8;
    }

    return Math.min(8, Math.min(...bookedHours));
  }, [booking?.hours]);
  const displayMaxHour = useMemo(() => {
    const bookedHours = booking?.hours ?? [];

    if (bookedHours.length === 0) {
      return 23;
    }

    return Math.max(23, Math.max(...bookedHours));
  }, [booking?.hours]);
  const readOnlyHourSlots = useMemo(() => {
    const bookedHourSet = new Set(booking?.hours ?? []);

    return Array.from({ length: displayMaxHour - displayMinHour + 1 }, (_, index) => {
      const hour = displayMinHour + index;

      return {
        hour,
        isBooked: bookedHourSet.has(hour),
        label: formatHourLabel(hour),
      };
    });
  }, [booking?.hours, displayMaxHour, displayMinHour]);

  const progressItems = useMemo(() => {
    if (!booking) {
      return [];
    }

    return [
      {
        isComplete: true,
        label: 'Booked',
        value: formatDateTimeLabel(booking.createdAt),
      },
      {
        isComplete: bookingStatus !== 'cancelled',
        label: bookingStatus.charAt(0).toUpperCase() + bookingStatus.slice(1),
        value: formatDateDDMMYY(booking.bookingDate, 'Pending'),
      },
      {
        isComplete: bookingStatus === 'completed',
        label: 'Updated',
        value: formatDateTimeLabel(booking.updatedAt),
      },
    ];
  }, [booking, bookingStatus]);

  const handlePreviousMonth = () => {
    setActiveMonth((currentMonth) =>
      currentMonth ? new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1) : currentMonth
    );
  };

  const handleNextMonth = () => {
    setActiveMonth((currentMonth) =>
      currentMonth ? new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1) : currentMonth
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 px-[24px] py-[32px] md:px-[104px]">
        <div className="rounded-lg border border-[#E5E7EB] bg-white p-10 text-center text-gray-500">
          <div className="flex items-center justify-center gap-3">
            <LoaderCircle className="h-5 w-5 animate-spin" />
            Loading booking details...
          </div>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 px-[24px] py-[32px] md:px-[104px]">
        <div className="rounded-lg border border-red-200 bg-red-50 p-10 text-center text-red-700">
          {error || 'Booking details are unavailable right now.'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative h-[320px] w-full overflow-hidden">
        <img
          src={bg.src}
          alt={bookingTitle}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/35 flex flex-col justify-end p-6 md:p-8">
          <span className={`inline-block w-fit rounded px-3 py-1 text-xs font-semibold text-white mb-3 ${getStatusBadgeClasses(bookingStatus)}`}>
            {bookingStatus.charAt(0).toUpperCase() + bookingStatus.slice(1)}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            {bookingTitle}
          </h1>
          <div className="flex items-center text-white/90 text-sm md:text-base">
            <MapPin className="w-4 h-4 mr-2" />
            {booking.location?.trim() || 'Location unavailable'}
          </div>
        </div>
      </div>

      <div className="px-[24px] py-[24px] md:px-[104px] md:py-[32px]">
        <div className="bg-white rounded-lg shadow-sm p-[12px] md:p-[25px] mb-[32px]">
          <h2 className="font-inter font-semibold text-[18px] leading-[1] tracking-normal mb-[24px]">Booking Timeline</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {progressItems.map((item) => (
              <div key={item.label} className="rounded-lg border border-gray-200 bg-[#FAFAFA] px-4 py-4">
                <p className={`text-sm font-semibold ${item.isComplete ? 'text-gray-900' : 'text-gray-400'}`}>
                  {item.label}
                </p>
                <p className={`mt-1 text-xs ${item.isComplete ? 'text-gray-600' : 'text-gray-400'}`}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-[12px] md:p-[32px]">
              <h2 className="text-lg font-semibold mb-4">Booking Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Booking Date</p>
                  <p className="text-sm font-medium">{formatDateDDMMYY(booking.bookingDate, 'Date unavailable')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Selected Hours</p>
                  <p className="text-sm font-medium">{timeRangeLabel}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Duration</p>
                  <p className="text-sm font-medium">
                    {booking.durationHours ? `${booking.durationHours} hour${booking.durationHours > 1 ? 's' : ''}` : 'Not available'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Guests Count</p>
                  <p className="text-sm font-medium">
                    {typeof booking.guest_count === 'number' ? `${booking.guest_count} guests` : 'Not provided'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Booked Item</p>
                  <p className="text-sm font-medium">{bookingTypeLabels[bookingType]}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Booking Status</p>
                  <p className="text-sm font-medium">{booking.status?.trim() || 'Unknown'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-[12px] md:p-[32px]">
              <h2 className="text-lg font-semibold mb-4">Schedule & Instructions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Created At</p>
                  <p className="text-sm font-medium">{formatDateTimeLabel(booking.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Last Updated</p>
                  <p className="text-sm font-medium">{formatDateTimeLabel(booking.updatedAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Reserved Slots</p>
                  <p className="text-sm font-medium">{reservedSlots.length} slot{reservedSlots.length === 1 ? '' : 's'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Location</p>
                  <p className="text-sm font-medium">{booking.location?.trim() || 'Location unavailable'}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Special Notes</p>
                <p className="text-sm text-gray-700">
                  {booking.specialInstructions?.trim() || 'No special instructions were provided.'}
                </p>
              </div>
              {reservedSlots.length > 0 ? (
                <div className="mt-5">
                  <p className="text-sm text-gray-500 mb-2">Reserved Slot References</p>
                  <div className="space-y-2">
                    {reservedSlots.map((slot) => (
                      <div key={slot} className="rounded-lg bg-[#FAFAFA] px-3 py-2 text-xs text-gray-700 break-all">
                        {slot}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="bg-white rounded-lg shadow-sm p-[12px] md:p-[32px]">
              <div className="mb-6">
                <h2 className="text-lg font-semibold">Booked Schedule</h2>
                <p className="mt-2 text-sm text-gray-500">
                  This schedule is read-only and shows the booked date and hours for this reservation.
                </p>
              </div>

              <div className="mb-5 flex flex-wrap items-center gap-4 text-xs font-medium text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-white border border-gray-200" />
                  Other date
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#FDECEC]" />
                  Booked date
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#FDECEC]" />
                  Booked hours
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#F3F4F6]" />
                  Past date
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_1fr]">
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <span className="font-medium">Date</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handlePreviousMonth}
                        disabled={!activeMonth}
                        className="rounded-md border border-gray-200 p-2 text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Previous month"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <span className="min-w-[140px] text-center font-medium">
                        {formatMonthLabel(activeMonth)}
                      </span>
                      <button
                        type="button"
                        onClick={handleNextMonth}
                        disabled={!activeMonth}
                        className="rounded-md border border-gray-200 p-2 text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Next month"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-2 mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <div key={day} className="text-center text-sm text-gray-500">
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {readOnlyCalendarDays.map((day, index) => (
                      <div
                        key={`${day.isoDate ?? 'empty'}-${index}`}
                        className={`
                          flex aspect-square items-center justify-center rounded text-sm font-medium
                          ${!day.isCurrentMonth ? 'invisible' : ''}
                          ${day.isCurrentMonth && day.isPast ? 'bg-[#F3F4F6] text-gray-400' : ''}
                          ${day.isCurrentMonth && !day.isPast && !day.isBookedDate ? 'border border-gray-200 bg-white text-gray-700' : ''}
                          ${day.isBookedDate ? 'border border-[#B74140] bg-[#FDECEC] text-[#B74140]' : ''}
                        `}
                      >
                        {day.day ?? ''}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-3 flex items-center justify-between gap-4">
                    <p className="font-medium">Booked Hours</p>
                    <span className="text-sm text-gray-500">{timeRangeLabel}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {readOnlyHourSlots.map((slot) => (
                      <div
                        key={slot.hour}
                        className={`
                          rounded-lg border px-3 py-3 text-center text-sm font-medium
                          ${slot.isBooked
                            ? 'border-[#F3C1BF] bg-[#FDECEC] text-[#B74140]'
                            : 'border-gray-200 bg-white text-gray-500'
                          }
                        `}
                      >
                        {slot.label}
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 rounded-lg border border-dashed border-[#E5E7EB] bg-gray-50 px-4 py-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Booked Date</span>
                      <span className="font-semibold text-gray-900">
                        {formatDateDDMMYY(booking.bookingDate, 'Date unavailable')}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="text-gray-600">Booked Hours</span>
                      <span className="font-semibold text-gray-900">
                        {Array.isArray(booking.hours) ? booking.hours.length : 0}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="text-gray-600">Auto Duration</span>
                      <span className="font-semibold text-gray-900">
                        {booking.durationHours ? `${booking.durationHours} hour${booking.durationHours > 1 ? 's' : ''}` : '-'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                    <Hash size={14} />
                    Booking ID
                  </div>
                  <p className="text-sm font-medium break-all">{booking._id}</p>
                </div>
                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                    <Receipt size={14} />
                    Target ID
                  </div>
                  <p className="text-sm font-medium break-all">{booking.targetId || 'Unavailable'}</p>
                </div>
                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                    <Users size={14} />
                    Provider ID
                  </div>
                  <p className="text-sm font-medium break-all">{booking.providerId || 'Unavailable'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Payment Details</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Unit Amount</span>
                  <span className="font-semibold">{formatMinorCurrencyAmount(booking.pricing?.unitAmount, paymentCurrency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">{formatMinorCurrencyAmount(booking.pricing?.subtotal, paymentCurrency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Platform Fee</span>
                  <span className="font-semibold">{formatMinorCurrencyAmount(booking.pricing?.platformFeeAmount, paymentCurrency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-semibold">{formatMinorCurrencyAmount(booking.pricing?.taxAmount, paymentCurrency)}</span>
                </div>
                <div className="flex justify-between text-sm items-center border-t border-gray-100 pt-3">
                  <span className="text-gray-700 font-medium">Total</span>
                  <span className="font-bold">{formatMinorCurrencyAmount(booking.pricing?.totalAmount, paymentCurrency)}</span>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-gray-600">Payment Status</span>
                  <span className="text-[#3CCF91] font-semibold">
                    {paymentStatusLabel.charAt(0).toUpperCase() + paymentStatusLabel.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <button
                onClick={() => { router.push("/home/dashboard/chat"); }}
                className="w-full bg-[#B74140] hover:bg-[#a03635] text-white font-medium py-3 px-4 rounded-lg mb-3 transition-colors flex items-center justify-center gap-1"
              >
                <MessageSquare size={16} strokeWidth={2.25} /> Message provider
              </button>
              <button
                onClick={() => {
                  if (bookedProfileRoute) {
                    router.push(bookedProfileRoute);
                  }
                }}
                disabled={!bookedProfileRoute}
                className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                View {bookingTypeLabels[bookingType]} Profile
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Booking Snapshot</h2>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#B74140]" />
                  {formatDateDDMMYY(booking.bookingDate, 'Date unavailable')}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#B74140]" />
                  {timeRangeLabel}
                </div>
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4 text-[#B74140]" />
                  {booking.durationHours ? `${booking.durationHours} hour${booking.durationHours > 1 ? 's' : ''}` : 'Duration unavailable'}
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#B74140]" />
                  {typeof booking.guest_count === 'number' ? `${booking.guest_count} guests` : 'Guest count not provided'}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#B74140]" />
                  {booking.location?.trim() || 'Location unavailable'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsPage;
