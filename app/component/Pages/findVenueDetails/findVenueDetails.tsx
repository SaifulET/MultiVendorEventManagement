'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Accessibility,
  Calendar,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  ExternalLink,
  MapPin,
  Play,
  Shield,
  Star,
  Users,
  Utensils,
  Volume2,
  Wifi,
  Wind,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

import { api, getApiErrorMessage } from '@/lib/api';
import { formatPoundAmount } from '@/lib/currency';
import { formatDateDDMMYY } from '@/lib/date';

type AvailabilityStatus = 'available' | 'booked' | 'pending';

interface VenueDetailsResponse {
  success: boolean;
  data?: VenueDetails;
}

interface VenueDetails {
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
    amenities?: Record<string, boolean> | string[];
  };
  capacity?: {
    maximumGuests?: number;
  };
  media?: {
    galleryImages?: string[];
    videoUrl?: string;
  };
  provider?: {
    fullName?: string;
    venueProvider?: {
      businessName?: string;
      businessPhoneNo?: string;
      businessMail?: string;
    };
  };
  availabilityOverrides?: Array<{
    date?: string;
    slots?: Array<{
      hour?: number;
      status?: string;
    }>;
  }>;
  reviews?: Array<{
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
  }>;
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

type VenueReview = NonNullable<VenueDetails['reviews']>[number];

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const amenityIconMap = {
  wifi: Wifi,
  parking: Calendar,
  catering: Utensils,
  ac: Wind,
  accessible: Accessibility,
  soundSystem: Volume2,
  stage: Shield,
  security: Shield,
  audiovisual: Volume2,
};

const formatCurrencyValue = (amount?: number) =>
  formatPoundAmount(amount, { fallback: 'Price not listed' });

const formatAmenityLabel = (value: string) => {
  return value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

const getAmenities = (amenities?: Record<string, boolean> | string[]) => {
  if (Array.isArray(amenities)) {
    return amenities.filter((item): item is string => typeof item === 'string');
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

  return 'booked';
};

const formatReviewDate = (value?: string) => {
  return formatDateDDMMYY(value, 'Recently');
};

const getReviewName = (review: VenueReview, fallbackIndex: number) => {
  return (
    review.user?.fullName ||
    review.reviewer?.fullName ||
    review.name ||
    `Guest ${fallbackIndex + 1}`
  );
};

const getReviewRating = (rating?: number | string) => {
  if (typeof rating === 'number' && Number.isFinite(rating)) {
    return Math.max(0, Math.min(5, Math.round(rating)));
  }

  if (typeof rating === 'string') {
    const parsed = Number(rating);
    if (Number.isFinite(parsed)) {
      return Math.max(0, Math.min(5, Math.round(parsed)));
    }
  }

  return 0;
};

const getMapEmbedUrl = (location: string) => {
  return `https://maps.google.com/maps?q=${encodeURIComponent(location)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
};

const getDateKey = (year: number, month: number, day: number) => {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

const renderStars = (rating: number) => {
  return Array.from({ length: 5 }, (_, index) => (
    <Star
      key={index}
      size={14}
      className={index < rating ? 'fill-[#FACC15] text-[#FACC15]' : 'fill-gray-300 text-gray-300'}
    />
  ));
};

const VenueBookingPage: React.FC = () => {
  const params = useParams<{ slug?: string | string[] }>();
  const router = useRouter();
  const venueId = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;

  const [venue, setVenue] = useState<VenueDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    if (!venueId) {
      setIsLoading(false);
      setError('Venue not found.');
      return;
    }

    let isMounted = true;

    const fetchVenueDetails = async () => {
      try {
        setIsLoading(true);
        setError('');

        const response = await api.get<VenueDetailsResponse>(`/api/v1/public/venues/${venueId}`);

        if (!isMounted) {
          return;
        }

        if (!response.data.data) {
          setVenue(null);
          setError('Venue details are unavailable right now.');
          return;
        }

        setVenue(response.data.data);
      } catch (fetchError) {
        if (!isMounted) {
          return;
        }

        setVenue(null);
        setError(getApiErrorMessage(fetchError));
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchVenueDetails();

    return () => {
      isMounted = false;
    };
  }, [venueId]);

  const mediaItems = useMemo<MediaItem[]>(() => {
    if (!venue) {
      return [];
    }

    const galleryImages: MediaItem[] = (venue.media?.galleryImages ?? [])
      .filter((image): image is string => typeof image === 'string' && image.trim().length > 0)
      .map((image, index) => ({
        id: `image-${index}`,
        type: 'image' as const,
        src: image,
        thumbnail: image,
        label: `Image ${index + 1}`,
      }));

    const videoUrl = venue.media?.videoUrl?.trim();

    if (videoUrl) {
      galleryImages.push({
        id: 'video-0',
        type: 'video',
        src: videoUrl,
        thumbnail: galleryImages[0]?.src || 'https://images.unsplash.com/photo-1519167758481-83f29da8a1c0?w=800',
        label: 'Video',
        embedUrl: getYouTubeEmbedUrl(videoUrl),
      });
    }

    return galleryImages;
  }, [venue]);

  useEffect(() => {
    if (mediaItems.length > 0) {
      setSelectedMediaId((current) => current ?? mediaItems[0].id);
    }
  }, [mediaItems]);

  useEffect(() => {
    const firstOverrideDate = venue?.availabilityOverrides?.find((item) => item.date)?.date;

    if (!firstOverrideDate) {
      return;
    }

    const parsed = new Date(firstOverrideDate);

    if (Number.isNaN(parsed.getTime())) {
      return;
    }

    setCurrentMonth(parsed.getMonth());
    setCurrentYear(parsed.getFullYear());
  }, [venue]);

  const selectedMedia = useMemo(() => {
    return mediaItems.find((item) => item.id === selectedMediaId) ?? mediaItems[0] ?? null;
  }, [mediaItems, selectedMediaId]);

  const venueInformation = venue?.information ?? {};
  const venuePricing = venue?.pricing ?? {};
  const venueCapacity = venue?.capacity ?? {};
  const provider = venue?.provider;
  const providerName =
    provider?.venueProvider?.businessName ||
    provider?.fullName ||
    'Venue Provider';
  const fullLocation = [venueInformation.addressLine, venueInformation.area, venueInformation.city]
    .filter((value): value is string => Boolean(value?.trim()))
    .join(', ');
  const amenities = getAmenities(venuePricing.amenities);
  const mapEmbedUrl = fullLocation ? getMapEmbedUrl(fullLocation) : null;
  const mapSearchUrl = fullLocation
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullLocation)}`
    : null;

  const availabilityByDate = useMemo(() => {
    return new Map(
      (venue?.availabilityOverrides ?? [])
        .filter((override): override is { date: string; slots?: Array<{ hour?: number; status?: string }> } => Boolean(override.date))
        .map((override) => [override.date, getAvailabilityStatus(override.slots)])
    );
  }, [venue]);

  const calendar = useMemo<CalendarDay[]>(() => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const output: CalendarDay[] = [];

    for (let index = 0; index < firstDayOfMonth; index += 1) {
      output.push({
        date: 0,
        fullDate: null,
        status: 'booked',
        isCurrentMonth: false,
      });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const dateKey = getDateKey(currentYear, currentMonth, day);

      output.push({
        date: day,
        fullDate: dateKey,
        status: availabilityByDate.get(dateKey) ?? 'available',
        isCurrentMonth: true,
      });
    }

    return output;
  }, [availabilityByDate, currentMonth, currentYear]);

  const reviews = venue?.reviews ?? [];

  const handlePreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((value) => value - 1);
      return;
    }

    setCurrentMonth((value) => value - 1);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((value) => value + 1);
      return;
    }

    setCurrentMonth((value) => value + 1);
  };

  const bookHandler = () => {
    if (!venue?._id) {
      return;
    }

    router.push(`/pages/venueBookings/${venue._id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen md:px-[80px]">
        <div className="px-[24px] py-[32px]">
          <div className="rounded-lg border border-[#E5E7EB] bg-white p-10 text-center text-gray-500">
            Loading venue details...
          </div>
        </div>
      </div>
    );
  }

  if (error || !venue) {
    return (
      <div className="min-h-screen md:px-[80px]">
        <div className="px-[24px] py-[32px]">
          <div className="rounded-lg border border-red-200 bg-red-50 p-10 text-center text-red-700">
            {error || 'Venue details are unavailable right now.'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen md:px-[80px]">
      <div className="px-[24px] py-[32px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-[32px]">
          <div className="lg:col-span-8">
            <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-hidden mb-[42px]">
              <div className="aspect-video bg-gray-200 relative w-full min-h-[280px] md:h-[480px]">
                {selectedMedia?.type === 'video' && selectedMedia.embedUrl ? (
                  <iframe
                    src={selectedMedia.embedUrl}
                    className="h-full w-full"
                    title={venueInformation.venueName || 'Venue video'}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : selectedMedia?.type === 'video' ? (
                  <div className="flex h-full flex-col items-center justify-center gap-4 bg-slate-900 px-6 text-center text-white">
                    <Play className="h-12 w-12" />
                    <p className="text-sm text-slate-200">Video preview is not available for this link.</p>
                    <a
                      href={selectedMedia.src}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-900"
                    >
                      Open Video
                      <ExternalLink size={16} />
                    </a>
                  </div>
                ) : selectedMedia?.src ? (
                  <img
                    src={selectedMedia.src}
                    alt={venueInformation.venueName || 'Venue image'}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-slate-100 text-slate-500">
                    No media available
                  </div>
                )}
              </div>

              {mediaItems.length > 0 ? (
                <div className="mt-[17px] pb-[12px] px-[8px]">
                  <div className="flex gap-[14px] overflow-x-auto">
                    {mediaItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setSelectedMediaId(item.id)}
                        className={`relative rounded-lg overflow-hidden transition-all w-[94px] flex-shrink-0 ${
                          selectedMediaId === item.id ? 'ring-2 ring-[#B74140]' : ''
                        }`}
                      >
                        <div className="aspect-square relative bg-slate-100">
                          <img
                            src={item.thumbnail}
                            alt={item.label}
                            className="w-full h-full object-cover"
                          />
                          {item.type === 'video' ? (
                            <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                              <Play className="w-6 h-6 text-white" fill="white" />
                            </div>
                          ) : null}
                        </div>
                        <div className="bg-white py-1.5 text-center">
                          <span className="text-xs font-medium text-gray-800">{item.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 mb-[32px]">
              <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <h1 className="text-2xl font-bold mb-2">
                    {venueInformation.venueName || 'Untitled Venue'}
                  </h1>
                  <div className="flex items-start gap-2 text-gray-600 mb-2">
                    <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{fullLocation || 'Location unavailable'}</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Hosted by {providerName}
                  </p>
                </div>
                <span className="inline-flex w-fit rounded-full bg-[#B7414012] px-3 py-1 text-sm font-medium text-[#B74140]">
                  {venueInformation.venueType || 'Venue'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <DollarSign size={18} className="text-[#B74140]" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-600">Per Day</div>
                    <div className="font-semibold text-sm">
                      {formatCurrencyValue(venuePricing.basePrice)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users size={18} className="text-[#B74140]" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-600">Capacity</div>
                    <div className="font-semibold text-sm">
                      Up to {(venueCapacity.maximumGuests ?? 0).toLocaleString()} guests
                    </div>
                  </div>
                </div>
              </div>

              <h2 className="text-lg font-semibold mb-3">Amenities</h2>
              {amenities.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                  {amenities.map((amenity) => {
                    const AmenityIcon = amenityIconMap[amenity as keyof typeof amenityIconMap] || Shield;

                    return (
                      <div key={amenity} className="flex items-center gap-2 text-gray-700">
                        <AmenityIcon size={16} className="text-[#B74140]" />
                        <span className="text-sm">{formatAmenityLabel(amenity)}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="mb-6 text-sm text-gray-500">No amenities have been listed for this venue yet.</p>
              )}

              <h2 className="text-lg font-semibold mb-3">Description</h2>
              <p className="text-sm text-gray-700 leading-relaxed mb-6">
                {venueInformation.description?.trim() || 'No description provided for this venue yet.'}
              </p>

              {mapEmbedUrl ? (
                <div className="rounded-lg overflow-hidden border border-gray-200">
                  <iframe
                    width="100%"
                    height="320"
                    style={{ border: 0 }}
                    src={mapEmbedUrl}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                  {mapSearchUrl ? (
                    <div className="border-t border-gray-200 bg-slate-50 px-4 py-3">
                      <a
                        href={mapSearchUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-medium text-[#B74140]"
                      >
                        Open in Google Maps
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
              <h2 className="text-lg font-semibold mb-6">Reviews ({reviews.length})</h2>
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review, index) => {
                    const reviewName = getReviewName(review, index);
                    const initials = reviewName
                      .split(' ')
                      .map((part) => part.charAt(0))
                      .join('')
                      .slice(0, 2)
                      .toUpperCase();
                    const reviewRating = getReviewRating(review.rating);

                    return (
                      <div key={`${reviewName}-${index}`} className="border-b border-gray-200 last:border-0 pb-4 last:pb-0">
                        <div className="flex items-start gap-3 mb-2">
                          <div className="w-10 h-10 bg-[#B74140] rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                            {initials || 'G'}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-sm">{reviewName}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex gap-0.5">{renderStars(reviewRating)}</div>
                              <span className="text-xs text-gray-500">{formatReviewDate(review.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {review.comment?.trim() || 'No written review provided.'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No reviews have been submitted for this venue yet.</p>
              )}
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 sticky top-8">
              <h3 className="text-base font-semibold mb-2">Check Availability</h3>
              <p className="mb-4 text-sm text-gray-500">
                Availability is based on the published override schedule for this venue.
              </p>

              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={handlePreviousMonth}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft size={18} className="text-gray-600" />
                </button>
                <div className="text-sm font-semibold text-gray-800">
                  {monthNames[currentMonth]} {currentYear}
                </div>
                <button
                  onClick={handleNextMonth}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight size={18} className="text-gray-600" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1.5 mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                  <div key={day} className="text-center text-xs font-medium text-gray-600">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1.5 mb-5">
                {calendar.map((day, index) => (
                  <button
                    key={`${day.fullDate ?? 'empty'}-${index}`}
                    disabled={!day.isCurrentMonth}
                    className={`aspect-square flex items-center justify-center text-xs rounded transition-colors ${
                      !day.isCurrentMonth
                        ? 'invisible'
                        : day.status === 'available'
                          ? 'bg-[#3CCF911A] text-gray-800 hover:bg-[#3CCF9133]'
                          : day.status === 'pending'
                            ? 'bg-[#FACC151A] text-gray-800 hover:bg-[#FACC1533]'
                            : 'bg-[#FF5A5A1A] text-gray-800'
                    }`}
                  >
                    {day.isCurrentMonth ? day.date : ''}
                  </button>
                ))}
              </div>

              <div className="mb-5 flex flex-wrap items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 bg-[#3CCF91] rounded"></div>
                  <span className="text-gray-700">Available</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 bg-[#FACC15] rounded"></div>
                  <span className="text-gray-700">Pending</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 bg-[#FF5A5A] rounded"></div>
                  <span className="text-gray-700">Booked</span>
                </div>
              </div>

              <div className="mb-5 rounded-lg bg-slate-50 p-4 text-sm text-gray-600">
                <p className="font-medium text-gray-900">{providerName}</p>
                {provider?.venueProvider?.businessMail ? (
                  <p>{provider.venueProvider.businessMail}</p>
                ) : null}
                {provider?.venueProvider?.businessPhoneNo ? (
                  <p>{provider.venueProvider.businessPhoneNo}</p>
                ) : null}
              </div>

              <button
                onClick={bookHandler}
                className="w-full bg-[#B74140] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#a03837] transition-colors mb-2.5"
              >
                Book Now
              </button>
              <button
                onClick={() => { router.push('/home/dashboard/chat'); }}
                className="w-full border border-[#E5E7EB] text-gray-700 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Contact Provider
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueBookingPage;
