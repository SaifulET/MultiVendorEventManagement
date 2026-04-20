'use client';

import { ChevronLeft, ChevronRight, LoaderCircle } from 'lucide-react';
import React from 'react';

import { formatMonthLabel, type BookingCalendarDay } from '@/lib/booking';

interface ReadOnlyAvailabilityCalendarProps {
  activeMonth: Date | null;
  calendarDays: BookingCalendarDay[];
  canGoNextMonth: boolean;
  canGoPreviousMonth: boolean;
  daysOfWeek: string[];
  description: string;
  emptyMessage?: string;
  error?: string;
  isLoading?: boolean;
  onNextMonth: () => void;
  onPreviousMonth: () => void;
  title?: string;
}

const dateStatusClasses: Record<string, string> = {
  available: 'bg-[#E8FFF3] text-gray-900',
  blocked: 'bg-[#FFF4E5] text-[#9A6700]',
  booked: 'bg-[#FDECEC] text-[#B74140]',
};

const ReadOnlyAvailabilityCalendar: React.FC<ReadOnlyAvailabilityCalendarProps> = ({
  activeMonth,
  calendarDays,
  canGoNextMonth,
  canGoPreviousMonth,
  daysOfWeek,
  description,
  emptyMessage = 'No booking availability has been published yet.',
  error,
  isLoading = false,
  onNextMonth,
  onPreviousMonth,
  title = 'Availability calendar',
}) => {
  const activeMonthLabel = formatMonthLabel(activeMonth);
  const hasDays = calendarDays.some((day) => day.date);

  return (
    <section className="rounded-[28px] border border-[#E5E7EB] bg-white p-6 md:p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
          {description.trim() ? (
            <p className="mt-2 text-sm text-gray-500">{description}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPreviousMonth}
            disabled={!canGoPreviousMonth || isLoading || !activeMonth}
            className="rounded-full border border-gray-200 p-2 text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Previous month"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="min-w-[140px] text-center font-semibold text-gray-900">
            {activeMonthLabel || 'Availability'}
          </span>
          <button
            type="button"
            onClick={onNextMonth}
            disabled={!canGoNextMonth || isLoading || !activeMonth}
            className="rounded-full border border-gray-200 p-2 text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Next month"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-[#E5E7EB] bg-gray-50 px-4 py-8 text-center text-sm text-gray-600">
          <div className="flex items-center justify-center gap-3">
            <LoaderCircle className="h-5 w-5 animate-spin" />
            Loading live availability...
          </div>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-6 text-sm text-red-700">
          {error}
        </div>
      ) : !activeMonth || !hasDays ? (
        <div className="rounded-2xl border border-[#E5E7EB] bg-gray-50 px-4 py-6 text-sm text-gray-600">
          {emptyMessage}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium text-gray-500">
            {daysOfWeek.map((day) => (
              <div key={day} className="py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-7 gap-2">
            {calendarDays.map((day, index) => (
              <div
                key={`${day.isoDate ?? 'empty'}-${index}`}
                className={`
                  flex h-12 items-center justify-center rounded-xl text-sm font-medium
                  ${!day.date ? 'bg-transparent text-transparent' : ''}
                  ${day.date && day.isPast ? 'bg-[#F3F4F6] text-gray-400' : ''}
                  ${day.date && !day.isPast ? dateStatusClasses[day.status] : ''}
                `}
              >
                {day.day ?? ''}
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-4 text-sm text-gray-600">
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#E8FFF3]" />
              Available
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#FDECEC]" />
              Booked
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#FFF4E5]" />
              Blocked
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#F3F4F6]" />
              Past
            </span>
          </div>
        </>
      )}
    </section>
  );
};

export default ReadOnlyAvailabilityCalendar;
