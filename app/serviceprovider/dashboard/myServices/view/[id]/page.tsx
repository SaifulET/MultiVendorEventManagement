'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { ArrowLeftIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

import { api, getApiErrorMessage } from '@/lib/api';
import { formatDateDDMMYY } from '@/lib/date';

type OverrideStatus = 'available' | 'pending' | 'booked';

interface ServiceDetail {
  information?: {
    serviceName?: string;
    category?: string;
    serviceCategory?: string;
    description?: string;
  };
  pricing?: {
    amount?: number;
    currency?: string;
  };
  media?: {
    galleryImages?: string[];
    videoUrl?: string;
  };
  availabilityOverrides?: Array<{
    date?: string;
    slots?: Array<{
      hour?: number;
      status?: string;
    }>;
  }>;
  publishStatus?: string;
}

interface ServiceDetailResponse {
  success: boolean;
  data?: ServiceDetail;
}

interface AvailabilityOverride {
  date: string;
  slots: Array<{
    hour: number;
    status: OverrideStatus;
  }>;
}

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

const normalizeStatus = (status?: string): OverrideStatus =>
  status === 'booked' || status === 'pending' ? status : 'available';

const getOverrideStatus = (override?: AvailabilityOverride): OverrideStatus | null => {
  if (!override?.slots.length) {
    return null;
  }

  if (override.slots.some((slot) => slot.status === 'booked')) {
    return 'booked';
  }

  if (override.slots.some((slot) => slot.status === 'pending')) {
    return 'pending';
  }

  return 'available';
};

const getStatusClasses = (status: OverrideStatus | null) => {
  if (status === 'available') {
    return 'bg-[#DFF5EF] text-[#275B4A]';
  }

  if (status === 'pending') {
    return 'bg-[#FFF2CC] text-[#8A6A00]';
  }

  if (status === 'booked') {
    return 'bg-[#FDE2E2] text-[#A14B4B]';
  }

  return 'bg-[#F4F5F7] text-[#6B7280]';
};

const getDateKey = (year: number, month: number, day: number) =>
  `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

const getInitialMonthDate = (overrides: AvailabilityOverride[]) => {
  const firstOverride = overrides.find((override) => override.date);

  if (!firstOverride) {
    return new Date();
  }

  const parsed = new Date(firstOverride.date);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

const formatHourLabel = (hour: number) => {
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const normalizedHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${normalizedHour}:00 ${suffix}`;
};

export default function ViewServicePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [service, setService] = useState<ServiceDetail | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const serviceId = params?.id;

    if (!serviceId) {
      setError('Service id is missing.');
      setIsLoading(false);
      return;
    }

    const fetchService = async () => {
      try {
        setIsLoading(true);
        setError('');
        const response = await api.get<ServiceDetailResponse>(
          `/api/v1/service-provider/services/${serviceId}`
        );
        const nextService = response.data.data ?? null;
        setService(nextService);

        const overrides = (nextService?.availabilityOverrides ?? [])
          .filter((override): override is NonNullable<ServiceDetail['availabilityOverrides']>[number] => Boolean(override?.date))
          .map((override) => ({
            date: override.date?.trim() || '',
            slots: (override.slots ?? []).map((slot) => ({
              hour: typeof slot.hour === 'number' ? slot.hour : 0,
              status: normalizeStatus(slot.status?.trim().toLowerCase()),
            })),
          }));

        setCurrentMonth(getInitialMonthDate(overrides));
        setSelectedDateKey(overrides[0]?.date ?? null);
      } catch (fetchError) {
        setError(getApiErrorMessage(fetchError));
      } finally {
        setIsLoading(false);
      }
    };

    fetchService();
  }, [params?.id]);

  const overrides = useMemo<AvailabilityOverride[]>(
    () =>
      (service?.availabilityOverrides ?? [])
        .filter((override): override is NonNullable<ServiceDetail['availabilityOverrides']>[number] => Boolean(override?.date))
        .map((override) => ({
          date: override.date?.trim() || '',
          slots: (override.slots ?? []).map((slot) => ({
            hour: typeof slot.hour === 'number' ? slot.hour : 0,
            status: normalizeStatus(slot.status?.trim().toLowerCase()),
          })),
        })),
    [service]
  );

  const availabilityMap = useMemo(() => {
    return new Map(overrides.map((override) => [override.date, getOverrideStatus(override)]));
  }, [overrides]);

  const selectedOverride = useMemo(
    () => overrides.find((override) => override.date === selectedDateKey) ?? null,
    [overrides, selectedDateKey]
  );

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

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <button
          type="button"
          className="mb-6 flex items-center gap-2 text-gray-900"
          onClick={() => router.push('/serviceprovider/dashboard/myServices')}
        >
          <ArrowLeftIcon className="h-6 w-6" />
          <span className="text-3xl font-bold">View Service</span>
        </button>

        {isLoading ? (
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-10 text-center text-gray-500">
            Loading service details...
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : service ? (
          <div className="space-y-6">
            <section className="rounded-xl border border-[#EDEDED] bg-white p-6">
              <div className="mb-5 flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FCECEC] text-sm font-semibold text-[#B74140]">
                  1
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
                  <p className="text-sm text-gray-500">Service details from your listing</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Service Name
                  </label>
                  <input
                    readOnly
                    value={service.information?.serviceName?.trim() || ''}
                    className="w-full rounded-lg border border-[#E5E7EB] bg-[#FCFCFC] px-4 py-3 text-gray-700"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Service Category
                  </label>
                  <input
                    readOnly
                    value={
                      service.information?.category?.trim() ||
                      service.information?.serviceCategory?.trim() ||
                      ''
                    }
                    className="w-full rounded-lg border border-[#E5E7EB] bg-[#FCFCFC] px-4 py-3 text-gray-700"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    readOnly
                    rows={5}
                    value={service.information?.description?.trim() || ''}
                    className="w-full rounded-lg border border-[#E5E7EB] bg-[#FCFCFC] px-4 py-3 text-gray-700"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-[#EDEDED] bg-white p-6">
              <div className="mb-5 flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FCECEC] text-sm font-semibold text-[#B74140]">
                  2
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Pricing</h2>
                  <p className="text-sm text-gray-500">Pricing structure</p>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Per Hour</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                    {service.pricing?.currency?.trim() || 'BDT'}
                  </span>
                  <input
                    readOnly
                    value={typeof service.pricing?.amount === 'number' ? service.pricing.amount : ''}
                    className="w-full rounded-lg border border-[#E5E7EB] bg-[#FCFCFC] py-3 pl-12 pr-4 text-gray-700"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-[#EDEDED] bg-white p-6">
              <div className="mb-5 flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FCECEC] text-sm font-semibold text-[#B74140]">
                  3
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Portfolio / Media</h2>
                </div>
              </div>

              <div className="mb-6">
                <label className="mb-3 block text-sm font-medium text-gray-700">
                  Image Gallery
                </label>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {Array.isArray(service.media?.galleryImages) && service.media.galleryImages.length ? (
                    service.media.galleryImages.map((image, index) => (
                      <div
                        key={`${image}-${index}`}
                        className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-[#F7F7F7]"
                      >
                        <Image
                          src={image}
                          alt={`Service image ${index + 1}`}
                          width={320}
                          height={240}
                          unoptimized
                          className="h-40 w-full object-cover"
                        />
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No gallery images available.</p>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Video Link (YouTube / Vimeo)
                </label>
                <input
                  readOnly
                  value={service.media?.videoUrl?.trim() || ''}
                  className="w-full rounded-lg border border-[#E5E7EB] bg-[#FCFCFC] px-4 py-3 text-gray-700"
                />
              </div>
            </section>

            <section className="rounded-xl border border-[#EDEDED] bg-white p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Availability Calendar</h2>
                  <p className="text-sm text-gray-500">
                    Availability overrides for this service
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentMonth(
                        new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
                      )
                    }
                    className="rounded p-1 transition-colors hover:bg-gray-100"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span>
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentMonth(
                        new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
                      )
                    }
                    className="rounded p-1 transition-colors hover:bg-gray-100"
                  >
                    <ChevronRight className="h-4 w-4" />
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
                  <div key={`empty-${index}`} className="h-10 rounded-lg bg-transparent md:h-12" />
                ))}
                {Array.from({ length: daysInMonth }, (_, index) => {
                  const day = index + 1;
                  const dateKey = getDateKey(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth(),
                    day
                  );
                  const status = availabilityMap.get(dateKey) ?? null;
                  const isSelected = selectedDateKey === dateKey;

                  return (
                    <button
                      key={dateKey}
                      type="button"
                      onClick={() => setSelectedDateKey(dateKey)}
                      className={`h-10 rounded-lg text-sm font-medium transition-colors md:h-12 ${
                        getStatusClasses(status)
                      } ${isSelected ? 'ring-2 ring-[#22C55E] ring-offset-1' : ''}`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded bg-[#22C55E]" />
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded bg-[#F59E0B]" />
                  <span>Pending Bookings</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded bg-[#EF4444]" />
                  <span>Booked</span>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] p-4">
                <h3 className="mb-3 text-sm font-semibold text-gray-900">
                  {selectedDateKey
                    ? `Override Slots for ${formatDateDDMMYY(selectedDateKey, selectedDateKey)}`
                    : 'Override Slots'}
                </h3>

                {selectedOverride?.slots.length ? (
                  <div className="space-y-3">
                    {selectedOverride.slots.map((slot, slotIndex) => (
                      <div
                        key={`${slot.hour}-${slotIndex}`}
                        className="flex flex-col gap-2 rounded-lg border border-[#E5E7EB] bg-white p-3 md:flex-row md:items-center md:justify-between"
                      >
                        <span className="text-sm font-medium text-gray-700">
                          {formatHourLabel(slot.hour)}
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(
                            slot.status
                          )}`}
                        >
                          {slot.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    No availability override slots for the selected day.
                  </p>
                )}
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </div>
  );
}
