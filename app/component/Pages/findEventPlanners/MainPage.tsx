'use client';

import { useEffect, useMemo, useState } from 'react';

import { Filter } from 'lucide-react';

import { api, getApiErrorMessage } from '@/lib/api';

import FilterSidebar from './FilterSideBar';
import FilterModal from './FilterModal';
import ServiceProviderGrid from './ServiceProviderGrid';
import { Filters, serviceProvider, VenueStatus } from './type';

interface EventPlannerProfileInfo {
  name?: string;
  description?: string;
  coverageArea?: string[];
  address?: string;
}

interface EventPlannerApiItem {
  _id: string;
  fullName?: string;
  email?: string;
  serviceCategories?: string[];
  isBlocked?: boolean;
  onboarding?: {
    eventProvider?: {
      fullName?: string;
      email?: string;
      profileInfo?: EventPlannerProfileInfo;
    };
    verification?: {
      companyName?: string;
    };
  };
}

interface EventPlannerListMeta {
  page?: number;
  total?: number;
  hasNextPage?: boolean;
}

interface EventPlannerListResponse {
  success: boolean;
  meta?: EventPlannerListMeta;
  data?: EventPlannerApiItem[] | EventPlannerApiItem;
}

const FETCH_PAGE_SIZE = 100;
const DEFAULT_IMAGE = '/pp1.svg';

const getArrayValues = (value?: string[]) =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && Boolean(item.trim()))
    : [];

const getPlannerStatus = (planner: EventPlannerApiItem): VenueStatus =>
  planner.isBlocked ? 'unavailable' : 'available';

const mapEventPlanner = (planner: EventPlannerApiItem): serviceProvider => {
  const profileInfo = planner.onboarding?.eventProvider?.profileInfo;
  const categoryList = getArrayValues(planner.serviceCategories);
  const locationParts = [
    ...(profileInfo?.coverageArea ?? []),
    profileInfo?.address,
  ].filter((value, index, values): value is string => {
    if (!value?.trim()) {
      return false;
    }

    return values.findIndex((item) => item === value) === index;
  });

  return {
    id: planner._id,
    name:
      profileInfo?.name?.trim() ||
      planner.fullName?.trim() ||
      planner.onboarding?.eventProvider?.fullName?.trim() ||
      'Untitled Event Planner',
    location: locationParts.length ? locationParts.join(', ') : 'Coverage area unavailable',
    rating: 0,
    reviews: 0,
    categories: categoryList.length ? categoryList.join(', ') : 'Event Planner',
    categoryList: categoryList.length ? categoryList : ['Event Planner'],
    price: 0,
    currency: '',
    image: DEFAULT_IMAGE,
    status: getPlannerStatus(planner),
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

        const collectedPlanners: EventPlannerApiItem[] = [];
        const seenIds = new Set<string>();
        let nextPage: number | undefined;
        let latestMeta: EventPlannerListMeta | undefined;

        for (let requestCount = 0; requestCount < 20; requestCount += 1) {
          const response = await api.get<EventPlannerListResponse>('/api/v1/public/event-planners', {
            params: {
              limit: FETCH_PAGE_SIZE,
              ...(typeof nextPage === 'number' ? { page: nextPage } : {}),
            },
          });

          const responseData = Array.isArray(response.data.data)
            ? response.data.data
            : response.data.data
              ? [response.data.data]
              : [];

          responseData.forEach((planner) => {
            if (seenIds.has(planner._id)) {
              return;
            }

            seenIds.add(planner._id);
            collectedPlanners.push(planner);
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

        setProviders(collectedPlanners.map(mapEventPlanner));
        setTotalProviders(
          typeof latestMeta?.total === 'number' ? latestMeta.total : collectedPlanners.length
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
    return Array.from(
      new Set(
        providers.flatMap((provider) => provider.categoryList)
      )
    );
  }, [providers]);

  return (
    <div className="">
      <header className="z-40 border-b border-[#E5E7EB] bg-white">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="m-auto text-center">
              <h1 className="font-inter text-2xl font-semibold tracking-normal md:text-[30px] md:leading-[36px]">
                Find Your Perfect Event Planner
              </h1>
              <p className="mt-2 text-sm text-slate-600 md:text-base">
                {isLoading
                  ? 'Loading event planners...'
                  : `${totalProviders} planner${totalProviders !== 1 ? 's' : ''} available`}
              </p>
            </div>

            <button
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-[#B74140] px-4 py-2.5 text-white transition-colors hover:bg-[#9b3534] lg:hidden"
            >
              <Filter size={20} />
              <span className="font-medium">Filters</span>
            </button>
          </div>
        </div>
      </header>

      <div className="px-4 py-8 sm:px-6 lg:px-8">
        {error ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-6 py-5 text-red-700">
            {error}
          </div>
        ) : null}

        <div className="flex flex-col gap-[24px] lg:flex-row">
          <aside className="hidden w-64 flex-shrink-0 lg:block">
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

          <main className="min-w-0 flex-1">
            <ServiceProviderGrid
              serviceProvider={providers}
              filters={filters}
              isLoading={isLoading}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
