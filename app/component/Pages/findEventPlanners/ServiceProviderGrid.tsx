'use client';

import { useEffect, useMemo, useState } from 'react';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import ServiceProviderCard from './ServiceProviderCard';
import { Filters, serviceProvider } from './type';

interface serviceProviderProps {
  serviceProvider: serviceProvider[];
  filters: Filters;
  isLoading?: boolean;
}

const ITEMS_PER_PAGE = 9;

export default function ServiceProviderGrid({
  serviceProvider,
  filters,
  isLoading = false,
}: serviceProviderProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const filteredProviders = useMemo(() => {
    return serviceProvider.filter((provider) => {
      if (
        filters.location &&
        !provider.location.toLowerCase().includes(filters.location.toLowerCase())
      ) {
        return false;
      }

      if (filters.categories.length > 0) {
        const normalizedCategories = provider.categoryList.map((category) => category.toLowerCase());
        const hasMatchingCategory = filters.categories.some((category) =>
          normalizedCategories.includes(category.toLowerCase())
        );

        if (!hasMatchingCategory) {
          return false;
        }
      }

      if (filters.ratings.length > 0) {
        const hasMatchingRating = filters.ratings.some((rating) => {
          if (rating === '5.0') return provider.rating === 5.0;
          if (rating === '4.0+') return provider.rating >= 4.0;
          if (rating === '3.0+') return provider.rating >= 3.0;
          return false;
        });

        if (!hasMatchingRating) {
          return false;
        }
      }

      return true;
    });
  }, [serviceProvider, filters]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, serviceProvider]);

  const totalPages = Math.ceil(filteredProviders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentProviders = filteredProviders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div>
        <div className="mb-6 h-6 w-48 animate-pulse rounded bg-slate-200" />
        <div className="grid grid-cols-1 gap-[24px] md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white"
            >
              <div className="h-[191px] animate-pulse bg-slate-200" />
              <div className="space-y-4 p-4">
                <div className="h-6 animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100" />
                <div className="h-10 animate-pulse rounded bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <p className="text-slate-600">
          Showing{' '}
          <span className="font-semibold text-slate-900">
            {filteredProviders.length}
          </span>{' '}
          planner{filteredProviders.length !== 1 && 's'}
        </p>
      </div>

      <div className="mb-12 grid grid-cols-1 gap-[24px] md:grid-cols-2 xl:grid-cols-3">
        {currentProviders.map((provider) => (
          <ServiceProviderCard
            key={provider.id}
            serviceProvider={provider}
          />
        ))}
      </div>

      {totalPages > 1 ? (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="rounded-lg border border-slate-300 p-2 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft size={20} className="text-slate-600" />
          </button>

          {Array.from({ length: totalPages }, (_, index) => {
            const page = index + 1;
            return (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`rounded-lg px-3 py-2 ${
                  currentPage === page
                    ? 'bg-[#B74140] text-white'
                    : 'border border-slate-300 text-slate-700'
                }`}
              >
                {page}
              </button>
            );
          })}

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="rounded-lg border border-slate-300 p-2 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronRight size={20} className="text-slate-600" />
          </button>
        </div>
      ) : null}

      {!filteredProviders.length ? (
        <div className="py-16 text-center">
          <div className="mb-4 text-2xl font-semibold text-slate-400">No matches</div>
          <h3 className="text-2xl font-bold">No planners found</h3>
          <p className="text-slate-600">
            Try adjusting your filters to see more results
          </p>
        </div>
      ) : null}
    </div>
  );
}
