'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Accessibility,
  Car,
  Calendar,
  DollarSign,
  ExternalLink,
  MapPin,
  Music,
  Play,
  Snowflake,
  Shield,
  Star,
  Users,
  Utensils,
  Volume2,
  Wifi,
  Wind,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

import ReadOnlyAvailabilityCalendar from '@/app/component/shared/ReadOnlyAvailabilityCalendar';
import { api, getApiErrorMessage } from '@/lib/api';
import {
  findFirstSelectableDate,
  getCalendarDays,
  parseMonthKey,
  type BookingAvailabilityEntry,
  type BookingMeta,
} from '@/lib/booking';
import { formatPoundAmount } from '@/lib/currency';
import { formatDateDDMMYY } from '@/lib/date';
import { useAuthStore } from '@/store/useAuthStore';

interface VenueDetailsResponse {
  success: boolean;
  data?: VenueDetails;
}

interface VenueBookingContextResponse {
  success: boolean;
  data?: {
    availability?: Record<string, BookingAvailabilityEntry>;
    bookingMeta: BookingMeta;
  };
}

interface ReviewCustomer {
  _id?: string;
  fullName?: string;
  profileImage?: string;
}

interface TargetReview {
  _id: string;
  bookingId?: string;
  customerId?: ReviewCustomer | string;
  providerId?: string;
  targetType?: string;
  targetId?: string;
  rating?: number | string;
  comment?: string;
  createdAt?: string;
  updatedAt?: string;
  user?: {
    fullName?: string;
  };
  reviewer?: {
    fullName?: string;
  };
  name?: string;
}

interface TargetReviewsResponse {
  success: boolean;
  data?: TargetReview[];
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

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  src: string;
  thumbnail: string;
  label: string;
  embedUrl?: string | null;
}

type VenueReview = TargetReview;

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const amenityDefinitions = [
  { id: 'wifi', label: 'Wi-Fi', icon: Wifi },
  { id: 'parking', label: 'Parking', icon: Car },
  { id: 'ac', label: 'AC', icon: Snowflake },
  { id: 'catering', label: 'Catering', icon: Utensils },
  { id: 'audioVideo', label: 'Audio/Video', icon: Music },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'accessible', label: 'Accessible', icon: Accessibility },
  { id: 'soundSystem', label: 'Sound System', icon: Volume2 },
] as const;

const amenityIconMap = {
  wifi: Wifi,
  parking: Car,
  catering: Utensils,
  ac: Snowflake,
  accessible: Accessibility,
  soundSystem: Volume2,
  security: Shield,
  audioVideo: Music,
};

const amenityLabelMap: Record<string, string> = {
  wifi: 'Wi-Fi',
  parking: 'Parking',
  catering: 'Catering',
  ac: 'AC',
  accessible: 'Accessible',
  soundSystem: 'Sound System',
  security: 'Security',
  audioVideo: 'Audio/Video',
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
    return amenities
      .filter((item): item is string => typeof item === 'string')
      .map((item) => {
        if (item === 'airConditioned') {
          return 'ac';
        }

        if (item === 'stage') {
          return 'soundSystem';
        }

        return item;
      });
  }

  if (!amenities || typeof amenities !== 'object') {
    return [];
  }

  return Object.entries(amenities)
    .filter(([, enabled]) => Boolean(enabled))
    .map(([key]) => {
      if (key === 'airConditioned') {
        return 'ac';
      }

      if (key === 'stage') {
        return 'soundSystem';
      }

      return key;
    });
};

const getAmenityStateMap = (amenities?: Record<string, boolean> | string[]) => {
  return getAmenities(amenities).reduce<Record<string, boolean>>((accumulator, amenity) => {
    accumulator[amenity] = true;
    return accumulator;
  }, {});
};

const getYouTubeVideoId = (url: string) => {
  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.hostname.includes('youtu.be')) {
      const videoId = parsedUrl.pathname.replace('/', '');
      return videoId || null;
    }

    if (parsedUrl.hostname.includes('youtube.com')) {
      if (parsedUrl.pathname.startsWith('/embed/')) {
        const videoId = parsedUrl.pathname.replace('/embed/', '').split('/')[0];
        return videoId || null;
      }

      if (parsedUrl.pathname.startsWith('/shorts/')) {
        const videoId = parsedUrl.pathname.replace('/shorts/', '').split('/')[0];
        return videoId || null;
      }

      const videoId = parsedUrl.searchParams.get('v');
      return videoId || null;
    }
  } catch {
    return null;
  }

  return null;
};

const getYouTubeEmbedUrl = (url: string) => {
  const videoId = getYouTubeVideoId(url);
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
};

const getYouTubeThumbnailUrl = (url: string) => {
  const videoId = getYouTubeVideoId(url);
  return videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : null;
};

const formatReviewDate = (value?: string) => {
  return formatDateDDMMYY(value, 'Recently');
};

const getReviewName = (review: VenueReview, fallbackIndex: number) => {
  return (
    (typeof review.customerId === 'object' ? review.customerId?.fullName : undefined) ||
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
  const token = useAuthStore((state) => state.token);
  const venueId = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;

  const [venue, setVenue] = useState<VenueDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingContext, setBookingContext] = useState<VenueBookingContextResponse['data'] | null>(null);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(true);
  const [availabilityError, setAvailabilityError] = useState('');
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);
  const [activeMonthIndex, setActiveMonthIndex] = useState(0);
  const [reviews, setReviews] = useState<TargetReview[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [reviewsError, setReviewsError] = useState('');

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

  useEffect(() => {
    if (!venueId) {
      setReviews([]);
      setReviewsError('Venue not found.');
      setIsLoadingReviews(false);
      return;
    }

    let isMounted = true;

    const fetchReviews = async () => {
      try {
        setIsLoadingReviews(true);
        setReviewsError('');

        const response = await api.get<TargetReviewsResponse>(`/api/v1/reviews/target/${venueId}`);

        if (!isMounted) {
          return;
        }

        setReviews(Array.isArray(response.data.data) ? response.data.data : []);
      } catch (fetchError) {
        if (!isMounted) {
          return;
        }

        setReviews([]);
        setReviewsError(getApiErrorMessage(fetchError));
      } finally {
        if (isMounted) {
          setIsLoadingReviews(false);
        }
      }
    };

    void fetchReviews();

    return () => {
      isMounted = false;
    };
  }, [venueId]);

  useEffect(() => {
    if (!venueId) {
      setBookingContext(null);
      setAvailabilityError('Venue not found.');
      setIsLoadingAvailability(false);
      return;
    }

    if (!token) {
      setBookingContext(null);
      setAvailabilityError('Sign in to view the live availability calendar for this venue.');
      setIsLoadingAvailability(false);
      return;
    }

    let isMounted = true;

    const fetchBookingContext = async () => {
      try {
        setIsLoadingAvailability(true);
        setAvailabilityError('');

        const response = await api.get<VenueBookingContextResponse>(`/api/v1/bookings/venues/${venueId}/context`);

        if (!isMounted) {
          return;
        }

        setBookingContext(response.data.data ?? null);
      } catch (fetchError) {
        if (!isMounted) {
          return;
        }

        setBookingContext(null);
        setAvailabilityError(getApiErrorMessage(fetchError));
      } finally {
        if (isMounted) {
          setIsLoadingAvailability(false);
        }
      }
    };

    fetchBookingContext();

    return () => {
      isMounted = false;
    };
  }, [token, venueId]);

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
    const videoThumbnailUrl = videoUrl ? getYouTubeThumbnailUrl(videoUrl) : null;

    if (videoUrl) {
      galleryImages.push({
        id: 'video-0',
        type: 'video',
        src: videoUrl,
        thumbnail: videoThumbnailUrl || galleryImages[0]?.src || 'https://images.unsplash.com/photo-1519167758481-83f29da8a1c0?w=800',
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

  const availableMonths = useMemo(() => {
    const currentMonth = parseMonthKey(bookingContext?.bookingMeta.currentMonth);
    const nextMonth = parseMonthKey(bookingContext?.bookingMeta.nextMonth);

    return [currentMonth, nextMonth].filter((month): month is Date => Boolean(month));
  }, [bookingContext?.bookingMeta.currentMonth, bookingContext?.bookingMeta.nextMonth]);

  useEffect(() => {
    if (!bookingContext || availableMonths.length === 0) {
      setActiveMonthIndex(0);
      return;
    }

    const firstSelectableDate = findFirstSelectableDate(
      availableMonths,
      bookingContext.bookingMeta,
      bookingContext.availability
    );

    if (!firstSelectableDate) {
      setActiveMonthIndex(0);
      return;
    }

    const matchingMonthIndex = availableMonths.findIndex(
      (month) =>
        month.getFullYear() === firstSelectableDate.getFullYear() &&
        month.getMonth() === firstSelectableDate.getMonth()
    );

    setActiveMonthIndex(matchingMonthIndex >= 0 ? matchingMonthIndex : 0);
  }, [availableMonths, bookingContext]);

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
  const amenityStateMap = getAmenityStateMap(venuePricing.amenities);
  const mapEmbedUrl = fullLocation ? getMapEmbedUrl(fullLocation) : null;
  const mapSearchUrl = fullLocation
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullLocation)}`
    : null;
  const activeMonth = availableMonths[activeMonthIndex] ?? null;
  const calendarDays = useMemo(
    () =>
      bookingContext && activeMonth
        ? getCalendarDays(activeMonth, bookingContext.bookingMeta, bookingContext.availability)
        : [],
    [activeMonth, bookingContext]
  );

  const handlePreviousMonth = () => {
    setActiveMonthIndex((previous) => Math.max(previous - 1, 0));
  };

  const handleNextMonth = () => {
    setActiveMonthIndex((previous) => Math.min(previous + 1, Math.max(availableMonths.length - 1, 0)));
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
                        className={`relative w-[94px] flex-shrink-0 overflow-hidden rounded-lg border-0 bg-transparent p-0 text-left shadow-none outline-none transition-all appearance-none ${
                          selectedMediaId === item.id ? 'opacity-100' : 'opacity-85 hover:opacity-100'
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
                        <div className={`py-1.5 text-center ${
                          selectedMediaId === item.id ? 'bg-[#FFF7F6]' : 'bg-white'
                        }`}>
                          <span className={`text-xs font-medium ${
                            selectedMediaId === item.id ? 'text-[#B74140]' : 'text-gray-800'
                          }`}>{item.label}</span>
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
                <div className="grid grid-cols-2 gap-4 mb-6 lg:grid-cols-4">
                  {amenityDefinitions.map((amenity) => {
                    const AmenityIcon = amenity.icon;
                    const isEnabled = Boolean(amenityStateMap[amenity.id]);

                    return (
                      <div
                        key={amenity.id}
                        className={`rounded-2xl border px-4 py-5 text-center transition-colors ${
                          isEnabled
                            ? 'border-[#EF4444] bg-[#FFF7F7] text-[#334155]'
                            : 'border-[#E5E7EB] bg-white text-[#64748B]'
                        }`}
                      >
                        <AmenityIcon className="mx-auto h-5 w-5" />
                        <p className="mt-3 text-sm font-medium">
                          {amenity.label}
                        </p>
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
              {isLoadingReviews ? (
                <p className="text-sm text-gray-500">Loading reviews...</p>
              ) : reviews.length > 0 ? (
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
              ) : reviewsError ? (
                <p className="text-sm text-gray-500">{reviewsError}</p>
              ) : (
                <p className="text-sm text-gray-500">No reviews have been submitted for this venue yet.</p>
              )}
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="space-y-6 lg:sticky lg:top-8">
              <ReadOnlyAvailabilityCalendar
                activeMonth={activeMonth}
                calendarDays={calendarDays}
                canGoNextMonth={activeMonthIndex < availableMonths.length - 1}
                canGoPreviousMonth={activeMonthIndex > 0}
                daysOfWeek={daysOfWeek}
                description=""
                emptyMessage="No live availability dates are currently open for this venue."
                error={availabilityError}
                isLoading={isLoadingAvailability}
                onNextMonth={handleNextMonth}
                onPreviousMonth={handlePreviousMonth}
                title="Check Availability"
              />

              <div className="rounded-lg border border-[#E5E7EB] bg-white p-5">
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
                  className="mb-2.5 w-full rounded-lg bg-[#B74140] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#a03837]"
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueBookingPage;
