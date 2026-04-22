'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { ArrowLeftIcon, ChevronLeft, ChevronRight, Plus, Upload, X } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

import { api, getApiErrorMessage } from '@/lib/api';
import { GBP_CURRENCY_CODE, GBP_CURRENCY_SYMBOL } from '@/lib/currency';
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
    discount?: {
      type?: 'percentage' | 'fixed';
      value?: number;
    };
  };
  media?: {
    galleryImages?: string[];
    videoUrl?: string;
  };
  availability?: Record<string, number[]>;
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

interface AvailabilityResponse {
  success: boolean;
  data?: {
    availability?: Record<string, number[]>;
  };
}

interface ServiceListMeta {
  page?: number;
  totalPages?: number;
}

interface ServiceListResponse {
  success: boolean;
  meta?: ServiceListMeta;
  data?: ServiceDetail[];
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

interface AvailabilityOverride {
  date: string;
  slots: Array<{
    hour: number;
    status: OverrideStatus;
  }>;
}

interface UploadPreview {
  file: File;
  previewUrl: string;
}

interface DisplayedServiceImage {
  id: string;
  isNewUpload: boolean;
  src: string;
}

interface ServiceFormState {
  serviceName: string;
  category: string;
  description: string;
  amount: string;
  currency: string;
  discount: {
    type: 'percentage' | 'fixed';
    value: number;
  } | null;
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
const fullDayHours = Array.from({ length: 16 }, (_, index) => index + 8);
const createBlockedDaySlots = (hours: number[] = fullDayHours) =>
  hours.map((hour) => ({
    hour,
    status: 'booked' as OverrideStatus,
  }));

const createEmptyFormState = (): ServiceFormState => ({
  serviceName: '',
  category: '',
  description: '',
  amount: '',
  currency: GBP_CURRENCY_CODE,
  discount: null,
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

const findServiceInProviderList = async (serviceId: string) => {
  let currentPage = 1;
  let totalPages = 1;

  while (currentPage <= totalPages) {
    const response = await api.get<ServiceListResponse>('/api/v1/service-provider/my-services', {
      params: {
        page: currentPage,
        limit: 100,
      },
    });

    const services = Array.isArray(response.data.data) ? response.data.data : [];
    const matchedService = services.find((service) => service._id === serviceId);

    if (matchedService) {
      return matchedService;
    }

    totalPages =
      typeof response.data.meta?.totalPages === 'number' && response.data.meta.totalPages > 0
        ? response.data.meta.totalPages
        : currentPage;
    currentPage += 1;
  }

  return null;
};

const mapAvailabilityToOverrides = (availability?: Record<string, number[]>) =>
  availability && typeof availability === 'object'
    ? Object.entries(availability)
        .filter(([date, hours]) => Boolean(date.trim()) && Array.isArray(hours) && hours.length > 0)
        .map(([date, hours]) => ({
          date,
          slots: createBlockedDaySlots(hours),
        }))
    : [];

export default function EditServicePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [formData, setFormData] = useState<ServiceFormState>(createEmptyFormState);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [uploadPreviews, setUploadPreviews] = useState<UploadPreview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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
        let service: ServiceDetail | null = null;

        try {
          const response = await api.get<ServiceDetailResponse>(
            `/api/v1/service-provider/services/${serviceId}`
          );
          service = response.data.data ?? null;
        } catch (detailError) {
          service = await findServiceInProviderList(serviceId);

          if (!service) {
            throw detailError;
          }
        }

        if (!service) {
          setError('Service details were not found.');
          return;
        }

        let availabilityOverrides = mapAvailabilityToOverrides(service.availability);

        try {
          const availabilityResponse = await api.get<AvailabilityResponse>(
            `/api/v1/service-provider/services/${serviceId}/availability`
          );
          const liveAvailability = availabilityResponse.data.data?.availability;
          const liveAvailabilityOverrides = mapAvailabilityToOverrides(liveAvailability);

          if (liveAvailabilityOverrides.length > 0 || (liveAvailability && Object.keys(liveAvailability).length === 0)) {
            availabilityOverrides = liveAvailabilityOverrides;
          }
        } catch (_availabilityError) {
          // Fall back to the detail payload when the dedicated availability request is unavailable.
        }

        if (availabilityOverrides.length === 0) {
          availabilityOverrides = (service.availabilityOverrides ?? [])
            .filter(
              (override): override is NonNullable<ServiceDetail['availabilityOverrides']>[number] =>
                Boolean(override?.date)
            )
            .map((override) => ({
              date: override.date?.trim() || '',
              slots: (override.slots ?? []).map((slot) => ({
                hour: typeof slot.hour === 'number' ? slot.hour : 0,
                status: normalizeStatus(slot.status?.trim().toLowerCase()),
              })),
            }));
        }

        setFormData({
          serviceName: service.information?.serviceName?.trim() || '',
          category:
            service.information?.category?.trim() ||
            service.information?.serviceCategory?.trim() ||
            '',
          description: service.information?.description?.trim() || '',
          amount: typeof service.pricing?.amount === 'number' ? String(service.pricing.amount) : '',
          currency: service.pricing?.currency?.trim() || GBP_CURRENCY_CODE,
          discount:
            service.pricing?.discount?.type &&
            typeof service.pricing.discount.value === 'number'
              ? {
                  type: service.pricing.discount.type,
                  value: service.pricing.discount.value,
                }
              : null,
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

  useEffect(() => () => {
    uploadPreviews.forEach((preview) => URL.revokeObjectURL(preview.previewUrl));
  }, [uploadPreviews]);

  const validateForm = () => {
    if (!formData.serviceName.trim()) {
      return 'Service name is required.';
    }

    if (!formData.category.trim()) {
      return 'Service category is required.';
    }

    if (!formData.description.trim()) {
      return 'Description is required.';
    }

    if (!formData.amount.trim() || Number(formData.amount) <= 0) {
      return 'Service amount must be greater than zero.';
    }

    if (formData.galleryImages.length + uploadPreviews.length <= 0) {
      return 'Add at least one service image.';
    }

    return '';
  };

  const handleInputChange = (
    field: keyof Omit<ServiceFormState, 'galleryImages' | 'availabilityOverrides' | 'discount'>,
    value: string
  ) => {
    if (error) {
      setError('');
    }

    if (successMessage) {
      setSuccessMessage('');
    }

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
  const displayedImages = useMemo<DisplayedServiceImage[]>(
    () => [
      ...formData.galleryImages.map((image, index) => ({
        id: `existing-${index}-${image}`,
        isNewUpload: false,
        src: image,
      })),
      ...uploadPreviews.map((preview, index) => ({
        id: `upload-${index}-${preview.previewUrl}`,
        isNewUpload: true,
        src: preview.previewUrl,
      })),
    ],
    [formData.galleryImages, uploadPreviews]
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    if (!files.length) {
      return;
    }

    if (error) {
      setError('');
    }

    if (successMessage) {
      setSuccessMessage('');
    }

    const nextPreviews = files.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setUploadPreviews((current) => [...current, ...nextPreviews]);
    event.target.value = '';
  };

  const removeUploadPreview = (index: number) => {
    if (successMessage) {
      setSuccessMessage('');
    }

    setUploadPreviews((current) => {
      const target = current[index];

      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }

      return current.filter((_, currentIndex) => currentIndex !== index);
    });
  };

  const removeExistingGalleryImage = (index: number) => {
    if (successMessage) {
      setSuccessMessage('');
    }

    setFormData((current) => ({
      ...current,
      galleryImages: current.galleryImages.filter((_, currentIndex) => currentIndex !== index),
    }));
  };

  const handleDayBlocking = (blocked: boolean) => {
    if (!selectedDateKey) {
      return;
    }

    if (successMessage) {
      setSuccessMessage('');
    }

    setFormData((current) => {
      const remainingOverrides = current.availabilityOverrides.filter(
        (override) => override.date !== selectedDateKey
      );

      return {
        ...current,
        availabilityOverrides: blocked
          ? [...remainingOverrides, { date: selectedDateKey, slots: createBlockedDaySlots() }].sort(
              (left, right) => left.date.localeCompare(right.date)
            )
          : remainingOverrides,
      };
    });
  };

  const handleSubmit = async () => {
    const serviceId = params?.id;
    const validationError = validateForm();

    if (!serviceId) {
      setError('Service id is missing.');
      return;
    }

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      setSuccessMessage('');

      const multipartPayload = new FormData();
      const requestPayload = {
        information: {
          serviceName: formData.serviceName.trim(),
          category: formData.category.trim(),
          description: formData.description.trim(),
        },
        pricing: {
          amount: Number(formData.amount),
          pricingType: 'hourly',
          currency: formData.currency,
          ...(formData.discount
            ? {
                discount: {
                  type: formData.discount.type,
                  value: formData.discount.value,
                },
              }
            : {}),
        },
        media: {
          galleryImages: formData.galleryImages,
          videoUrl: formData.videoUrl.trim(),
        },
        availabilityCalendar: formData.availabilityOverrides.map((override) => ({
          date: override.date,
          hours: override.slots.map((slot) => slot.hour),
        })),
      };

      uploadPreviews.forEach((preview) => {
        multipartPayload.append('images', preview.file, preview.file.name);
      });

      multipartPayload.append('payload', JSON.stringify(requestPayload));

      const response = await api.patch<ApiResponse<ServiceDetail>>(
        `/api/v1/service-provider/services/${serviceId}`,
        multipartPayload
      );

      setSuccessMessage(response.data.message || 'Service updated successfully.');
      router.push('/serviceprovider/dashboard/myServices');
    } catch (submissionError) {
      setError(getApiErrorMessage(submissionError));
    } finally {
      setIsSubmitting(false);
    }
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
            onClick={() => void handleSubmit()}
            disabled={isSubmitting}
            className="rounded-md bg-[#B74140] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#9d3837] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Saving Changes...' : 'Confirm Edit'}
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
            {successMessage ? (
              <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                {successMessage}
              </div>
            ) : null}

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
                  <label className="mb-2 block text-sm font-medium text-gray-800">
                    Service Name
                  </label>
                  <input
                    value={formData.serviceName}
                    onChange={(e) => handleInputChange('serviceName', e.target.value)}
                    className="w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-gray-700 outline-none focus:border-[#B74140]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-800">
                    Service Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-gray-700 outline-none focus:border-[#B74140]"
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
                  <label className="mb-2 block text-sm font-medium text-gray-800">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={5}
                    className="w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-gray-700 outline-none focus:border-[#B74140]"
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
                <label className="mb-2 block text-sm font-medium text-gray-800">Per Hour</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                    {GBP_CURRENCY_SYMBOL}
                  </span>
                  <input
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    className="w-full rounded-lg border border-[#E5E7EB] py-3 pl-12 pr-4 text-gray-700 outline-none focus:border-[#B74140]"
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
                <label className="mb-3 block text-sm font-medium text-gray-800">
                  Image Gallery
                </label>
                <div className="mb-4 rounded-xl border-2 border-dashed border-[#E5E7EB] p-6 text-center">
                  <Upload className="mx-auto mb-3 h-10 w-10 text-gray-400" />
                  <p className="mb-1 font-medium text-gray-700">Upload service images</p>
                  <p className="mb-4 text-sm text-gray-500">
                    Add new images or remove existing ones before confirming your edit.
                  </p>
                  <input
                    type="file"
                    id="service-edit-images-upload"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="service-edit-images-upload"
                    className="inline-block cursor-pointer rounded-lg bg-[#B74140] px-6 py-2.5 text-white transition-colors hover:bg-[#862c2a]"
                  >
                    Choose Images
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {displayedImages.map((image, index) => {
                    const existingIndex = index;
                    const uploadIndex = index - formData.galleryImages.length;

                    return (
                      <div
                        key={image.id}
                        className="group relative overflow-hidden rounded-lg border border-[#E5E7EB] bg-[#F7F7F7]"
                      >
                        <Image
                          src={image.src}
                          alt={`Service image ${index + 1}`}
                          width={320}
                          height={240}
                          unoptimized
                          className="h-40 w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (image.isNewUpload) {
                              removeUploadPreview(uploadIndex);
                              return;
                            }

                            removeExistingGalleryImage(existingIndex);
                          }}
                          className="absolute right-2 top-2 rounded-full bg-[#B74140] p-1 text-white opacity-0 transition-opacity hover:bg-[#862c2a] group-hover:opacity-100"
                          aria-label={`Remove service image ${index + 1}`}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                  <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed border-[#E5E7EB] text-gray-400">
                    <Plus className="mb-2 h-6 w-6" />
                    <span className="text-sm">Add Image</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-800">
                  Video Link (YouTube / Vimeo)
                </label>
                <input
                  value={formData.videoUrl}
                  onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                  className="w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-gray-700 outline-none focus:border-[#B74140]"
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
                    ? `Day Blocking for ${formatDateDDMMYY(selectedDateKey, selectedDateKey)}`
                    : 'Day Blocking'}
                </h3>

                {selectedDateKey ? (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      {selectedOverride?.slots.length
                        ? 'This day is blocked for the full booking window.'
                        : 'This day is currently open.'}
                    </p>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => handleDayBlocking(true)}
                        className="rounded-lg bg-[#B74140] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#9d3837]"
                      >
                        Block Full Day
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDayBlocking(false)}
                        className="rounded-lg border border-[#E5E7EB] px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-white"
                      >
                        Clear Block
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    Select a date to block or unblock the full day.
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
