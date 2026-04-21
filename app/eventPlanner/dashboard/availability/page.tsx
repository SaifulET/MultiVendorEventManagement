'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { api, getApiErrorMessage } from '@/lib/api';
import { formatDateDDMMYY } from '@/lib/date';

type AvailabilityResponse = {
  success: boolean;
  data?: {
    range?: {
      from: string;
      to: string;
    };
    availability?: Record<string, number[]>;
  };
};

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const getDateKey = (year: number, month: number, day: number) =>
  `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

const getMonthParam = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

export default function EventPlannerAvailabilityPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [availability, setAvailability] = useState<Record<string, number[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const monthParam = useMemo(() => getMonthParam(currentMonth), [currentMonth]);

  const loadAvailability = async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await api.get<AvailabilityResponse>(
        '/api/v1/event-planners/me/availability',
        {
          params: {
            month: monthParam,
          },
        }
      );

      setAvailability(response.data.data?.availability ?? {});
    } catch (fetchError) {
      setError(getApiErrorMessage(fetchError));
      setAvailability({});
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadAvailability();
  }, [monthParam]);

  const handleMonthChange = (direction: number) => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1)
    );
    setSelectedDateKey(null);
    setSuccessMessage('');
  };

  const handleBlock = async () => {
    if (!selectedDateKey) {
      setError('Select a date before blocking availability.');
      return;
    }

    try {
      setIsSaving(true);
      setError('');
      setSuccessMessage('');

      await api.patch('/api/v1/event-planners/me/availability', {
        date: selectedDateKey,
      });

      await loadAvailability();
      setSuccessMessage(
        `Availability blocked for ${formatDateDDMMYY(selectedDateKey, selectedDateKey)}.`
      );
    } catch (saveError) {
      setError(getApiErrorMessage(saveError));
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnblock = async () => {
    if (!selectedDateKey) {
      setError('Select a date before removing the availability block.');
      return;
    }

    try {
      setIsSaving(true);
      setError('');
      setSuccessMessage('');

      await api.delete('/api/v1/event-planners/me/availability', {
        data: {
          date: selectedDateKey,
        },
      });

      await loadAvailability();
      setSuccessMessage(
        `Availability block removed for ${formatDateDDMMYY(selectedDateKey, selectedDateKey)}.`
      );
    } catch (saveError) {
      setError(getApiErrorMessage(saveError));
    } finally {
      setIsSaving(false);
    }
  };

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();
  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();
  const selectedDateUnavailable = selectedDateKey
    ? Array.isArray(availability[selectedDateKey]) && availability[selectedDateKey].length > 0
    : false;

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Availability</h1>
          <p className="mt-2 text-sm text-gray-500">
            Block or unblock full days for your bookings without any approval flow.
          </p>
        </div>

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {successMessage ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {successMessage}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <section className="rounded-xl border border-[#E5E7EB] bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleMonthChange(-1)}
                  className="rounded p-1 transition-colors hover:bg-gray-100"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMonthChange(1)}
                  className="rounded p-1 transition-colors hover:bg-gray-100"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="mb-3 grid grid-cols-7 gap-2 text-center text-xs font-medium text-gray-500">
              {dayLabels.map((day) => (
                <div key={day} className="py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className="h-10 rounded-lg bg-transparent md:h-12"
                />
              ))}
              {Array.from({ length: daysInMonth }, (_, index) => {
                const day = index + 1;
                const dateKey = getDateKey(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth(),
                  day
                );
                const isSelected = selectedDateKey === dateKey;
                const isUnavailable =
                  Array.isArray(availability[dateKey]) && availability[dateKey].length > 0;

                return (
                  <button
                    key={dateKey}
                    type="button"
                    onClick={() => {
                      setSelectedDateKey(dateKey);
                      setError('');
                      setSuccessMessage('');
                    }}
                    className={`h-10 rounded-lg text-sm font-medium transition-colors md:h-12 ${
                      isSelected ? 'ring-2 ring-[#B74140] ring-offset-1' : ''
                    } ${
                      isUnavailable
                        ? 'bg-[#FDECEC] text-[#B74444] hover:bg-[#f9dede]'
                        : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex items-center gap-4 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-[#FDECEC]" />
                <span>Blocked or booked day</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded border border-gray-300 bg-white" />
                <span>Open day</span>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-[#E5E7EB] bg-white p-6">
            <h2 className="mb-4 text-xl font-bold text-gray-900">Manage Day</h2>

            <p className="mb-4 text-sm text-gray-500">
              {selectedDateKey
                ? `Selected: ${formatDateDDMMYY(selectedDateKey, selectedDateKey)}`
                : 'Choose a date from the calendar.'}
            </p>

            {selectedDateKey ? (
              <p className="mb-4 text-sm text-gray-600">
                {selectedDateUnavailable
                  ? 'This day is currently unavailable. It may be blocked manually or already booked.'
                  : 'This day is currently open for bookings.'}
              </p>
            ) : null}

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => void handleBlock()}
                disabled={!selectedDateKey || isSaving || isLoading}
                className="w-full rounded-lg bg-[#B74140] px-4 py-3 font-semibold text-white transition-colors hover:bg-[#9d3837] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? 'Saving...' : 'Block Full Day'}
              </button>

              <button
                type="button"
                onClick={() => void handleUnblock()}
                disabled={!selectedDateKey || isSaving || isLoading}
                className="w-full rounded-lg border border-[#E5E7EB] px-4 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Clear Manual Block
              </button>
            </div>

            {isLoading ? (
              <p className="mt-4 text-sm text-gray-500">Loading availability...</p>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}
