'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { api, getApiErrorMessage } from '@/lib/api';
import img from '@/public/img.svg';

interface Venue {
  id: string;
  name: string;
  location: string;
  rating: number;
  reviewCount: number;
  pricePerDay: number;
  imageUrl: string;
  category: string;
}

interface VenueApiReview {
  rating?: number | string;
}

interface VenueApiItem {
  _id: string;
  information?: {
    venueName?: string;
    venueType?: string;
    addressLine?: string;
    city?: string;
    area?: string;
  };
  pricing?: {
    basePrice?: number;
  };
  media?: {
    galleryImages?: string[];
  };
  reviews?: VenueApiReview[];
}

interface VenueListMeta {
  page?: number;
  hasNextPage?: boolean;
}

interface VenueListResponse {
  success: boolean;
  meta?: VenueListMeta;
  data?: VenueApiItem[];
}

const FETCH_PAGE_SIZE = 50;
const INITIAL_VISIBLE_COUNT = 3;

const getVenueRating = (reviews?: VenueApiReview[]) => {
  const numericRatings = (reviews ?? [])
    .map((review) =>
      typeof review.rating === 'number'
        ? review.rating
        : typeof review.rating === 'string'
          ? Number(review.rating)
          : NaN
    )
    .filter((rating) => Number.isFinite(rating));

  if (!numericRatings.length) {
    return 0;
  }

  const averageRating =
    numericRatings.reduce((total, rating) => total + rating, 0) / numericRatings.length;

  return Number(averageRating.toFixed(1));
};

const mapVenue = (venue: VenueApiItem): Venue => {
  const information = venue.information ?? {};
  const pricing = venue.pricing ?? {};
  const media = venue.media ?? {};
  const locationParts = [information.area, information.city].filter(
    (value): value is string => Boolean(value?.trim())
  );
  const firstImage =
    Array.isArray(media.galleryImages) &&
    typeof media.galleryImages[0] === 'string' &&
    media.galleryImages[0].trim()
      ? media.galleryImages[0]
      : img.src;

  return {
    id: venue._id,
    name: information.venueName?.trim() || 'Untitled Venue',
    location: locationParts.length ? locationParts.join(', ') : 'Location unavailable',
    rating: getVenueRating(venue.reviews),
    reviewCount: Array.isArray(venue.reviews) ? venue.reviews.length : 0,
    pricePerDay: typeof pricing.basePrice === 'number' ? pricing.basePrice : 0,
    imageUrl: firstImage,
    category: information.venueType?.trim() || 'Venue',
  };
};

const VenueCard: React.FC<{ venue: Venue }> = ({ venue }) => {
  const router = useRouter();

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const isFilled = starValue <= Math.floor(rating);
      const isHalf = !isFilled && starValue - 0.5 <= rating;

      return (
        <svg
          key={index}
          className="w-4 h-4"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          {isHalf ? (
            <defs>
              <linearGradient id={`half-${venue.id}-${index}`}>
                <stop offset="50%" stopColor="#FFC107" />
                <stop offset="50%" stopColor="#E0E0E0" />
              </linearGradient>
            </defs>
          ) : null}
          <path
            fill={isFilled ? '#FFC107' : isHalf ? `url(#half-${venue.id}-${index})` : '#E0E0E0'}
            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
          />
        </svg>
      );
    });
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden border border-[#E5E7EB] transition-all duration-300 transform hover:-translate-y-1 group">
      <div className="relative h-48 sm:h-56 overflow-hidden">
        <img
          src={venue.imageUrl}
          alt={venue.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="p-4 sm:p-5">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 line-clamp-1">
          {venue.name}
        </h3>

        <div className="flex items-center text-gray-600 mb-3">
          <svg
            className="w-4 h-4 mr-1 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-sm line-clamp-1">{venue.location}</span>
        </div>

        <div className="flex items-center mb-4">
          <div className="flex mr-2">
            {renderStars(venue.rating)}
          </div>
          <span className="text-sm font-semibold text-gray-900">
            {venue.rating > 0 ? venue.rating.toFixed(1) : 'New'}
          </span>
          <span className="text-sm text-gray-500 ml-1">
            ({venue.reviewCount} reviews)
          </span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            <span className="text-xl sm:text-2xl font-bold text-gray-900">
              {venue.pricePerDay.toLocaleString()}
            </span>
            <span className="text-sm text-gray-500"> BDT/day</span>
          </div>
          <button
            onClick={() => { router.push(`/pages/findVenues/${venue.id}`); }}
            className="bg-[#B74140] hover:bg-[#9a3534] text-white px-4 sm:px-6 py-2 rounded-md text-sm font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default function FeaturedVenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const fetchVenues = async () => {
      try {
        setIsLoading(true);
        setError('');

        const collectedVenues: VenueApiItem[] = [];
        const seenVenueIds = new Set<string>();
        let nextPage: number | undefined;
        let latestMeta: VenueListMeta | undefined;

        for (let requestCount = 0; requestCount < 20; requestCount += 1) {
          const response = await api.get<VenueListResponse>('/api/v1/public/venues', {
            params: {
              limit: FETCH_PAGE_SIZE,
              ...(typeof nextPage === 'number' ? { page: nextPage } : {}),
            },
          });

          const responseData = Array.isArray(response.data.data) ? response.data.data : [];

          responseData.forEach((venue) => {
            if (seenVenueIds.has(venue._id)) {
              return;
            }

            seenVenueIds.add(venue._id);
            collectedVenues.push(venue);
          });

          latestMeta = response.data.meta;

          if (!latestMeta?.hasNextPage || typeof latestMeta.page !== 'number') {
            break;
          }

          nextPage = latestMeta.page + 1;
        }

        if (!isMounted) {
          return;
        }

        const mappedVenues = collectedVenues.map(mapVenue);
        setVenues(mappedVenues);
      } catch (fetchError) {
        if (!isMounted) {
          return;
        }

        setError(getApiErrorMessage(fetchError));
        setVenues([]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchVenues();

    return () => {
      isMounted = false;
    };
  }, []);

  const categories = useMemo(() => {
    return Array.from(new Set(venues.map((venue) => venue.category)));
  }, [venues]);

  useEffect(() => {
    if (!categories.length) {
      setSelectedCategory('');
      return;
    }

    setSelectedCategory((currentCategory) =>
      currentCategory && categories.includes(currentCategory) ? currentCategory : categories[0]
    );
  }, [categories]);

  const filteredVenues = useMemo(() => {
    if (!selectedCategory) {
      return venues;
    }

    return venues.filter((venue) => venue.category === selectedCategory);
  }, [selectedCategory, venues]);

  const displayedVenues = filteredVenues.slice(0, visibleCount);
  const hasMore = visibleCount < filteredVenues.length;

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  };

  const handleShowMore = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    router.push('/pages/findVenues');
  };

  return (
    <div className=" bg-[#FAFAFA] px-[32px] py-[32px] lg:px-[64px] lg:py-[80px]">
      <div className="">
        <h2 className="font-inter font-semibold text-[36px] leading-[40px] tracking-normal text-center text-gray-900 mb-8">
          Featured Venues
        </h2>

        {categories.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-3 mb-[34px]">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={`px-4 sm:px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 border-2 border-dashed border-red-700 ${
                  selectedCategory === category
                    ? 'bg-[#B74140] text-white border border-[#E5E7EB] scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-[#E5E7EB]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-10 text-center text-red-700">
            {error}
          </div>
        ) : isLoading ? (
          <div className="rounded-lg border border-[#E5E7EB] bg-white px-6 py-10 text-center text-gray-500">
            Loading featured venues...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-[48px]">
              {displayedVenues.map((venue) => (
                <VenueCard key={venue.id} venue={venue} />
              ))}
            </div>

            {hasMore ? (
              <div className="flex justify-center">
                <button
                  onClick={handleShowMore}
                  className="bg-[#B74140] hover:bg-[#9a3534] text-white px-12 py-3 rounded-lg text-lg font-semibold transition-all duration-200 border border-[#E5E7EB] transform hover:-translate-y-0.5"
                >
                  Show More
                </button>
              </div>
            ) : null}

            {displayedVenues.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">
                  No venues found in this category.
                </p>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
