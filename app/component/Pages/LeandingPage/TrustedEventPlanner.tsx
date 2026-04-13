'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { api, getApiErrorMessage } from '@/lib/api';

interface EventPlannerProfileInfo {
  name?: string;
  description?: string;
  coverageArea?: string[];
  address?: string;
  profileImage?: string;
}

interface EventPlannerApiItem {
  _id: string;
  fullName?: string;
  email?: string;
  profileImage?: string;
  serviceCategories?: string[];
  isBlocked?: boolean;
  onboarding?: {
    eventProvider?: {
      fullName?: string;
      email?: string;
      profileImage?: string;
      profileInfo?: EventPlannerProfileInfo;
    };
  };
}

interface EventPlannerListMeta {
  page?: number;
  hasNextPage?: boolean;
}

interface EventPlannerListResponse {
  success: boolean;
  meta?: EventPlannerListMeta;
  data?: EventPlannerApiItem[] | EventPlannerApiItem;
}

interface EventPlannerCardData {
  id: string;
  name: string;
  service: string;
  location: string;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  category: string;
}

const FETCH_PAGE_SIZE = 50;
const INITIAL_VISIBLE_COUNT = 3;
const DEFAULT_IMAGE = '/pp1.svg';

const getArrayValues = (value?: string[]) =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && Boolean(item.trim()))
    : [];

const mapEventPlanner = (planner: EventPlannerApiItem): EventPlannerCardData => {
  const profileInfo = planner.onboarding?.eventProvider?.profileInfo;
  const categories = getArrayValues(planner.serviceCategories);
  const plannerProfileImage =
    (typeof planner.profileImage === 'string' && planner.profileImage.trim()) ||
    (typeof planner.onboarding?.eventProvider?.profileImage === 'string' &&
      planner.onboarding.eventProvider.profileImage.trim()) ||
    (typeof profileInfo?.profileImage === 'string' && profileInfo.profileImage.trim()) ||
    DEFAULT_IMAGE;
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
    service: categories.length ? categories.join(', ') : 'Event Planner',
    location: locationParts.length ? locationParts.join(', ') : 'Coverage area unavailable',
    rating: 0,
    reviewCount: 0,
    imageUrl: plannerProfileImage,
    category: categories[0] || 'Event Planner',
  };
};

const EventPlannerCard: React.FC<{ planner: EventPlannerCardData }> = ({ planner }) => {
  const router = useRouter();

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const isFilled = starValue <= Math.floor(rating);
      const isHalf = !isFilled && starValue - 0.5 <= rating;

      return (
        <svg
          key={index}
          className="h-4 w-4"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          {isHalf ? (
            <defs>
              <linearGradient id={`planner-half-${planner.id}-${index}`}>
                <stop offset="50%" stopColor="#FFC107" />
                <stop offset="50%" stopColor="#E0E0E0" />
              </linearGradient>
            </defs>
          ) : null}
          <path
            fill={isFilled ? '#FFC107' : isHalf ? `url(#planner-half-${planner.id}-${index})` : '#E0E0E0'}
            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
          />
        </svg>
      );
    });
  };

  return (
    <div className="group overflow-hidden rounded-lg border border-[#E5E7EB] bg-white transition-all duration-300 hover:-translate-y-1">
      <div className="relative h-48 overflow-hidden sm:h-56">
        <img
          src={planner.imageUrl}
          alt={planner.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      <div className="p-4 sm:p-5">
        <h3 className="mb-2 line-clamp-1 text-lg font-bold text-gray-900 sm:text-xl">
          {planner.name}
        </h3>

        <p className="mb-2 line-clamp-1 text-sm font-medium text-[#B74140]">
          {planner.service}
        </p>

        <div className="mb-3 flex items-center text-gray-600">
          <svg
            className="mr-1 h-4 w-4 flex-shrink-0"
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
          <span className="line-clamp-1 text-sm">{planner.location}</span>
        </div>

        <div className="mb-4 flex items-center">
          <div className="mr-2 flex">
            {renderStars(planner.rating)}
          </div>
          <span className="text-sm font-semibold text-gray-900">
            {planner.rating > 0 ? planner.rating.toFixed(1) : 'New'}
          </span>
          <span className="ml-1 text-sm text-gray-500">
            ({planner.reviewCount} reviews)
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
          <div>
            <span className="text-base font-semibold text-gray-900">
              Custom planning
            </span>
          </div>
          <button
            onClick={() => { router.push(`/pages/findEventPlanners/${planner.id}`); }}
            className="rounded-md border border-[#E5E7EB] bg-[#B74140] px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-[#9a3534] sm:px-6"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default function TrustedEventPlannerPage() {
  const [planners, setPlanners] = useState<EventPlannerCardData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const fetchPlanners = async () => {
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

          console.log(`[Event Planners] `, response.data);

          const responseData = Array.isArray(response.data.data)
            ? response.data.data
            : response.data.data
              ? [response.data.data]
              : [];

          responseData.forEach((planner) => {
            if (planner.isBlocked || seenIds.has(planner._id)) {
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

        const mappedPlanners = collectedPlanners.map(mapEventPlanner);
        console.log('[Homepage][Event Planners] mapped planners:', mappedPlanners);
        setPlanners(mappedPlanners);
      } catch (fetchError) {
        if (!isMounted) {
          return;
        }

        console.error('[Homepage][Event Planners] GET /api/v1/public/event-planners failed:', fetchError);
        setError(getApiErrorMessage(fetchError));
        setPlanners([]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchPlanners();

    return () => {
      isMounted = false;
    };
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(planners.map((planner) => planner.category))),
    [planners]
  );

  useEffect(() => {
    if (!categories.length) {
      setSelectedCategory('');
      return;
    }

    setSelectedCategory((currentCategory) =>
      currentCategory && categories.includes(currentCategory) ? currentCategory : categories[0]
    );
  }, [categories]);

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  }, [selectedCategory]);

  const filteredPlanners = useMemo(() => {
    if (!selectedCategory) {
      return planners;
    }

    return planners.filter((planner) => planner.category === selectedCategory);
  }, [planners, selectedCategory]);

  const displayedPlanners = filteredPlanners.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPlanners.length;

  const handleShowMore = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    router.push('/pages/findEventPlanners');
  };

  return (
    <div className="bg-[#FAFAFA] px-[32px] py-[32px] lg:px-[64px] lg:py-[80px]">
      <div>
        <h2 className="mb-8 text-center font-inter text-[36px] font-bold leading-[40px] tracking-normal text-gray-900">
          Trusted Event Planner for Every Event
        </h2>

        {categories.length > 1 ? (
          <div className="mb-10 flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => { setSelectedCategory(category); }}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-[#B74140] text-white'
                    : 'bg-white text-slate-700 border border-slate-200 hover:border-[#B74140] hover:text-[#B74140]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        ) : null}

        {error ? (
          <div className="mb-8 rounded-2xl border border-red-100 bg-red-50 px-6 py-5 text-center text-red-700">
            {error}
          </div>
        ) : null}

        {isLoading ? (
          <div className="mb-[48px] grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
                <div className="h-48 animate-pulse bg-slate-200 sm:h-56" />
                <div className="space-y-4 p-5">
                  <div className="h-6 animate-pulse rounded bg-slate-200" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
                  <div className="h-10 animate-pulse rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mb-[48px] grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {displayedPlanners.map((planner) => (
              <EventPlannerCard key={planner.id} planner={planner} />
            ))}
          </div>
        )}

        {hasMore ? (
          <div className="flex justify-center">
            <button
              onClick={handleShowMore}
              className="transform rounded-lg border border-[#E5E7EB] bg-[#B74140] px-12 py-3 text-lg font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#9a3534]"
            >
              Show More
            </button>
          </div>
        ) : null}

        {!isLoading && !displayedPlanners.length ? (
          <div className="py-12 text-center">
            <p className="text-lg text-gray-600">
              No event planners found in this category.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
