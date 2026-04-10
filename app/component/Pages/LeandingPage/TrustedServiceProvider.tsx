'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { api, getApiErrorMessage } from '@/lib/api';
import img from '@/public/pp1.svg';

interface ServiceProvider {
  id: string;
  name: string;
  service: string;
  location: string;
  rating: number;
  reviewCount: number;
  price: number;
  currency: string;
  imageUrl: string;
  category: string;
}

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
  reviews?: ServiceApiReview[];
}

interface ServiceListMeta {
  page?: number;
  hasNextPage?: boolean;
}

interface ServiceListResponse {
  success: boolean;
  meta?: ServiceListMeta;
  data?: ServiceApiItem[];
}

const FETCH_PAGE_SIZE = 50;
const INITIAL_VISIBLE_COUNT = 3;

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

const mapServiceProvider = (service: ServiceApiItem): ServiceProvider => {
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
  const imageUrl =
    (Array.isArray(media.galleryImages) &&
    typeof media.galleryImages[0] === 'string' &&
    media.galleryImages[0].trim())
      ? media.galleryImages[0]
      : typeof media.profileImage === 'string' && media.profileImage.trim()
        ? media.profileImage
        : img.src;

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
    reviewCount: Array.isArray(service.reviews) ? service.reviews.length : 0,
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
    imageUrl,
    category:
      information.serviceCategory?.trim() ||
      information.category?.trim() ||
      'Service',
  };
};

const ServiceCard: React.FC<{ provider: ServiceProvider }> = ({ provider }) => {
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
              <linearGradient id={`half-${provider.id}-${index}`}>
                <stop offset="50%" stopColor="#FFC107" />
                <stop offset="50%" stopColor="#E0E0E0" />
              </linearGradient>
            </defs>
          ) : null}
          <path
            fill={isFilled ? '#FFC107' : isHalf ? `url(#half-${provider.id}-${index})` : '#E0E0E0'}
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
          src={provider.imageUrl}
          alt={provider.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="p-4 sm:p-5">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 line-clamp-1">
          {provider.name}
        </h3>

        <p className="mb-2 text-sm font-medium text-[#B74140] line-clamp-1">
          {provider.service}
        </p>

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
          <span className="text-sm line-clamp-1">{provider.location}</span>
        </div>

        <div className="flex items-center mb-4">
          <div className="flex mr-2">
            {renderStars(provider.rating)}
          </div>
          <span className="text-sm font-semibold text-gray-900">
            {provider.rating > 0 ? provider.rating.toFixed(1) : 'New'}
          </span>
          <span className="text-sm text-gray-500 ml-1">
            ({provider.reviewCount} reviews)
          </span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            <span className="text-xl sm:text-2xl font-bold text-gray-900">
              {provider.price.toLocaleString()} {provider.currency}
            </span>
          </div>
          <button
            onClick={() => { router.push(`/pages/findServiceProvider/${provider.id}`); }}
            className="bg-[#B74140] hover:bg-[#9a3534] text-white px-4 sm:px-6 py-2 rounded-md text-sm font-medium transition-colors duration-200 border border-[#E5E7EB]"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default function TrustedServiceProviderPage() {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

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

          console.log('[Homepage][Service Providers] GET /api/v1/public/services response:', {
            page: typeof nextPage === 'number' ? nextPage : 1,
            params: response.config?.params,
            data: response.data,
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

        const mappedProviders = collectedServices.map(mapServiceProvider);
        console.log('[Homepage][Service Providers] mapped providers:', mappedProviders);
        setProviders(mappedProviders);
      } catch (fetchError) {
        if (!isMounted) {
          return;
        }

        console.error('[Homepage][Service Providers] GET /api/v1/public/services failed:', fetchError);
        setError(getApiErrorMessage(fetchError));
        setProviders([]);
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

  const categories = useMemo(() => {
    return Array.from(new Set(providers.map((provider) => provider.category)));
  }, [providers]);

  useEffect(() => {
    if (!categories.length) {
      setSelectedCategory('');
      return;
    }

    setSelectedCategory((currentCategory) =>
      currentCategory && categories.includes(currentCategory) ? currentCategory : categories[0]
    );
  }, [categories]);

  const filteredProviders = useMemo(() => {
    if (!selectedCategory) {
      return providers;
    }

    return providers.filter((provider) => provider.category === selectedCategory);
  }, [providers, selectedCategory]);

  const displayedProviders = filteredProviders.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProviders.length;

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  };

  const handleShowMore = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    router.push('/pages/findServiceProvider');
  };

  return (
    <div className=" bg-[#FAFAFA] px-[32px] py-[32px] lg:px-[64px] lg:py-[80px]">
      <div className="">
        <h2 className="font-inter font-semibold text-[36px] leading-[40px] tracking-normal text-center text-gray-900 mb-8">
          Trusted Service Providers for Every Event
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
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
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
            Loading service providers...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-[48px]">
              {displayedProviders.map((provider) => (
                <ServiceCard key={provider.id} provider={provider} />
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

            {displayedProviders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">
                  No service providers found in this category.
                </p>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
