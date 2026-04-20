'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import {
  Accessibility,
  ArrowLeftIcon,
  Car,
  ChevronLeft,
  ChevronRight,
  Music,
  Presentation,
  Shield,
  Snowflake,
  Utensils,
  Wifi,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

import { api, getApiErrorMessage } from '@/lib/api';
import { GBP_CURRENCY_LABEL } from '@/lib/currency';
import { formatDateDDMMYY } from '@/lib/date';

type OverrideStatus = 'available' | 'pending' | 'booked';

interface VenueDetail {
  _id: string;
  information?: {
    venueName?: string;
    venueType?: string;
    description?: string;
    addressLine?: string;
    city?: string;
    area?: string;
  };
  pricing?: {
    basePrice?: number;
    currency?: string;
    discount?: {
      type?: string;
      value?: number;
    };
    amenities?: Record<string, boolean>;
  };
  capacity?: {
    maximumGuests?: number;
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

interface VenueDetailResponse {
  success: boolean;
  data?: VenueDetail;
}

interface VenueListMeta {
  page?: number;
  totalPages?: number;
}

interface VenueListResponse {
  success: boolean;
  meta?: VenueListMeta;
  data?: VenueDetail[];
}

interface AmenityDefinition {
  id: string;
  label: string;
  icon: React.ReactNode;
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

const normalizeAmenities = (amenities?: Record<string, boolean>) => {
  const normalizedAmenities: Record<string, boolean> = {};

  if (!amenities) {
    return normalizedAmenities;
  }

  Object.entries(amenities).forEach(([key, value]) => {
    if (!value) {
      return;
    }

    if (key === 'airConditioned') {
      normalizedAmenities.ac = true;
      return;
    }

    if (key === 'stage') {
      normalizedAmenities.soundSystem = true;
      return;
    }

    normalizedAmenities[key] = true;
  });

  return normalizedAmenities;
};

const amenityDefinitions: AmenityDefinition[] = [
  { id: 'wifi', label: 'Wi-Fi', icon: <Wifi className="h-4 w-4" /> },
  { id: 'parking', label: 'Parking', icon: <Car className="h-4 w-4" /> },
  { id: 'ac', label: 'AC', icon: <Snowflake className="h-4 w-4" /> },
  { id: 'catering', label: 'Catering', icon: <Utensils className="h-4 w-4" /> },
  { id: 'audioVideo', label: 'Audio/Video', icon: <Music className="h-4 w-4" /> },
  { id: 'security', label: 'Security', icon: <Shield className="h-4 w-4" /> },
  { id: 'accessible', label: 'Accessible', icon: <Accessibility className="h-4 w-4" /> },
  { id: 'soundSystem', label: 'Sound System', icon: <Presentation className="h-4 w-4" /> },
];

const normalizeStatus = (status?: string): OverrideStatus =>
  status === 'booked' || status === 'pending' ? status : 'available';

const getOverrideSummaryStatus = (override?: AvailabilityOverride): OverrideStatus | null => {
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

const getCalendarCellClassName = (status: OverrideStatus | null, isSelected: boolean) => {
  const baseClassName =
    'h-9 rounded-md text-xs font-medium transition-colors md:h-10';

  const selectedClassName = isSelected ? ' ring-2 ring-[#B74140] ring-offset-1' : '';

  if (status === 'available') {
    return `${baseClassName} bg-[#2ECC71] text-white${selectedClassName}`;
  }

  if (status === 'pending') {
    return `${baseClassName} bg-[#F2C94C] text-white${selectedClassName}`;
  }

  if (status === 'booked') {
    return `${baseClassName} bg-[#EB5757] text-white${selectedClassName}`;
  }

  return `${baseClassName} bg-[#E8F8F0] text-[#2F855A]${selectedClassName}`;
};

const formatHourLabel = (hour: number) => {
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const normalizedHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${normalizedHour}:00 ${suffix}`;
};

const formatDisplayDate = (date: string) => {
  return formatDateDDMMYY(date, date);
};

const findVenueInProviderList = async (venueId: string) => {
  let currentPage = 1;
  let totalPages = 1;

  while (currentPage <= totalPages) {
    const response = await api.get<VenueListResponse>('/api/v1/venue-provider/my-venues', {
      params: {
        page: currentPage,
        limit: 100,
      },
    });

    const venues = Array.isArray(response.data.data) ? response.data.data : [];
    const matchedVenue = venues.find((venue) => venue._id === venueId);

    if (matchedVenue) {
      return matchedVenue;
    }

    totalPages =
      typeof response.data.meta?.totalPages === 'number' && response.data.meta.totalPages > 0
        ? response.data.meta.totalPages
        : currentPage;
    currentPage += 1;
  }

  return null;
};

export default function ViewVenuePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [venue, setVenue] = useState<VenueDetail | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const venueId = params?.id;

    if (!venueId) {
      setError('Venue id is missing.');
      setIsLoading(false);
      return;
    }

    const fetchVenue = async () => {
      try {
        setIsLoading(true);
        setError('');
        let nextVenue: VenueDetail | null = null;

        try {
          const response = await api.get<VenueDetailResponse>(
            `/api/v1/venue-provider/venues/${venueId}`
          );
          nextVenue = response.data.data ?? null;
        } catch (detailError) {
          nextVenue = await findVenueInProviderList(venueId);

          if (!nextVenue) {
            throw detailError;
          }
        }

        setVenue(nextVenue);

        const overrides = (nextVenue?.availabilityOverrides ?? [])
          .filter((override): override is NonNullable<VenueDetail['availabilityOverrides']>[number] => Boolean(override?.date))
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

    fetchVenue();
  }, [params?.id]);

  const overrides = useMemo<AvailabilityOverride[]>(
    () =>
      (venue?.availabilityOverrides ?? [])
        .filter((override): override is NonNullable<VenueDetail['availabilityOverrides']>[number] => Boolean(override?.date))
        .map((override) => ({
          date: override.date?.trim() || '',
          slots: (override.slots ?? []).map((slot) => ({
            hour: typeof slot.hour === 'number' ? slot.hour : 0,
            status: normalizeStatus(slot.status?.trim().toLowerCase()),
          })),
        })),
    [venue]
  );

  const availabilityMap = useMemo(() => {
    return new Map<string, OverrideStatus | null>(
      overrides.map((override) => [override.date, getOverrideSummaryStatus(override)])
    );
  }, [overrides]);

  const selectedOverride = useMemo(
    () => overrides.find((override) => override.date === selectedDateKey) ?? null,
    [overrides, selectedDateKey]
  );
  const venueAmenities = useMemo(
    () => normalizeAmenities(venue?.pricing?.amenities),
    [venue?.pricing?.amenities]
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
    <div className="min-h-screen p-8 md:px-20 xl:px-40">
      <div>
        <button
          type="button"
          className="mb-4 flex items-center gap-2"
          onClick={() => router.push('/venueprovider/dashboard/myVanue')}
        >
          <ArrowLeftIcon className="h-7 w-7" />
          <h1 className="text-[30px] font-bold leading-[36px] text-gray-900">View Venue</h1>
        </button>

        {isLoading ? (
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-10 text-center text-gray-500">
            Loading venue details...
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : venue ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <section className="rounded-xl border border-[#E5E7EB] bg-white p-6">
                <h2 className="mb-6 text-xl font-bold text-gray-900">Venue Information</h2>

                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-900">
                      Venue Name
                    </label>
                    <input
                      readOnly
                      value={venue.information?.venueName?.trim() || ''}
                      className="w-full rounded-lg border border-[#E5E7EB] bg-[#FCFCFC] px-4 py-2.5 text-sm text-gray-700"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-900">Venue Type</label>
                    <input readOnly value={venue.information?.venueType?.trim() || ''} className="w-full rounded-lg border border-[#E5E7EB] bg-[#FCFCFC] px-4 py-2.5 text-sm text-gray-700" />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-900">
                      Description
                    </label>
                    <textarea
                      readOnly
                      value={venue.information?.description?.trim() || ''}
                      rows={4}
                      className="w-full resize-none rounded-lg border border-[#E5E7EB] bg-[#FCFCFC] px-4 py-2.5 text-sm text-gray-700"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-900">Address Line</label>
                      <input readOnly value={venue.information?.addressLine?.trim() || ''} className="w-full rounded-lg border border-[#E5E7EB] bg-[#FCFCFC] px-4 py-2.5 text-sm text-gray-700" />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-900">Map Location</label>
                      <div className="flex h-[140px] items-center justify-center rounded-lg border-2 border-dashed border-[#E5E7EB] bg-[#FAFAFA] text-center text-xs text-gray-500">
                        Map preview unavailable
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-900">City</label>
                      <input readOnly value={venue.information?.city?.trim() || ''} className="w-full rounded-lg border border-[#E5E7EB] bg-[#FCFCFC] px-4 py-2.5 text-sm text-gray-700" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-900">Area</label>
                      <input readOnly value={venue.information?.area?.trim() || ''} className="w-full rounded-lg border border-[#E5E7EB] bg-[#FCFCFC] px-4 py-2.5 text-sm text-gray-700" />
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-[#E5E7EB] bg-white p-6">
                <h2 className="mb-6 text-xl font-bold text-gray-900">Pricing</h2>
                <div className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-900">Base Price</label>
                      <input readOnly value={typeof venue.pricing?.basePrice === 'number' ? venue.pricing.basePrice : ''} className="w-full rounded-lg border border-[#E5E7EB] bg-[#FCFCFC] px-4 py-2.5 text-sm text-gray-700" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-900">Currency</label>
                      <input readOnly value={GBP_CURRENCY_LABEL} className="w-full rounded-lg border border-[#E5E7EB] bg-[#FCFCFC] px-4 py-2.5 text-sm text-gray-700" />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-900">Discount Type</label>
                      <input readOnly value={venue.pricing?.discount?.type?.trim() || 'percentage'} className="w-full rounded-lg border border-[#E5E7EB] bg-[#FCFCFC] px-4 py-2.5 text-sm text-gray-700" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-900">Discount Value</label>
                      <input readOnly value={typeof venue.pricing?.discount?.value === 'number' ? venue.pricing.discount.value : ''} className="w-full rounded-lg border border-[#E5E7EB] bg-[#FCFCFC] px-4 py-2.5 text-sm text-gray-700" />
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-[#E5E7EB] bg-white p-6">
                <h2 className="mb-6 text-xl font-bold text-gray-900">Amenities</h2>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {amenityDefinitions.map((amenity) => (
                    <div
                      key={amenity.id}
                      className={`rounded-xl border p-4 ${
                        venueAmenities[amenity.id]
                          ? 'border-[#B74140] bg-[#B74140]/5'
                          : 'border-[#E5E7EB]'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2 text-center">
                        <div className="text-gray-600">{amenity.icon}</div>
                        <span className="text-sm font-medium text-gray-700">{amenity.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-xl border border-[#E5E7EB] bg-white p-6">
                <h2 className="mb-6 text-xl font-bold text-gray-900">Capacity</h2>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900">Maximum Guests</label>
                  <input
                    readOnly
                    value={typeof venue.capacity?.maximumGuests === 'number' ? venue.capacity.maximumGuests : ''}
                    className="w-full rounded-lg border border-[#E5E7EB] bg-[#FCFCFC] px-4 py-2.5 text-sm text-gray-700"
                  />
                </div>
              </section>

              <section className="rounded-xl border border-[#E5E7EB] bg-white p-6">
                <h2 className="mb-6 text-xl font-bold text-gray-900">Media</h2>
                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-900">Venue Images</label>
                    <div className="rounded-xl border-2 border-dashed border-[#E5E7EB] p-8 text-center">
                      <p className="font-medium text-gray-700">Uploaded venue images</p>
                      <p className="mt-1 text-sm text-gray-500">This page is read only.</p>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
                      {Array.isArray(venue.media?.galleryImages) && venue.media.galleryImages.length ? (
                        venue.media.galleryImages.map((image, index) => (
                          <div key={`${image}-${index}`} className="relative aspect-video overflow-hidden rounded-lg bg-gray-100">
                            <Image src={image} alt={`Venue image ${index + 1}`} fill unoptimized className="object-cover" />
                          </div>
                        ))
                      ) : (
                        <p className="col-span-3 text-sm text-gray-500">No gallery images available.</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-900">Video URL</label>
                    <input readOnly value={venue.media?.videoUrl?.trim() || ''} className="w-full rounded-lg border border-[#E5E7EB] bg-[#FCFCFC] px-4 py-2.5 text-sm text-gray-700" />
                  </div>
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <section className="rounded-xl border border-[#E5E7EB] bg-white p-6">
                <h2 className="mb-6 text-xl font-bold text-gray-900">Availability Overrides</h2>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentMonth(
                          new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
                        )
                      }
                      className="rounded p-1 outline-none transition-colors hover:bg-gray-100"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentMonth(
                          new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
                        )
                      }
                      className="rounded p-1 outline-none transition-colors hover:bg-gray-100"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {dayLabels.map((label) => (
                    <div key={label} className="py-2 text-center text-sm font-medium text-gray-600">
                      {label}
                    </div>
                  ))}
                  {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                    <div key={`empty-${index}`} className="aspect-square" />
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
                        className={getCalendarCellClassName(status, isSelected)}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>

                <div className="border-t pt-4">
                  <p className="mb-3 text-sm font-medium text-gray-900">
                    {selectedDateKey ? `Hourly slots for ${formatDisplayDate(selectedDateKey)}` : 'Select a date to review hourly slots'}
                  </p>
                  {selectedOverride?.slots.length ? (
                    <div className="space-y-2">
                      {selectedOverride.slots.map((slot, index) => (
                        <div
                          key={`${slot.hour}-${index}`}
                          className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
                        >
                          <span className="text-sm font-medium text-gray-800">{formatHourLabel(slot.hour)}</span>
                          <span
                            className={`rounded-full px-2.5 py-1 ${slot.status === 'available'
                              ? 'bg-[#E8F8F0] text-[#2F855A]'
                              : slot.status === 'pending'
                                ? 'bg-[#FFF4D6] text-[#946200]'
                                : 'bg-[#FDECEC] text-[#B74444]'
                              }`}
                          >
                            {slot.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">
                      No override slots for the selected day.
                    </p>
                  )}
                </div>

                {overrides.length ? (
                  <div className="mt-4 space-y-2 border-t pt-4">
                    <p className="text-sm font-medium text-gray-900">Saved Overrides</p>
                    {overrides.map((override) => (
                      <div key={override.date} className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700">
                        <p className="font-medium text-gray-800">{formatDisplayDate(override.date)}</p>
                        <p className="text-xs text-gray-500">{override.slots.length} slot{override.slots.length === 1 ? '' : 's'} saved</p>
                      </div>
                    ))}
                  </div>
                ) : null}
              </section>

              <section className="rounded-xl border border-[#E5E7EB] bg-white p-6">
                <h2 className="mb-6 text-xl font-bold text-gray-900">Publish Settings</h2>
                <p className="mb-4 text-sm text-gray-500">This page follows the add venue layout in read-only mode.</p>
                <button
                  type="button"
                  onClick={() => router.push('/venueprovider/dashboard/myVanue')}
                  className="w-full rounded-lg bg-[#B74140] py-3 font-semibold text-white transition-colors outline-none hover:bg-[#802423]"
                >
                  Back to Venue List
                </button>
              </section>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
