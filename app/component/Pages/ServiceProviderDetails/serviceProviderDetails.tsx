'use client';

import React, { useEffect, useState } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  MapPin,
  MessageSquare,
  Play,
  Star,
  Tag,
  Users,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

import { api, getApiErrorMessage } from '@/lib/api';
import { formatDateDDMMYY } from '@/lib/date';

type AvailabilityStatus = 'available' | 'booked' | 'pending';

interface ServiceReview {
  rating?: number | string;
  comment?: string;
  createdAt?: string;
  user?: {
    fullName?: string;
  };
  reviewer?: {
    fullName?: string;
  };
  name?: string;
}

interface ServiceDetails {
  _id: string;
  information?: {
    serviceName?: string;
    name?: string;
    title?: string;
    category?: string;
    serviceCategory?: string;
    description?: string;
    serviceArea?: string[] | string;
    tags?: string[];
  };
  pricing?: {
    amount?: number;
    basePrice?: number;
    hourlyRate?: number;
    pricePerHour?: number;
    pricingType?: string;
    currency?: string;
  };
  settings?: {
    amenities?: Record<string, boolean> | string[];
    capacity?: number;
    serviceArea?: string[] | string;
    city?: string;
    area?: string;
  };
  media?: {
    galleryImages?: string[];
    videoUrl?: string;
    profileImage?: string;
  };
  availabilityOverrides?: Array<{
    date?: string;
    slots?: Array<{
      hour?: number;
      status?: string;
    }>;
  }>;
  provider?: {
    fullName?: string;
    serviceProvider?: {
      serviceName?: string;
      serviceCategory?: string;
      serviceDescription?: string;
      coverageArea?: string[] | string;
    };
  };
  ownerId?: {
    fullName?: string;
  };
  reviews?: ServiceReview[];
}

interface ServiceDetailsResponse {
  success: boolean;
  data?: ServiceDetails | ServiceDetails[];
}

interface CalendarDay {
  date: number;
  fullDate: string | null;
  status: AvailabilityStatus;
  isCurrentMonth: boolean;
}

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  src: string;
  thumbnail: string;
  label: string;
  embedUrl?: string | null;
}

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DEFAULT_IMAGE = '/pp1.svg';

const formatCurrencyValue = (amount?: number, currency = 'BDT') => {
  if (typeof amount !== 'number') {
    return 'Price not listed';
  }

  return `${currency} ${amount.toLocaleString()}`;
};

const formatAmenityLabel = (value: string) =>
  value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());

const getAmenities = (amenities?: Record<string, boolean> | string[]) => {
  if (Array.isArray(amenities)) {
    return amenities.filter((item): item is string => typeof item === 'string' && Boolean(item.trim()));
  }

  if (!amenities || typeof amenities !== 'object') {
    return [];
  }

  return Object.entries(amenities)
    .filter(([, enabled]) => Boolean(enabled))
    .map(([key]) => key);
};

const getYouTubeEmbedUrl = (url: string) => {
  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.hostname.includes('youtu.be')) {
      const videoId = parsedUrl.pathname.replace('/', '');
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    if (parsedUrl.hostname.includes('youtube.com')) {
      const videoId = parsedUrl.searchParams.get('v');
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }
  } catch {
    return null;
  }

  return null;
};

const getAvailabilityStatus = (
  slots?: Array<{
    hour?: number;
    status?: string;
  }>
): AvailabilityStatus => {
  const normalizedStatuses = (slots ?? [])
    .map((slot) => slot.status?.trim().toLowerCase())
    .filter((status): status is string => Boolean(status));

  if (normalizedStatuses.includes('available')) {
    return 'available';
  }

  if (normalizedStatuses.includes('pending')) {
    return 'pending';
  }

  if (normalizedStatuses.length > 0 && normalizedStatuses.every((status) => status === 'booked')) {
    return 'booked';
  }

  return 'available';
};

const getDateKey = (year: number, month: number, day: number) =>
  `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

const formatReviewDate = (value?: string) => {
  return formatDateDDMMYY(value, 'Recently');
};

const getReviewName = (review: ServiceReview, fallbackIndex: number) =>
  review.user?.fullName ||
  review.reviewer?.fullName ||
  review.name ||
  `Guest ${fallbackIndex + 1}`;

const getReviewRating = (rating?: number | string) => {
  if (typeof rating === 'number' && Number.isFinite(rating)) {
    return Math.max(0, Math.min(5, Number(rating.toFixed(1))));
  }

  if (typeof rating === 'string') {
    const parsed = Number(rating);
    if (Number.isFinite(parsed)) {
      return Math.max(0, Math.min(5, Number(parsed.toFixed(1))));
    }
  }

  return 0;
};

const renderStars = (rating: number, size = 14) =>
  Array.from({ length: 5 }, (_, index) => (
    <Star
      key={index}
      size={size}
      className={index < Math.round(rating) ? 'fill-[#FACC15] text-[#FACC15]' : 'fill-gray-300 text-gray-300'}
    />
  ));

const getArrayValues = (value?: string[] | string) => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string' && Boolean(item.trim()));
  }

  if (typeof value === 'string' && value.trim()) {
    return [value];
  }

  return [];
};

const normalizeService = (
  payload: ServiceDetails | ServiceDetails[] | undefined,
  serviceId?: string
) => {
  if (Array.isArray(payload)) {
    if (!payload.length) {
      return null;
    }

    return payload.find((item) => item._id === serviceId) ?? payload[0];
  }

  if (payload && typeof payload === 'object') {
    return payload;
  }

  return null;
};

export default function ServiceProviderDetails() {
  const params = useParams<{ slug?: string | string[] }>();
  const router = useRouter();
  const serviceId = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;

  const [service, setService] = useState<ServiceDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    if (!serviceId) {
      setIsLoading(false);
      setError('Service not found.');
      return;
    }

    let isMounted = true;

    const fetchServiceDetails = async () => {
      try {
        setIsLoading(true);
        setError('');

        const response = await api.get<ServiceDetailsResponse>(`/api/v1/public/services/${serviceId}`);
        const normalizedService = normalizeService(response.data.data, serviceId);

        if (!normalizedService) {
          throw new Error('Service details are unavailable.');
        }

        if (!isMounted) {
          return;
        }

        setService(normalizedService);
      } catch (fetchError) {
        if (!isMounted) {
          return;
        }

        setService(null);
        setError(getApiErrorMessage(fetchError));
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchServiceDetails();

    return () => {
      isMounted = false;
    };
  }, [serviceId]);

  const serviceName =
    service?.information?.serviceName?.trim() ||
    service?.information?.name?.trim() ||
    service?.information?.title?.trim() ||
    service?.provider?.serviceProvider?.serviceName?.trim() ||
    'Untitled Service';
  const serviceCategory =
    service?.information?.category?.trim() ||
    service?.information?.serviceCategory?.trim() ||
    service?.provider?.serviceProvider?.serviceCategory?.trim() ||
    'Service';
  const providerName =
    service?.provider?.fullName?.trim() ||
    service?.ownerId?.fullName?.trim() ||
    'Service Provider';
  const description =
    service?.information?.description?.trim() ||
    service?.provider?.serviceProvider?.serviceDescription?.trim() ||
    'Service details will be updated soon.';
  const priceAmount =
    typeof service?.pricing?.amount === 'number'
      ? service.pricing.amount
      : typeof service?.pricing?.hourlyRate === 'number'
        ? service.pricing.hourlyRate
        : typeof service?.pricing?.pricePerHour === 'number'
          ? service.pricing.pricePerHour
          : typeof service?.pricing?.basePrice === 'number'
            ? service.pricing.basePrice
            : undefined;
  const currency = service?.pricing?.currency?.trim() || 'BDT';
  const pricingType = service?.pricing?.pricingType?.trim() || 'custom';
  const serviceAreas = Array.from(
    new Set([
      ...getArrayValues(service?.information?.serviceArea),
      ...getArrayValues(service?.settings?.serviceArea),
      ...getArrayValues(service?.provider?.serviceProvider?.coverageArea),
      service?.settings?.area?.trim() || '',
      service?.settings?.city?.trim() || '',
    ].filter((item): item is string => Boolean(item && item.trim())))
  );
  const tags = Array.isArray(service?.information?.tags)
    ? service.information.tags.filter((tag): tag is string => typeof tag === 'string' && Boolean(tag.trim()))
    : [];
  const amenities = getAmenities(service?.settings?.amenities);
  const galleryImages = [
    ...(Array.isArray(service?.media?.galleryImages)
      ? service.media.galleryImages.filter((image): image is string => typeof image === 'string' && Boolean(image.trim()))
      : []),
    ...(typeof service?.media?.profileImage === 'string' && service.media.profileImage.trim()
      ? [service.media.profileImage]
      : []),
  ];
  const videoUrl =
    typeof service?.media?.videoUrl === 'string' && service.media.videoUrl.trim()
      ? service.media.videoUrl
      : '';
  const videoEmbedUrl = videoUrl ? getYouTubeEmbedUrl(videoUrl) : null;
  const mediaItems: MediaItem[] = [
    ...galleryImages.map((image, index) => ({
      id: `image-${index}`,
      type: 'image' as const,
      src: image,
      thumbnail: image,
      label: `Photo ${index + 1}`,
    })),
    ...(videoUrl
      ? [{
        id: 'video-0',
        type: 'video' as const,
        src: videoUrl,
        thumbnail: galleryImages[0] || DEFAULT_IMAGE,
        label: 'Video Tour',
        embedUrl: videoEmbedUrl,
      }]
      : []),
  ];
  const resolvedSelectedMediaId =
    selectedMediaId && mediaItems.some((item) => item.id === selectedMediaId)
      ? selectedMediaId
      : mediaItems[0]?.id ?? null;
  const selectedMedia =
    mediaItems.find((item) => item.id === resolvedSelectedMediaId) ||
    mediaItems[0] ||
    null;
  const reviews = Array.isArray(service?.reviews) ? service.reviews : [];
  const reviewRatings = reviews
    .map((review) => getReviewRating(review.rating))
    .filter((rating) => Number.isFinite(rating));
  const averageRating = reviewRatings.length
    ? Number((reviewRatings.reduce((total, rating) => total + rating, 0) / reviewRatings.length).toFixed(1))
    : 0;
  const capacity =
    typeof service?.settings?.capacity === 'number'
      ? service.settings.capacity
      : null;
  const availabilityMap = new Map<string, AvailabilityStatus>();

  (service?.availabilityOverrides ?? []).forEach((override) => {
    if (!override.date) {
      return;
    }

    availabilityMap.set(override.date, getAvailabilityStatus(override.slots));
  });

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const calendarDays: CalendarDay[] = [];

  for (let emptyIndex = 0; emptyIndex < firstDayOfMonth; emptyIndex += 1) {
    calendarDays.push({
      date: 0,
      fullDate: null,
      status: 'available',
      isCurrentMonth: false,
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateKey = getDateKey(currentYear, currentMonth, day);

    calendarDays.push({
      date: day,
      fullDate: dateKey,
      status: availabilityMap.get(dateKey) ?? 'available',
      isCurrentMonth: true,
    });
  }

  const handlePreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((previous) => previous - 1);
      return;
    }

    setCurrentMonth((previous) => previous - 1);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((previous) => previous + 1);
      return;
    }

    setCurrentMonth((previous) => previous + 1);
  };

  const getAvailabilityClasses = (status: AvailabilityStatus) => {
    switch (status) {
      case 'booked':
        return 'bg-red-50 text-red-600';
      case 'pending':
        return 'bg-amber-50 text-amber-600';
      default:
        return 'bg-emerald-50 text-emerald-700';
    }
  };

  const bookHandler = () => {
    if (!service?._id) {
      return;
    }

    router.push(`/pages/findServiceProviderConfirmation/${service._id}`);
  };

  if (isLoading) {
    return (
      <div className="px-6 py-16 md:px-12 lg:px-24">
        <div className="mx-auto max-w-6xl animate-pulse space-y-6">
          <div className="h-64 rounded-3xl bg-gray-200" />
          <div className="h-40 rounded-3xl bg-gray-100" />
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="h-72 rounded-3xl bg-gray-100" />
            <div className="h-72 rounded-3xl bg-gray-100" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="px-6 py-16 md:px-12 lg:px-24">
        <div className="mx-auto max-w-3xl rounded-3xl border border-red-100 bg-red-50 p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Service details unavailable</h1>
          <p className="mt-3 text-gray-600">{error || 'We could not load this service right now.'}</p>
          <button
            onClick={() => { router.push('/pages/findServiceProvider'); }}
            className="mt-6 rounded-lg bg-[#B74140] px-6 py-3 text-white transition-colors hover:bg-[#9d3534]"
          >
            Back to services
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFAF8]">
      <div className="relative h-[240px] overflow-hidden md:h-[340px]">
        {selectedMedia?.type === 'image' ? (
          <img
            src={selectedMedia.src}
            alt={serviceName}
            className="h-full w-full object-cover"
          />
        ) : (
          <img
            src={selectedMedia?.thumbnail || DEFAULT_IMAGE}
            alt={serviceName}
            className="h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/25 to-black/55" />
        <div className="absolute inset-x-0 bottom-0 mx-auto flex max-w-6xl flex-col gap-2 px-6 pb-8 text-white md:px-12 lg:px-0">
          <span className="inline-flex w-fit rounded-full bg-white/15 px-3 py-1 text-sm backdrop-blur">
            {serviceCategory}
          </span>
          <h1 className="text-3xl font-bold md:text-5xl">{serviceName}</h1>
          <p className="max-w-3xl text-sm text-white/85 md:text-base">
            {description}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 pb-12 md:px-12 lg:px-0">
        <div className="relative -mt-12 rounded-[28px] border border-[#E5E7EB] bg-white p-6 shadow-sm md:-mt-16 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#B7414014] text-2xl font-bold text-[#B74140]">
                  {providerName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Provided by</p>
                  <h2 className="text-2xl font-bold text-gray-900">{providerName}</h2>
                  <p className="text-sm text-gray-600">{serviceCategory}</p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-4 text-sm text-gray-600">
                <span className="inline-flex items-center gap-2">
                  <MapPin size={16} className="text-[#B74140]" />
                  {serviceAreas.length ? serviceAreas.join(', ') : 'Coverage area unavailable'}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Star size={16} className="fill-[#FACC15] text-[#FACC15]" />
                  {averageRating > 0 ? averageRating.toFixed(1) : 'New'} ({reviews.length} reviews)
                </span>
                {capacity ? (
                  <span className="inline-flex items-center gap-2">
                    <Users size={16} className="text-[#B74140]" />
                    Up to {capacity} guests
                  </span>
                ) : null}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <button
                onClick={() => { router.push('/home/dashboard/chat'); }}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                <MessageSquare size={18} />
                Contact Provider
              </button>
              <button
                onClick={bookHandler}
                className="rounded-lg bg-[#B74140] px-6 py-3 font-medium text-white transition-colors hover:bg-[#9d3534]"
              >
                Book Now
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-[#FAF4F3] p-5">
              <div className="flex items-center gap-3">
                <DollarSign className="text-[#B74140]" />
                <div>
                  <p className="text-sm text-gray-500">Pricing</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrencyValue(priceAmount, currency)}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-600">
                {pricingType.charAt(0).toUpperCase() + pricingType.slice(1)} pricing
              </p>
            </div>

            <div className="rounded-2xl bg-[#FAF4F3] p-5">
              <div className="flex items-center gap-3">
                <Calendar className="text-[#B74140]" />
                <div>
                  <p className="text-sm text-gray-500">Availability</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {service.availabilityOverrides?.length ? `${service.availabilityOverrides.length} updated dates` : 'Open availability'}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-600">
                Check the calendar below for booked and pending days.
              </p>
            </div>

            <div className="rounded-2xl bg-[#FAF4F3] p-5">
              <div className="flex items-center gap-3">
                <Tag className="text-[#B74140]" />
                <div>
                  <p className="text-sm text-gray-500">Tags</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {tags.length ? `${tags.length} specialties` : 'General service'}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-600">
                {tags.length ? tags.join(', ') : 'More service details will be added soon.'}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr,0.85fr]">
          <div className="space-y-8">
            <section className="rounded-[28px] border border-[#E5E7EB] bg-white p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-gray-900">About this service</h2>
              <p className="mt-4 leading-7 text-gray-600">{description}</p>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-gray-500">
                    Service Area
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {serviceAreas.length ? serviceAreas.map((area) => (
                      <span
                        key={area}
                        className="rounded-full bg-[#F7F1F0] px-3 py-2 text-sm text-gray-700"
                      >
                        {area}
                      </span>
                    )) : (
                      <span className="text-sm text-gray-500">Coverage area unavailable</span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-gray-500">
                    Amenities
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {amenities.length ? amenities.map((amenity) => (
                      <span
                        key={amenity}
                        className="rounded-full bg-[#F7F1F0] px-3 py-2 text-sm text-gray-700"
                      >
                        {formatAmenityLabel(amenity)}
                      </span>
                    )) : (
                      <span className="text-sm text-gray-500">No amenities listed yet</span>
                    )}
                  </div>
                </div>
              </div>

              {tags.length ? (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-gray-500">
                    Popular Tags
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-[#E8D4D3] px-3 py-2 text-sm text-[#B74140]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </section>

            <section className="rounded-[28px] border border-[#E5E7EB] bg-white p-6 md:p-8">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Availability calendar</h2>
                  <p className="mt-2 text-sm text-gray-500">
                    Availability is based on the service override dates from the API.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePreviousMonth}
                    className="rounded-full border border-gray-200 p-2 text-gray-600 transition-colors hover:bg-gray-50"
                    aria-label="Previous month"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className="min-w-[140px] text-center font-semibold text-gray-900">
                    {monthNames[currentMonth]} {currentYear}
                  </span>
                  <button
                    onClick={handleNextMonth}
                    className="rounded-full border border-gray-200 p-2 text-gray-600 transition-colors hover:bg-gray-50"
                    aria-label="Next month"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium text-gray-500">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="py-2">{day}</div>
                ))}
              </div>

              <div className="mt-2 grid grid-cols-7 gap-2">
                {calendarDays.map((item, index) => (
                  <div
                    key={`${item.fullDate ?? 'empty'}-${index}`}
                    className={`flex h-12 items-center justify-center rounded-xl text-sm font-medium ${
                      item.isCurrentMonth
                        ? getAvailabilityClasses(item.status)
                        : 'bg-transparent text-transparent'
                    }`}
                  >
                    {item.isCurrentMonth ? item.date : ''}
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-4 text-sm text-gray-600">
                <span className="inline-flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-emerald-500" />
                  Available
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-amber-500" />
                  Pending
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-red-400" />
                  Booked
                </span>
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <section className="rounded-[28px] border border-[#E5E7EB] bg-white p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-gray-900">Gallery</h2>

              <div className="mt-5 overflow-hidden rounded-[24px] bg-[#F7F1F0]">
                {selectedMedia?.type === 'video' && selectedMedia.embedUrl ? (
                  <iframe
                    src={selectedMedia.embedUrl}
                    title={selectedMedia.label}
                    className="h-[260px] w-full md:h-[320px]"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <img
                    src={selectedMedia?.src || DEFAULT_IMAGE}
                    alt={selectedMedia?.label || serviceName}
                    className="h-[260px] w-full object-cover md:h-[320px]"
                  />
                )}
              </div>

              {mediaItems.length ? (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {mediaItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => { setSelectedMediaId(item.id); }}
                      className={`relative overflow-hidden rounded-2xl border transition-all ${
                        item.id === selectedMedia?.id
                          ? 'border-[#B74140] ring-2 ring-[#B7414026]'
                          : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={item.thumbnail}
                        alt={item.label}
                        className="h-24 w-full object-cover"
                      />
                      {item.type === 'video' ? (
                        <span className="absolute inset-0 flex items-center justify-center bg-black/35 text-white">
                          <Play size={20} className="fill-white" />
                        </span>
                      ) : null}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-gray-500">No media available for this service yet.</p>
              )}
            </section>

            <section className="rounded-[28px] border border-[#E5E7EB] bg-white p-6 md:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Reviews & ratings</h2>
                  <p className="mt-2 text-sm text-gray-500">
                    {reviews.length ? `${reviews.length} customer reviews` : 'No reviews yet'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-gray-900">
                    {averageRating > 0 ? averageRating.toFixed(1) : 'New'}
                  </p>
                  <div className="mt-1 flex items-center justify-end gap-1">
                    {renderStars(averageRating, 16)}
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-5">
                {reviews.length ? reviews.map((review, index) => {
                  const reviewName = getReviewName(review, index);
                  const reviewRating = getReviewRating(review.rating);

                  return (
                    <div
                      key={`${reviewName}-${index}`}
                      className="rounded-2xl border border-[#F0E7E6] bg-[#FFFCFB] p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">{reviewName}</h3>
                          <p className="mt-1 text-sm text-gray-500">{formatReviewDate(review.createdAt)}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {renderStars(reviewRating)}
                        </div>
                      </div>
                      <p className="mt-4 leading-7 text-gray-600">
                        {review.comment?.trim() || 'Customer feedback will appear here soon.'}
                      </p>
                    </div>
                  );
                }) : (
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-sm text-gray-500">
                    No customer reviews have been published for this service yet.
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
