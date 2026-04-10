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
  Plus,
  Presentation,
  Shield,
  Snowflake,
  Upload,
  Utensils,
  Wifi,
  X,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

import { api, getApiErrorMessage } from '@/lib/api';
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
    discount?: { type?: string; value?: number };
    amenities?: Record<string, boolean>;
  };
  capacity?: { maximumGuests?: number };
  media?: { galleryImages?: string[]; videoUrl?: string };
  availabilityOverrides?: Array<{
    date?: string;
    slots?: Array<{ hour?: number; status?: string }>;
  }>;
}

interface VenueDetailResponse {
  success: boolean;
  data?: VenueDetail;
}

interface AvailabilityOverride {
  date: string;
  slots: Array<{ hour: number; status: OverrideStatus }>;
}

interface UploadPreview {
  file: File;
  previewUrl: string;
}

interface VenueFormState {
  venueName: string;
  venueType: string;
  description: string;
  addressLine: string;
  city: string;
  area: string;
  basePrice: string;
  currency: string;
  discountType: string;
  discountValue: string;
  maximumGuests: string;
  videoUrl: string;
  galleryImages: string[];
  amenities: Record<string, boolean>;
  availabilityOverrides: AvailabilityOverride[];
}

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const amenityDefinitions = [
  { id: 'wifi', label: 'Wi-Fi', icon: <Wifi className="h-4 w-4" /> },
  { id: 'parking', label: 'Parking', icon: <Car className="h-4 w-4" /> },
  { id: 'airConditioned', label: 'AC', icon: <Snowflake className="h-4 w-4" /> },
  { id: 'catering', label: 'Catering', icon: <Utensils className="h-4 w-4" /> },
  { id: 'audioVideo', label: 'Audio/Video', icon: <Music className="h-4 w-4" /> },
  { id: 'security', label: 'Security', icon: <Shield className="h-4 w-4" /> },
  { id: 'accessible', label: 'Accessible', icon: <Accessibility className="h-4 w-4" /> },
  { id: 'stage', label: 'Sound System', icon: <Presentation className="h-4 w-4" /> },
];

const createEmptyFormState = (): VenueFormState => ({
  venueName: '',
  venueType: '',
  description: '',
  addressLine: '',
  city: '',
  area: '',
  basePrice: '',
  currency: 'BDT',
  discountType: 'percentage',
  discountValue: '',
  maximumGuests: '',
  videoUrl: '',
  galleryImages: [],
  amenities: {},
  availabilityOverrides: [],
});

const normalizeStatus = (status?: string): OverrideStatus =>
  status === 'booked' || status === 'pending' ? status : 'available';

const getOverrideSummaryStatus = (override?: AvailabilityOverride) => {
  if (!override?.slots.length) return null;
  if (override.slots.some((slot) => slot.status === 'booked')) return 'booked';
  if (override.slots.some((slot) => slot.status === 'pending')) return 'pending';
  return 'available';
};

const getDateKey = (year: number, month: number, day: number) =>
  `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

const getInitialMonthDate = (overrides: AvailabilityOverride[]) => {
  const parsed = overrides[0]?.date ? new Date(overrides[0].date) : new Date();
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

const getCalendarCellClassName = (status: OverrideStatus | null, isSelected: boolean) => {
  const selectedClass = isSelected ? ' ring-2 ring-[#B74140] ring-offset-1' : '';
  if (status === 'booked') return `aspect-square rounded-lg bg-[#FDECEC] text-[#B74444] hover:bg-[#f9dede]${selectedClass}`;
  if (status === 'pending') return `aspect-square rounded-lg bg-[#FFF4D6] text-[#946200] hover:bg-[#fdeec0]${selectedClass}`;
  if (status === 'available') return `aspect-square rounded-lg bg-[#E8F8F0] text-[#2F855A] hover:bg-[#dcf1e7]${selectedClass}`;
  return `aspect-square rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50${selectedClass}`;
};

const formatHourLabel = (hour: number) => `${hour % 12 === 0 ? 12 : hour % 12}:00 ${hour >= 12 ? 'PM' : 'AM'}`;

const formatDisplayDate = (date: string) => {
  return formatDateDDMMYY(date, date);
};

export default function EditVenuePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [formData, setFormData] = useState<VenueFormState>(createEmptyFormState);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [uploadPreviews, setUploadPreviews] = useState<UploadPreview[]>([]);
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
        const response = await api.get<VenueDetailResponse>(`/api/v1/venue-provider/venues/${venueId}`);
        const venue = response.data.data;
        if (!venue) {
          setError('Venue details were not found.');
          return;
        }

        const availabilityOverrides = (venue.availabilityOverrides ?? [])
          .filter((override): override is NonNullable<VenueDetail['availabilityOverrides']>[number] => Boolean(override?.date))
          .map((override) => ({
            date: override.date?.trim() || '',
            slots: (override.slots ?? []).map((slot) => ({
              hour: typeof slot.hour === 'number' ? slot.hour : 0,
              status: normalizeStatus(slot.status?.trim().toLowerCase()),
            })),
          }));

        setFormData({
          venueName: venue.information?.venueName?.trim() || '',
          venueType: venue.information?.venueType?.trim() || '',
          description: venue.information?.description?.trim() || '',
          addressLine: venue.information?.addressLine?.trim() || '',
          city: venue.information?.city?.trim() || '',
          area: venue.information?.area?.trim() || '',
          basePrice: typeof venue.pricing?.basePrice === 'number' ? String(venue.pricing.basePrice) : '',
          currency: venue.pricing?.currency?.trim() || 'BDT',
          discountType: venue.pricing?.discount?.type?.trim() || 'percentage',
          discountValue: typeof venue.pricing?.discount?.value === 'number' ? String(venue.pricing.discount.value) : '',
          maximumGuests: typeof venue.capacity?.maximumGuests === 'number' ? String(venue.capacity.maximumGuests) : '',
          videoUrl: venue.media?.videoUrl?.trim() || '',
          galleryImages: Array.isArray(venue.media?.galleryImages)
            ? venue.media.galleryImages.filter((image): image is string => typeof image === 'string' && Boolean(image.trim()))
            : [],
          amenities: venue.pricing?.amenities ?? {},
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

    fetchVenue();
  }, [params?.id]);

  useEffect(() => () => {
    uploadPreviews.forEach((preview) => URL.revokeObjectURL(preview.previewUrl));
  }, [uploadPreviews]);

  const handleInputChange = (field: keyof Omit<VenueFormState, 'galleryImages' | 'amenities' | 'availabilityOverrides'>, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleAmenityToggle = (amenityId: string) => {
    setFormData((current) => ({
      ...current,
      amenities: { ...current.amenities, [amenityId]: !current.amenities[amenityId] },
    }));
  };

  const handleSlotStatusChange = (slotIndex: number, status: OverrideStatus) => {
    if (!selectedDateKey) return;
    setFormData((current) => ({
      ...current,
      availabilityOverrides: current.availabilityOverrides.map((override) =>
        override.date !== selectedDateKey
          ? override
          : {
              ...override,
              slots: override.slots.map((slot, currentIndex) =>
                currentIndex === slotIndex ? { ...slot, status } : slot
              ),
            }
      ),
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    const nextPreviews = files.map((file) => ({ file, previewUrl: URL.createObjectURL(file) }));
    setUploadPreviews((current) => [...current, ...nextPreviews]);
    event.target.value = '';
  };

  const removeUploadPreview = (index: number) => {
    setUploadPreviews((current) => {
      const target = current[index];
      if (target) URL.revokeObjectURL(target.previewUrl);
      return current.filter((_, currentIndex) => currentIndex !== index);
    });
  };

  const availabilityMap = useMemo(
    () => new Map(formData.availabilityOverrides.map((override) => [override.date, getOverrideSummaryStatus(override)])),
    [formData.availabilityOverrides]
  );

  const selectedOverride = useMemo(
    () => formData.availabilityOverrides.find((override) => override.date === selectedDateKey) ?? null,
    [formData.availabilityOverrides, selectedDateKey]
  );

  const displayedImages = useMemo(
    () => [...formData.galleryImages, ...uploadPreviews.map((preview) => preview.previewUrl)],
    [formData.galleryImages, uploadPreviews]
  );

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  return (
    <div className="min-h-screen p-8 md:px-20 xl:px-40">
      <div>
        <button className="mb-4 flex items-center gap-2" onClick={() => router.push('/venueprovider/dashboard/myVanue')}>
          <ArrowLeftIcon className="h-7 w-7" />
          <h1 className="text-[30px] font-bold leading-[36px] text-gray-900">Edit Venue</h1>
        </button>

        {isLoading ? (
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-10 text-center text-gray-500">Loading venue details...</div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
                <h2 className="mb-6 text-xl font-bold text-gray-900">Venue Information</h2>

                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-900">Venue Name</label>
                    <input
                      type="text"
                      value={formData.venueName}
                      onChange={(event) => handleInputChange('venueName', event.target.value)}
                      placeholder="Enter venue name"
                      className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2.5 outline-none transition-colors focus:border-gray-400"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-900">Venue Type</label>
                    <select
                      value={formData.venueType}
                      onChange={(event) => handleInputChange('venueType', event.target.value)}
                      className="w-full appearance-none rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5 outline-none transition-colors focus:border-gray-400"
                    >
                      <option value="">Select venue type</option>
                      <option value="Banquet">Banquet</option>
                      <option value="Wedding Hall">Wedding Hall</option>
                      <option value="Conference Room">Conference Room</option>
                      <option value="Rooftop">Rooftop</option>
                      <option value="Outdoor Garden">Outdoor Garden</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-900">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(event) => handleInputChange('description', event.target.value)}
                      placeholder="Premium event venue in central Dhaka."
                      rows={4}
                      className="w-full resize-none rounded-lg border border-[#E5E7EB] px-4 py-2.5 outline-none transition-colors focus:border-gray-400"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-900">Address Line</label>
                      <input
                        type="text"
                        value={formData.addressLine}
                        onChange={(event) => handleInputChange('addressLine', event.target.value)}
                        placeholder="123 Main Road"
                        className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2.5 outline-none transition-colors focus:border-gray-400"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-900">Map Location</label>
                      <div className="flex h-[140px] items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-[#E5E7EB] bg-[#FAFAFA] text-center text-xs text-gray-500">
                        Map selection is not available here yet.
                      </div>
                      <div className="mt-2 text-xs text-gray-500">Venue location follows the add venue page layout.</div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-900">City</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(event) => handleInputChange('city', event.target.value)}
                        placeholder="Collected from map or enter manually"
                        className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2.5 outline-none transition-colors focus:border-gray-400"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-900">Area</label>
                      <input
                        type="text"
                        value={formData.area}
                        onChange={(event) => handleInputChange('area', event.target.value)}
                        placeholder="Collected from map or enter manually"
                        className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2.5 outline-none transition-colors focus:border-gray-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
                <h2 className="mb-6 text-xl font-bold text-gray-900">Pricing</h2>

                <div className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-900">Base Price</label>
                      <input
                        type="number"
                        value={formData.basePrice}
                        onChange={(event) => handleInputChange('basePrice', event.target.value)}
                        placeholder="5000"
                        className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2.5 outline-none transition-colors focus:border-gray-400"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-900">Currency</label>
                      <select
                        value={formData.currency}
                        onChange={(event) => handleInputChange('currency', event.target.value)}
                        className="w-full appearance-none rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5 outline-none transition-colors focus:border-gray-400"
                      >
                        <option value="BDT">BDT</option>
                        <option value="GBP">GBP</option>
                        <option value="USD">USD</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-900">Discount Type</label>
                      <select
                        value={formData.discountType}
                        onChange={(event) => handleInputChange('discountType', event.target.value)}
                        className="w-full appearance-none rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5 outline-none transition-colors focus:border-gray-400"
                      >
                        <option value="percentage">Percentage</option>
                        <option value="fixed">Fixed</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-900">Discount Value</label>
                      <input
                        type="number"
                        value={formData.discountValue}
                        onChange={(event) => handleInputChange('discountValue', event.target.value)}
                        placeholder="10"
                        className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2.5 outline-none transition-colors focus:border-gray-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
                <h2 className="mb-6 text-xl font-bold text-gray-900">Amenities</h2>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {amenityDefinitions.map((amenity) => (
                    <button
                      key={amenity.id}
                      type="button"
                      onClick={() => handleAmenityToggle(amenity.id)}
                      className={`rounded-xl border p-4 transition-all ${formData.amenities[amenity.id] ? 'border-[#B74140] bg-[#B74140]/5' : 'border-[#E5E7EB]'}`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="text-gray-600">{amenity.icon}</div>
                        <span className="text-sm font-medium text-gray-700">{amenity.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
                <h2 className="mb-6 text-xl font-bold text-gray-900">Capacity</h2>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900">Maximum Guests</label>
                  <input
                    type="number"
                    value={formData.maximumGuests}
                    onChange={(event) => handleInputChange('maximumGuests', event.target.value)}
                    placeholder="300"
                    className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2.5 outline-none transition-colors focus:border-gray-400"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
                <h2 className="mb-6 text-xl font-bold text-gray-900">Media</h2>

                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-900">Venue Images</label>
                    <div className="rounded-xl border-2 border-dashed border-[#E5E7EB] p-8 text-center">
                      <Upload className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                      <p className="mb-1 font-medium text-gray-700">Upload venue images</p>
                      <p className="mb-4 text-sm text-gray-500">You can preview additional images here while editing.</p>
                      <input
                        type="file"
                        id="venue-edit-images-upload"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="venue-edit-images-upload"
                        className="inline-block cursor-pointer rounded-lg bg-[#B74140] px-6 py-2.5 text-white transition-colors hover:bg-[#862c2a]"
                      >
                        Choose Images
                      </label>
                    </div>

                    {displayedImages.length ? (
                      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
                        {displayedImages.map((image, index) => {
                          const uploadIndex = index - formData.galleryImages.length;
                          const isNewUpload = uploadIndex >= 0;

                          return (
                            <div key={`${image}-${index}`} className="group relative aspect-video overflow-hidden rounded-lg bg-gray-100">
                              <Image src={image} alt={`Venue image ${index + 1}`} fill unoptimized className="object-cover" />
                              {isNewUpload ? (
                                <button
                                  type="button"
                                  onClick={() => removeUploadPreview(uploadIndex)}
                                  className="absolute right-2 top-2 rounded-full bg-[#B74140] p-1 text-white opacity-0 transition-opacity hover:bg-[#862c2a] group-hover:opacity-100"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              ) : null}
                            </div>
                          );
                        })}
                        <div className="flex aspect-video items-center justify-center rounded-lg border border-dashed border-[#E5E7EB] text-gray-500">
                          <Plus className="h-5 w-5" />
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-900">Video URL</label>
                    <input
                      type="text"
                      value={formData.videoUrl}
                      onChange={(event) => handleInputChange('videoUrl', event.target.value)}
                      placeholder="https://www.youtube.com/watch?v=abc123"
                      className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2.5 outline-none transition-colors focus:border-gray-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
                <h2 className="mb-6 text-xl font-bold text-gray-900">Availability Overrides</h2>

                <div className="mb-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">
                      {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                    </h3>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                        className="rounded p-1 outline-none transition-colors hover:bg-gray-100"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
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
                      const dateKey = getDateKey(currentMonth.getFullYear(), currentMonth.getMonth(), day);
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
                </div>

                <div className="border-t pt-4">
                  <p className="mb-3 text-sm font-medium text-gray-900">
                    {selectedDateKey ? `Hourly slots for ${formatDisplayDate(selectedDateKey)}` : 'Select a date to review hourly slots'}
                  </p>

                  {selectedOverride?.slots.length ? (
                    <div className="space-y-2">
                      {selectedOverride.slots.map((slot, index) => (
                        <div key={`${slot.hour}-${index}`} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                          <span className="text-sm font-medium text-gray-800">{formatHourLabel(slot.hour)}</span>
                          <select
                            value={slot.status}
                            onChange={(event) => handleSlotStatusChange(index, normalizeStatus(event.target.value))}
                            className="rounded-md border border-[#E5E7EB] bg-white px-2 py-1 text-sm outline-none transition-colors focus:border-gray-400"
                          >
                            <option value="available">Available</option>
                            <option value="pending">Pending</option>
                            <option value="booked">Booked</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No override slots for the selected day.</p>
                  )}
                </div>

                {formData.availabilityOverrides.length ? (
                  <div className="mt-4 space-y-2 border-t pt-4">
                    <p className="text-sm font-medium text-gray-900">Saved Overrides</p>
                    {formData.availabilityOverrides.map((override) => (
                      <div key={override.date} className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700">
                        <p className="font-medium text-gray-800">{formatDisplayDate(override.date)}</p>
                        <p className="text-xs text-gray-500">{override.slots.length} slot{override.slots.length === 1 ? '' : 's'} saved</p>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
                <h2 className="mb-6 text-xl font-bold text-gray-900">Publish Settings</h2>
                <p className="mb-4 text-sm text-gray-500">This page now follows the add venue layout. Update submission is not connected yet.</p>
                <button
                  type="button"
                  onClick={() => router.push('/venueprovider/dashboard/myVanue')}
                  className="w-full rounded-lg bg-[#B74140] py-3 font-semibold text-white transition-colors outline-none hover:bg-[#802423]"
                >
                  Back to Venue List
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
