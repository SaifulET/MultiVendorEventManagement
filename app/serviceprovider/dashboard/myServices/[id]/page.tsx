'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { ArrowLeftIcon, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

import { api, getApiErrorMessage } from '@/lib/api';
import { formatDateDDMMYY } from '@/lib/date';

type OverrideStatus = 'available' | 'pending' | 'booked';

interface ServiceDetail {
  _id: string;
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

interface ServiceFormState {
  serviceName: string;
  category: string;
  description: string;
  amount: string;
  currency: string;
  videoUrl: string;
  galleryImages: string[];
  availabilityOverrides: AvailabilityOverride[];
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

const createEmptyFormState = (): ServiceFormState => ({
  serviceName: '',
  category: '',
  description: '',
  amount: '',
  currency: 'BDT',
  videoUrl: '',
  galleryImages: [],
  availabilityOverrides: [],
});

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

export default function EditServicePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [formData, setFormData] = useState<ServiceFormState>(createEmptyFormState);
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
        const service = response.data.data;

        if (!service) {
          setError('Service details were not found.');
          return;
        }

        const availabilityOverrides = (service.availabilityOverrides ?? [])
          .filter((override): override is NonNullable<ServiceDetail['availabilityOverrides']>[number] => Boolean(override?.date))
          .map((override) => ({
            date: override.date?.trim() || '',
            slots: (override.slots ?? []).map((slot) => ({
              hour: typeof slot.hour === 'number' ? slot.hour : 0,
              status: normalizeStatus(slot.status?.trim().toLowerCase()),
            })),
          }));

        setFormData({
          serviceName: service.information?.serviceName?.trim() || '',
          category:
            service.information?.category?.trim() ||
            service.information?.serviceCategory?.trim() ||
            '',
          description: service.information?.description?.trim() || '',
          amount: typeof service.pricing?.amount === 'number' ? String(service.pricing.amount) : '',
          currency: service.pricing?.currency?.trim() || 'BDT',
          videoUrl: service.media?.videoUrl?.trim() || '',
          galleryImages: Array.isArray(service.media?.galleryImages)
            ? service.media.galleryImages.filter(
                (image): image is string => typeof image === 'string' && Boolean(image.trim())
              )
            : [],
          availabilityOverrides,
        });

        const initialMonth = getInitialMonthDate(availabilityOverrides);
        setCurrentMonth(initialMonth);
        setSelectedDateKey(availabilityOverrides[0]?.date ?? null);
      } catch (fetchError) {
        setError(getApiErrorMessage(fetchError));
      } finally {
        setIsLoading(false);
      }
    };

    fetchService();
  }, [params?.id]);

  const handleInputChange = (field: keyof Omit<ServiceFormState, 'galleryImages' | 'availabilityOverrides'>, value: string) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const availabilityMap = useMemo(() => {
    return new Map<string, OverrideStatus | null>(
      formData.availabilityOverrides.map((override) => [override.date, getOverrideStatus(override)])
    );
  }, [formData.availabilityOverrides]);

  const selectedOverride = useMemo(
    () =>
      formData.availabilityOverrides.find((override) => override.date === selectedDateKey) ?? null,
    [formData.availabilityOverrides, selectedDateKey]
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

  const handleMonthChange = (direction: number) => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1)
    );
  };

  const handleSlotStatusChange = (slotIndex: number, status: OverrideStatus) => {
    if (!selectedDateKey) {
      return;
    }

    setFormData((current) => ({
      ...current,
      availabilityOverrides: current.availabilityOverrides.map((override) =>
        override.date !== selectedDateKey
          ? override
          : {
              ...override,
              slots: override.slots.map((slot, currentSlotIndex) =>
                currentSlotIndex === slotIndex ? { ...slot, status } : slot
              ),
            }
      ),
    }));
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            className="flex items-center gap-2 text-gray-900"
            onClick={() => router.push('/serviceprovider/dashboard/myServices')}
          >
            <ArrowLeftIcon className="h-6 w-6" />
            <span className="text-3xl font-bold">Edit Service</span>
          </button>

          <button
            type="button"
            onClick={() => router.push('/serviceprovider/dashboard/myServices')}
            className="rounded-md bg-[#B74140] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#9d3837]"
          >
            Publish Service
          </button>
        </div>

        {isLoading ? (
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-10 text-center text-gray-500">
            Loading service details...
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : (
          <div className="space-y-6">
            <section className="rounded-xl border border-[#EDEDED] bg-white p-6">
              <div className="mb-5 flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FCECEC] text-sm font-semibold text-[#B74140]">
                  1
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
                  <p className="text-sm text-gray-500">Enter the core details of your service</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Service Name
                  </label>
                  <input
                    value={formData.serviceName}
                    onChange={(e) => handleInputChange('serviceName', e.target.value)}
                    className="w-full rounded-lg border border-[#E5E7EB] px-4 py-3 outline-none focus:border-[#B74140]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Service Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 outline-none focus:border-[#B74140]"
                  >
                    <option value="">Select category</option>
                    <option value="Home Cleaning">Home Cleaning</option>
                    <option value="Catering">Catering</option>
                    <option value="Photography">Photography</option>
                    <option value="Decoration">Decoration</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={5}
                    className="w-full rounded-lg border border-[#E5E7EB] px-4 py-3 outline-none focus:border-[#B74140]"
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
                  <p className="text-sm text-gray-500">Define pricing structure</p>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Per Hour</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                    {formData.currency || '$'}
                  </span>
                  <input
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    className="w-full rounded-lg border border-[#E5E7EB] py-3 pl-12 pr-4 outline-none focus:border-[#B74140]"
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
                  {formData.galleryImages.map((image, index) => (
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
                  ))}
                  <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed border-[#E5E7EB] text-gray-400">
                    <Plus className="mb-2 h-6 w-6" />
                    <span className="text-sm">Add Image</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Video Link (YouTube / Vimeo)
                </label>
                <input
                  value={formData.videoUrl}
                  onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                  className="w-full rounded-lg border border-[#E5E7EB] px-4 py-3 outline-none focus:border-[#B74140]"
                />
              </div>
            </section>

            <section className="rounded-xl border border-[#EDEDED] bg-white p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Availability Calendar</h2>
                  <p className="text-sm text-gray-500">
                    Availability overrides loaded from the selected service
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <button
                    type="button"
                    onClick={() => handleMonthChange(-1)}
                    className="rounded p-1 transition-colors hover:bg-gray-100"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span>
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleMonthChange(1)}
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
                        className="flex flex-col gap-3 rounded-lg border border-[#E5E7EB] bg-white p-3 md:flex-row md:items-center md:justify-between"
                      >
                        <span className="text-sm font-medium text-gray-700">
                          {formatHourLabel(slot.hour)}
                        </span>
                        <select
                          value={slot.status}
                          onChange={(e) =>
                            handleSlotStatusChange(slotIndex, normalizeStatus(e.target.value))
                          }
                          className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm outline-none focus:border-[#B74140]"
                        >
                          <option value="available">Available</option>
                          <option value="pending">Pending</option>
                          <option value="booked">Booked</option>
                        </select>
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
        )}
      </div>
    </div>
  );
}
