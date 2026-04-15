'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';

import type { BookingCalendarDay, BookingHourSlot } from '@/lib/booking';

interface BookingAvailabilityPickerProps {
  activeMonthLabel: string;
  activeDate: Date | null;
  calendarDays: BookingCalendarDay[];
  canGoNextMonth: boolean;
  canGoPreviousMonth: boolean;
  daysOfWeek: string[];
  durationHours: number;
  hourSlots: BookingHourSlot[];
  multiDateCount: number;
  onClearActiveDateSelection?: () => void;
  onNextMonth: () => void;
  onPreviousMonth: () => void;
  onSelectDate: (date: Date) => void;
  onToggleHour: (hour: number) => void;
  selectedDateKeys: string[];
  selectedHours: number[];
  selectionLabel: string;
}

const dateStatusClasses: Record<string, string> = {
  available: 'bg-[#E8FFF3] text-gray-900 hover:bg-[#d0f8e5]',
  blocked: 'bg-[#FFF4E5] text-[#9A6700] hover:bg-[#fce5bf]',
  booked: 'bg-[#FDECEC] text-[#B74140] hover:bg-[#f7d7d6]',
};

const slotStatusClasses: Record<string, string> = {
  available: 'bg-white text-gray-900 hover:bg-green-50 border border-gray-200',
  blocked: 'bg-[#FFF4E5] text-[#9A6700] border border-[#F6D58B] cursor-not-allowed',
  booked: 'bg-[#FDECEC] text-[#B74140] border border-[#F3C1BF] cursor-not-allowed',
};

const BookingAvailabilityPicker: React.FC<BookingAvailabilityPickerProps> = ({
  activeMonthLabel,
  activeDate,
  calendarDays,
  canGoNextMonth,
  canGoPreviousMonth,
  daysOfWeek,
  durationHours,
  hourSlots,
  multiDateCount,
  onClearActiveDateSelection,
  onNextMonth,
  onPreviousMonth,
  onSelectDate,
  onToggleHour,
  selectedDateKeys,
  selectedHours,
  selectionLabel,
}) => {
  const selectedDateSet = new Set(selectedDateKeys);

  const isSameDay = (left: Date | null, right: Date | null) => {
    if (!left || !right) {
      return false;
    }

    return left.toDateString() === right.toDateString();
  };

  const selectedHourSet = new Set(selectedHours);

  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
      <h2 className="text-xl font-semibold mb-6">Select Date & Time</h2>

      <div className="mb-5 flex flex-wrap items-center gap-4 text-xs font-medium text-gray-600">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#E8FFF3]" />
          Available date
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#FDECEC]" />
          Booked hours on date
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#FFF4E5]" />
          Blocked hours on date
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#F3F4F6]" />
          Past date
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-6">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <span className="font-medium">Date</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onPreviousMonth}
                disabled={!canGoPreviousMonth}
                className="rounded-md border border-gray-200 p-2 text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="min-w-[140px] text-center font-medium">{activeMonthLabel}</span>
              <button
                type="button"
                onClick={onNextMonth}
                disabled={!canGoNextMonth}
                className="rounded-md border border-gray-200 p-2 text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {daysOfWeek.map((day) => (
              <div key={day} className="text-center text-sm text-gray-500">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, index) => (
              <button
                key={`${day.isoDate ?? 'empty'}-${index}`}
                type="button"
                disabled={!day.date || !day.isSelectable}
                onClick={() => day.date && onSelectDate(day.date)}
                className={`
                  aspect-square rounded text-sm font-medium transition-colors
                  ${!day.date ? 'invisible' : ''}
                  ${day.date && day.isPast ? 'bg-[#F3F4F6] text-gray-400' : ''}
                  ${day.date && !day.isPast ? dateStatusClasses[day.status] : ''}
                  ${selectedDateSet.has(day.isoDate ?? '') ? 'ring-2 ring-[#3CCF91] ring-offset-2' : ''}
                  ${isSameDay(day.date, activeDate) ? 'ring-2 ring-[#B74140] ring-offset-2' : ''}
                  ${!day.isSelectable ? 'cursor-not-allowed opacity-70' : ''}
                `}
              >
                {day.day}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between gap-4">
            <p className="font-medium">Available Hours</p>
            <span className="text-sm text-gray-500">{selectionLabel || 'Select any available hours'}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {hourSlots.map((slot) => {
              const isSelected = selectedHourSet.has(slot.hour);

              return (
                <button
                  key={slot.hour}
                  type="button"
                  disabled={!slot.isSelectable}
                  onClick={() => onToggleHour(slot.hour)}
                  className={`
                    rounded-lg px-3 py-3 text-sm font-medium transition-colors
                    ${isSelected
                      ? 'bg-[#3CCF91] text-white ring-2 ring-[#3CCF91] ring-offset-1'
                      : slotStatusClasses[slot.status]
                    }
                  `}
                >
                  {slot.label}
                </button>
              );
            })}
          </div>

          <div className="mt-5 rounded-lg border border-dashed border-[#E5E7EB] bg-gray-50 px-4 py-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Selected Dates</span>
              <span className="font-semibold text-gray-900">{multiDateCount || '-'}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-gray-600">Auto Duration</span>
              <span className="font-semibold text-gray-900">{durationHours ? `${durationHours} hour${durationHours > 1 ? 's' : ''}` : '-'}</span>
            </div>
            {activeDate && onClearActiveDateSelection ? (
              <button
                type="button"
                onClick={onClearActiveDateSelection}
                className="mt-3 text-sm font-medium text-[#B74140] transition-colors hover:text-[#8d3231]"
              >
                Clear selected hours for {activeDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingAvailabilityPicker;
