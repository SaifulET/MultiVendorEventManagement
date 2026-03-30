'use client';

import { useEffect, useMemo, useState } from 'react';

import { Filter } from 'lucide-react';

import { api, getApiErrorMessage } from '@/lib/api';

import { Filters, Venue, VenueStatus } from './type';
import FilterSidebar from './FilterSideBar';
import FilterModal from './FilterModal';
import VenueGrid from './VenueGrid';

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
    amenities?: Record<string, boolean> | string[];
  };
  capacity?: {
    maximumGuests?: number;
  };
  media?: {
    galleryImages?: string[];
  };
  availabilityOverrides?: Array<{
    slots?: Array<{
      hour?: number;
      status?: string;
    }>;
  }>;
  publishStatus?: string;
  reviews?: VenueApiReview[];
}

interface VenueListMeta {
  page?: number;
  total?: number;
  hasNextPage?: boolean;
}

interface VenueListResponse {
  success: boolean;
  meta?: VenueListMeta;
  data?: VenueApiItem[];
}

const FETCH_PAGE_SIZE = 100;
const DEFAULT_COORDINATES = {
  latitude: 23.8103,
  longitude: 90.4125,
};

const getVenueAmenities = (
  amenities?: Record<string, boolean> | string[]
) => {
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

const getVenueStatus = (venue: VenueApiItem): VenueStatus => {
  const publishStatus = venue.publishStatus?.trim().toLowerCase();

  if (publishStatus && publishStatus !== 'published' && publishStatus !== 'approved') {
    return 'unavailable';
  }

  const slotStatuses = (venue.availabilityOverrides ?? []).flatMap((override) =>
    (override.slots ?? [])
      .map((slot) => slot.status?.trim().toLowerCase())
      .filter((status): status is string => Boolean(status))
  );

  if (slotStatuses.includes('available')) {
    return 'available';
  }

  if (slotStatuses.length > 0 && slotStatuses.every((status) => status === 'booked')) {
    return 'booked';
  }

  if (slotStatuses.includes('pending')) {
    return 'unavailable';
  }

  return 'available';
};

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

const mapVenueToCardData = (venue: VenueApiItem): Venue => {
  const information = venue.information ?? {};
  const pricing = venue.pricing ?? {};
  const capacity = venue.capacity ?? {};
  const media = venue.media ?? {};
  const locationParts = [information.addressLine, information.area, information.city].filter(
    (value): value is string => Boolean(value?.trim())
  );
  const firstImage =
    Array.isArray(media.galleryImages) &&
    typeof media.galleryImages[0] === 'string' &&
    media.galleryImages[0].trim()
      ? media.galleryImages[0]
      : '';

  return {
    id: venue._id,
    name: information.venueName?.trim() || 'Untitled Venue',
    category: information.venueType?.trim() || 'Venue',
    location: locationParts.length ? locationParts.join(', ') : 'Location unavailable',
    rating: getVenueRating(venue.reviews),
    reviews: Array.isArray(venue.reviews) ? venue.reviews.length : 0,
    capacity: typeof capacity.maximumGuests === 'number' ? capacity.maximumGuests : 0,
    price: typeof pricing.basePrice === 'number' ? pricing.basePrice : 0,
    image: firstImage,
    amenities: getVenueAmenities(pricing.amenities),
    status: getVenueStatus(venue),
    latitude: DEFAULT_COORDINATES.latitude,
    longitude: DEFAULT_COORDINATES.longitude,
  };
};

export default function VenueFinderPage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [totalVenues, setTotalVenues] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<Filters>({
    location: '',
    distance: 500,
    date: '',
    capacity: undefined,
    categories: [],
    ratings: [],
    amenities: [],
  });

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

        setVenues(collectedVenues.map(mapVenueToCardData));
        setTotalVenues(
          typeof latestMeta?.total === 'number' ? latestMeta.total : collectedVenues.length
        );
      } catch (fetchError) {
        if (!isMounted) {
          return;
        }

        setError(getApiErrorMessage(fetchError));
        setVenues([]);
        setTotalVenues(0);
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

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  const venueSummaryText = useMemo(() => {
    if (isLoading) {
      return 'Loading venues for your next event';
    }

    const count = totalVenues || venues.length;
    return `Browse through ${count.toLocaleString()} venue${count === 1 ? '' : 's'} available for your next event`;
  }, [isLoading, totalVenues, venues.length]);

  return (
    <div className="">
      <header className="bg-white  border-b border-[#E5E7EB]  sticky top-0 z-40 ">
        <div className=" px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="text-center m-auto">
              <h1 className="font-inter font-semibold md:text-[30px] md:leading-[36px] tracking-normal">
                Find Your Perfect Venue
              </h1>
              <p className="text-slate-600 mt-1 text-sm sm:text-base">
                {venueSummaryText}
              </p>
            </div>

            <button
              onClick={() => setIsFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-[#B74140] text-white rounded-lg hover:bg-[#9b3534] transition-colors border border-[#E5E7EB] "
            >
              <Filter size={20} />
              <span className="font-medium">Filters</span>
            </button>
          </div>
        </div>
      </header>

      <div className=" px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-[24px]">
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-32">
              <FilterSidebar
                filters={filters}
                onFilterChange={handleFilterChange}
              />
            </div>
          </aside>

          <FilterModal
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
            filters={filters}
            onFilterChange={handleFilterChange}
          />

          <main className="flex-1 min-w-0">
            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center text-red-700">
                {error}
              </div>
            ) : isLoading ? (
              <div className="rounded-2xl border border-[#E5E7EB] bg-white px-6 py-12 text-center text-slate-500">
                Loading venues...
              </div>
            ) : (
              <VenueGrid venues={venues} filters={filters} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
