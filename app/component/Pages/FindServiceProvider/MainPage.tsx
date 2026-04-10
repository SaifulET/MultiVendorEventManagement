'use client';

import { useEffect, useMemo, useState } from 'react';

import { Filter } from 'lucide-react';

import { api, getApiErrorMessage } from '@/lib/api';

import { Filters, serviceProvider, VenueStatus } from './type';
import FilterSidebar from './FilterSideBar';
import FilterModal from './FilterModal';
import ServiceProviderGrid from './ServiceProviderGrid';

interface ServiceApiReview {
  rating?: number | string;
}

interface ServiceApiItem {
  _id: string;
  information?: {
    serviceName?: string;
    name?: string;
    title?: string;
    serviceCategory?: string;
    category?: string;
    serviceArea?: string[] | string;
    addressLine?: string;
    city?: string;
    area?: string;
  };
  pricing?: {
    amount?: number;
    basePrice?: number;
    hourlyRate?: number;
    pricePerHour?: number;
    currency?: string;
  };
  settings?: {
    serviceArea?: string[] | string;
    city?: string;
    area?: string;
  };
  media?: {
    galleryImages?: string[];
    profileImage?: string;
  };
  availabilityOverrides?: Array<{
    slots?: Array<{
      status?: string;
    }>;
  }>;
  publishStatus?: string;
  reviews?: ServiceApiReview[];
}

interface ServiceListMeta {
  page?: number;
  total?: number;
  hasNextPage?: boolean;
}

interface ServiceListResponse {
  success: boolean;
  meta?: ServiceListMeta;
  data?: ServiceApiItem[];
}

const FETCH_PAGE_SIZE = 100;
const DEFAULT_IMAGE = '/pp1.svg';

const getArrayValues = (value?: string[] | string) => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string' && Boolean(item.trim()));
  }

  if (typeof value === 'string' && value.trim()) {
    return [value];
  }

  return [];
};

const getServiceRating = (reviews?: ServiceApiReview[]) => {
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

const getServiceStatus = (service: ServiceApiItem): VenueStatus => {
  const publishStatus = service.publishStatus?.trim().toLowerCase();

  if (publishStatus && publishStatus !== 'published' && publishStatus !== 'approved') {
    return 'unavailable';
  }

  const slotStatuses = (service.availabilityOverrides ?? []).flatMap((override) =>
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

const mapServiceProvider = (service: ServiceApiItem): serviceProvider => {
  const information = service.information ?? {};
  const pricing = service.pricing ?? {};
  const settings = service.settings ?? {};
  const media = service.media ?? {};
  const serviceAreas = Array.from(
    new Set([
      ...getArrayValues(information.serviceArea),
      ...getArrayValues(settings.serviceArea),
    ])
  );
  const fallbackLocationParts = [
    information.addressLine,
    information.area,
    information.city,
    settings.area,
    settings.city,
  ].filter((value, index, values): value is string => {
    if (!value?.trim()) {
      return false;
    }

    return values.findIndex((item) => item === value) === index;
  });
  const firstImage =
    (Array.isArray(media.galleryImages) &&
    typeof media.galleryImages[0] === 'string' &&
    media.galleryImages[0].trim())
      ? media.galleryImages[0]
      : typeof media.profileImage === 'string' && media.profileImage.trim()
        ? media.profileImage
        : DEFAULT_IMAGE;

  return {
    id: service._id,
    name:
      information.serviceName?.trim() ||
      information.name?.trim() ||
      information.title?.trim() ||
      'Untitled Service',
    service:
      information.serviceCategory?.trim() ||
      information.category?.trim() ||
      'Service',
    location:
      serviceAreas.length
        ? serviceAreas.join(', ')
        : fallbackLocationParts.length
          ? fallbackLocationParts.join(', ')
          : 'Location unavailable',
    rating: getServiceRating(service.reviews),
    reviews: Array.isArray(service.reviews) ? service.reviews.length : 0,
    categories:
      information.serviceCategory?.trim() ||
      information.category?.trim() ||
      'Service',
    price:
      typeof pricing.amount === 'number'
        ? pricing.amount
        : typeof pricing.basePrice === 'number'
          ? pricing.basePrice
          : typeof pricing.pricePerHour === 'number'
            ? pricing.pricePerHour
            : typeof pricing.hourlyRate === 'number'
              ? pricing.hourlyRate
              : 0,
    currency: pricing.currency?.trim() || 'BDT',
    image: firstImage,
    status: getServiceStatus(service),
  };
};

export default function ProviderFinderPage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [providers, setProviders] = useState<serviceProvider[]>([]);
  const [totalProviders, setTotalProviders] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<Filters>({
    location: '',
    distance: 500,
    date: '',
    categories: [],
    ratings: [],
  });

  useEffect(() => {
    let isMounted = true;

    const fetchProviders = async () => {
      try {
        setIsLoading(true);
        setError('');

        const collectedServices: ServiceApiItem[] = [];
        const seenIds = new Set<string>();
        let nextPage: number | undefined;
        let latestMeta: ServiceListMeta | undefined;

        for (let requestCount = 0; requestCount < 20; requestCount += 1) {
          const response = await api.get<ServiceListResponse>('/api/v1/public/services', {
            params: {
              limit: FETCH_PAGE_SIZE,
              ...(typeof nextPage === 'number' ? { page: nextPage } : {}),
            },
          });

          const responseData = Array.isArray(response.data.data) ? response.data.data : [];

          responseData.forEach((service) => {
            if (seenIds.has(service._id)) {
              return;
            }

            seenIds.add(service._id);
            collectedServices.push(service);
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

        setProviders(collectedServices.map(mapServiceProvider));
        setTotalProviders(
          typeof latestMeta?.total === 'number' ? latestMeta.total : collectedServices.length
        );
      } catch (fetchError) {
        if (!isMounted) {
          return;
        }

        setError(getApiErrorMessage(fetchError));
        setProviders([]);
        setTotalProviders(0);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchProviders();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  const availableCategories = useMemo(() => {
    return Array.from(new Set(providers.map((provider) => provider.categories))).sort();
  }, [providers]);

  const providerSummaryText = useMemo(() => {
    if (isLoading) {
      return 'Loading service providers for your event';
    }

    const count = totalProviders || providers.length;
    return `Browse through ${count.toLocaleString()} service provider${count === 1 ? '' : 's'} for your event`;
  }, [isLoading, providers.length, totalProviders]);

  return (
    <div className="">
      <header className="bg-white border-b border-[#E5E7EB] z-40 ">
        <div className=" px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="text-center m-auto">
              <h1 className="font-inter font-semibold md:text-[30px] md:leading-[36px] tracking-normal">
                Find Your Perfect Service Provider
              </h1>
              <p className="text-slate-600 mt-1 text-sm sm:text-base">
                {providerSummaryText}
              </p>
            </div>

            <button
              onClick={() => setIsFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-[#B74140] text-white rounded-lg hover:bg-[#9b3534] transition-colors border border-[#E5E7EB]"
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
                availableCategories={availableCategories}
              />
            </div>
          </aside>

          <FilterModal
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
            filters={filters}
            onFilterChange={handleFilterChange}
            availableCategories={availableCategories}
          />

          <main className="flex-1 min-w-0">
            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center text-red-700">
                {error}
              </div>
            ) : isLoading ? (
              <div className="rounded-2xl border border-[#E5E7EB] bg-white px-6 py-12 text-center text-slate-500">
                Loading service providers...
              </div>
            ) : (
              <ServiceProviderGrid serviceProvider={providers} filters={filters} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
