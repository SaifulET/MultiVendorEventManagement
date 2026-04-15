'use client';

import { Bell, LoaderCircle } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import img from "@/public/bookingsummary.svg";
import { useParams, useRouter } from 'next/navigation';

import BookingAvailabilityPicker from '@/app/component/shared/BookingAvailabilityPicker';
import BookingPopup from '@/app/component/shared/BookingPopup';
import { api, getApiErrorMessage } from '@/lib/api';
import {
  buildNextSelectedHours,
  findFirstSelectableDate,
  formatBookingDate,
  formatCurrencyAmount,
  formatHourRange,
  formatMonthLabel,
  getCalendarDays,
  getHourSlots,
  parseMonthKey,
  type BookingAvailabilityEntry,
  type BookingMeta,
} from '@/lib/booking';
import { formatDateDDMMYY } from '@/lib/date';
import { useAuthStore } from '@/store/useAuthStore';

interface BookingDialogState {
  message: string;
  title: string;
}

interface EventPlannerBookingContextResponse {
  success: boolean;
  data?: {
    availability?: Record<string, BookingAvailabilityEntry>;
    bookingMeta: BookingMeta;
    provider?: {
      email?: string;
      fullName?: string;
      role?: string;
    };
    target?: {
      _id?: string | number;
      email?: string;
      eventPlanner?: {
        address?: string;
        coverageArea?: string[];
        description?: string;
        name?: string;
      };
      fullName?: string;
      role?: string;
    };
    targetType?: string;
  };
}

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const ServiceProviderConfirmation: React.FC = () => {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  const [bookingContext, setBookingContext] = useState<EventPlannerBookingContextResponse['data'] | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedHoursByDate, setSelectedHoursByDate] = useState<Record<string, number[]>>({});
  const [activeMonthIndex, setActiveMonthIndex] = useState(0);
  const [location, setLocation] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoadingContext, setIsLoadingContext] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contextError, setContextError] = useState('');
  const [dialog, setDialog] = useState<BookingDialogState | null>(null);

  const availableMonths = useMemo(() => {
    const currentMonth = parseMonthKey(bookingContext?.bookingMeta.currentMonth);
    const nextMonth = parseMonthKey(bookingContext?.bookingMeta.nextMonth);

    return [currentMonth, nextMonth].filter((month): month is Date => Boolean(month));
  }, [bookingContext?.bookingMeta.currentMonth, bookingContext?.bookingMeta.nextMonth]);

  const activeMonth = availableMonths[activeMonthIndex] ?? null;
  const selectedDateKey = formatBookingDate(selectedDate);
  const selectedHours = selectedDateKey ? selectedHoursByDate[selectedDateKey] ?? [] : [];
  const hourSlots = useMemo(() => {
    if (!bookingContext || !selectedDateKey) {
      return [];
    }

    return getHourSlots(selectedDateKey, bookingContext.bookingMeta, bookingContext.availability);
  }, [bookingContext, selectedDateKey]);

  const selectableHours = useMemo(
    () => hourSlots.filter((slot) => slot.isSelectable).map((slot) => slot.hour),
    [hourSlots]
  );
  const selectedDateKeys = useMemo(
    () =>
      Object.entries(selectedHoursByDate)
        .filter(([, hours]) => hours.length > 0)
        .map(([dateKey]) => dateKey)
        .sort(),
    [selectedHoursByDate]
  );
  const totalSelectedHours = useMemo(
    () => selectedDateKeys.reduce((total, dateKey) => total + (selectedHoursByDate[dateKey]?.length ?? 0), 0),
    [selectedDateKeys, selectedHoursByDate]
  );
  const selectedScheduleItems = useMemo(
    () =>
      selectedDateKeys.map((dateKey) => ({
        dateKey,
        displayDate: formatDateDDMMYY(dateKey, dateKey),
        timeLabel: formatHourRange(selectedHoursByDate[dateKey] ?? []),
      })),
    [selectedDateKeys, selectedHoursByDate]
  );

  const calendarDays = useMemo(() => {
    if (!bookingContext || !activeMonth) {
      return [];
    }

    return getCalendarDays(activeMonth, bookingContext.bookingMeta, bookingContext.availability);
  }, [activeMonth, bookingContext]);

  const plannerName =
    bookingContext?.target?.eventPlanner?.name?.trim() ||
    bookingContext?.target?.fullName?.trim() ||
    bookingContext?.provider?.fullName?.trim() ||
    'Event Planner';
  const plannerDescription =
    bookingContext?.target?.eventPlanner?.description?.trim() ||
    'Select available dates and any available hours to book this event planner.';
  const plannerAddress = bookingContext?.target?.eventPlanner?.address?.trim() || '';
  const priceDisplay = formatCurrencyAmount(undefined, bookingContext?.bookingMeta.currency ?? 'BDT', '');
  const selectionLabel = formatHourRange(selectedHours);
  const selectedDuration = totalSelectedHours;
  const hasBookingSelection = selectedDateKeys.length > 0;

  useEffect(() => {
    const eventPlannerId = params?.slug;
    if (!eventPlannerId) {
      setContextError('Event planner not found.');
      setIsLoadingContext(false);
      return;
    }

    let isMounted = true;

    const fetchContext = async () => {
      try {
        setIsLoadingContext(true);
        setContextError('');

        const response = await api.get<EventPlannerBookingContextResponse>(
          `/api/v1/bookings/event-planners/${eventPlannerId}/context`
        );
        const nextContext = response.data.data;

        if (!nextContext || !isMounted) {
          return;
        }

        setBookingContext(nextContext);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setBookingContext(null);
        setContextError(getApiErrorMessage(error));
      } finally {
        if (isMounted) {
          setIsLoadingContext(false);
        }
      }
    };

    fetchContext();

    return () => {
      isMounted = false;
    };
  }, [params?.slug]);

  useEffect(() => {
    if (!bookingContext || availableMonths.length === 0) {
      return;
    }

    const firstSelectableDate = findFirstSelectableDate(
      availableMonths,
      bookingContext.bookingMeta,
      bookingContext.availability
    );

    if (!firstSelectableDate) {
      setSelectedDate(null);
      return;
    }

    setSelectedDate((currentSelectedDate) => currentSelectedDate ?? firstSelectableDate);
    setActiveMonthIndex((currentIndex) => {
      const matchingMonthIndex = availableMonths.findIndex(
        (month) =>
          month.getFullYear() === firstSelectableDate.getFullYear() &&
          month.getMonth() === firstSelectableDate.getMonth()
      );

      return matchingMonthIndex >= 0 ? matchingMonthIndex : currentIndex;
    });
  }, [availableMonths, bookingContext]);

  const handleToggleHour = (hour: number) => {
    if (!selectedDateKey) {
      return;
    }

    const nextSelection = buildNextSelectedHours(selectedHours, hour, selectableHours);

    if (nextSelection.error) {
      setDialog({
        title: 'Invalid Hour Selection',
        message: nextSelection.error,
      });
      return;
    }

    setSelectedHoursByDate((currentSelections) => {
      if (nextSelection.hours.length === 0) {
        const nextSelections = { ...currentSelections };
        delete nextSelections[selectedDateKey];
        return nextSelections;
      }

      return {
        ...currentSelections,
        [selectedDateKey]: nextSelection.hours,
      };
    });
  };

  const handleClearActiveDateSelection = () => {
    if (!selectedDateKey) {
      return;
    }

    setSelectedHoursByDate((currentSelections) => {
      const nextSelections = { ...currentSelections };
      delete nextSelections[selectedDateKey];
      return nextSelections;
    });
  };

  const handleCloseDialog = () => {
    setDialog(null);
  };

  const handleConfirmBooking = async () => {
    if (isSubmitting || !bookingContext) {
      return;
    }

    if (!token || !user) {
      setDialog({
        title: 'Login Required',
        message: 'Please sign in with a customer account before booking this event planner.',
      });
      return;
    }

    if (user.role !== 'customer') {
      setDialog({
        title: 'Customer Account Required',
        message: 'Only users with the customer role can book event planners.',
      });
      return;
    }

    const eventPlannerId = params?.slug;
    if (!eventPlannerId) {
      setDialog({
        title: 'Event Planner Not Found',
        message: 'We could not find the event planner you are trying to book.',
      });
      return;
    }

    if (selectedDateKeys.length === 0) {
      setDialog({
        title: 'Select Dates & Hours',
        message: 'Please choose at least one available date and any available hours before continuing.',
      });
      return;
    }

    if (!location.trim()) {
      setDialog({
        title: 'Location Required',
        message: 'Please enter a location before confirming your booking.',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await Promise.all(
        selectedDateKeys.map((dateKey) =>
          api.post(`/api/v1/bookings/event-planners/${eventPlannerId}`, {
            bookingDate: dateKey,
            hours: selectedHoursByDate[dateKey] ?? [],
            location: location.trim(),
            specialInstructions: specialInstructions.trim(),
          })
        )
      );

      localStorage.setItem(
        'bookingData',
        JSON.stringify({
          dates: selectedScheduleItems,
          duration: selectedDuration,
          location,
          provider: plannerName,
          specialInstructions,
        })
      );

      router.push('/pages/reviewEventPlanner/confirmed-booking-slug');
    } catch (error) {
      setDialog({
        title: 'Booking Failed',
        message: getApiErrorMessage(error),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen px-[32px] md:px-[104px] py-[38px]">
      <div>
        <h1 className="font-inter font-bold text-[24px] leading-[32px] tracking-normal mb-[20px]">Complete Your Booking</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-[32px]">
          <div className="space-y-6">
            {isLoadingContext ? (
              <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
                <div className="flex items-center gap-3 text-gray-600">
                  <LoaderCircle className="h-5 w-5 animate-spin" />
                  Loading booking availability...
                </div>
              </div>
            ) : contextError ? (
              <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
                <p className="text-sm text-[#B74140]">{contextError}</p>
              </div>
            ) : bookingContext && activeMonth ? (
              <BookingAvailabilityPicker
                activeMonthLabel={formatMonthLabel(activeMonth)}
                activeDate={selectedDate}
                calendarDays={calendarDays}
                canGoNextMonth={activeMonthIndex < availableMonths.length - 1}
                canGoPreviousMonth={activeMonthIndex > 0}
                daysOfWeek={daysOfWeek}
                durationHours={selectedDuration}
                hourSlots={hourSlots}
                multiDateCount={selectedDateKeys.length}
                onClearActiveDateSelection={handleClearActiveDateSelection}
                onNextMonth={() => setActiveMonthIndex((currentIndex) => Math.min(currentIndex + 1, availableMonths.length - 1))}
                onPreviousMonth={() => setActiveMonthIndex((currentIndex) => Math.max(currentIndex - 1, 0))}
                onSelectDate={(date) => setSelectedDate(date)}
                onToggleHour={handleToggleHour}
                selectedDateKeys={selectedDateKeys}
                selectedHours={selectedHours}
                selectionLabel={selectionLabel}
              />
            ) : null}

            <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
              <div className='flex items-center justify-between'>
                <h2 className="text-xl font-semibold mb-6">Booking Details</h2>
                <div className="w-[198px] flex flex-col justify-center items-center gap-2">
                  <button
                    type="button"
                    className="bg-[#B74140] text-white px-[15px] py-[2px] rounded-lg hover:bg-[#9a3635] transition-colors flex"
                  >
                    <Bell /> Notify Me
                  </button>
                  <p className='font-inter font-normal text-[10px] leading-[1] tracking-normal text-center'>If you keep the Notify Me button active, you will receive an email as soon as this planner becomes available.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    value={location}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocation(e.target.value)}
                    placeholder="Enter event location"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B74140] focus:border-transparent outline-none transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (hours)
                  </label>
                  <input
                    type="text"
                    id="duration"
                    value={selectedDuration ? `${selectedDuration}` : ''}
                    readOnly
                    placeholder="Auto calculated from all selected hours"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-2">
                    Special Instructions
                  </label>
                  <textarea
                    id="instructions"
                    value={specialInstructions}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSpecialInstructions(e.target.value)}
                    rows={4}
                    placeholder="Any special requirements or instructions for your booking..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B74140] focus:border-transparent outline-none transition-colors resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 space-y-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAgreeTerms(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-[#B74140] focus:ring-[#B74140]"
                />
                <span className="text-gray-700">
                  I agree to the <a href="/pages/termsAndConditions" className="text-[#B74140] hover:underline">Terms of Service</a>
                </span>
              </label>

              <button
                type="button"
                disabled={!agreeTerms || !hasBookingSelection || !location.trim() || isSubmitting || isLoadingContext || Boolean(contextError)}
                onClick={handleConfirmBooking}
                className={`
                  w-full py-4 rounded-lg text-lg font-semibold transition-all
                  ${agreeTerms && hasBookingSelection && location.trim() && !isSubmitting && !isLoadingContext && !contextError
                    ? 'bg-[#B74140] text-white hover:bg-[#9a3635] active:scale-[0.99]'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                {isSubmitting ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </div>

          <div className="sticky top-6 h-fit">
            <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
              <h2 className="text-xl font-semibold mb-6">Booking Summary</h2>

              <div className="flex items-center gap-3 mb-6">
                <img
                  src={img.src}
                  alt="Provider"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold text-base">{plannerName}</h3>
                  <p className="text-sm text-gray-600">Event Planner</p>
                  {plannerAddress ? <p className="text-xs text-gray-500 mt-1">{plannerAddress}</p> : null}
                </div>
              </div>

              <button onClick={() => { router.push("/home/dashboard/chat"); }} className="w-full border border-gray-300 rounded-lg py-3 mb-6 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3.293 3.293 3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
                <span className="font-medium">Contact Provider</span>
              </button>

              <p className="mb-4 text-sm text-gray-600">{plannerDescription}</p>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Selected Dates:</span>
                  <span className="font-medium">{selectedDateKeys.length || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Editing Date:</span>
                  <span className="font-medium">{formatDateDDMMYY(selectedDate, '-')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Editing Hours:</span>
                  <span className="font-medium">{selectionLabel || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium">{location || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{selectedDuration ? `${selectedDuration}hr total` : '-'}</span>
                </div>
                {selectedScheduleItems.length ? (
                  <div className="border-b border-gray-100 pb-2">
                    <p className="mb-2 text-gray-600">Selected Schedule</p>
                    <div className="space-y-2">
                      {selectedScheduleItems.map((item) => (
                        <div key={item.dateKey} className="flex justify-between gap-4 text-sm">
                          <span className="font-medium text-gray-900">{item.displayDate}</span>
                          <span className="text-right text-gray-600">{item.timeLabel || '-'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
                {priceDisplay ? (
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-bold text-lg">{priceDisplay}</span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      <BookingPopup
        open={Boolean(dialog)}
        title={dialog?.title ?? ''}
        message={dialog?.message ?? ''}
        onClose={handleCloseDialog}
      />
    </div>
  );
};

export default ServiceProviderConfirmation;
