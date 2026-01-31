'use client';

import { useState, useMemo } from 'react';
import { serviceProvider, Filters } from './type';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ServiceProviderCard from './ServiceProviderCard';

interface serviceProviderProps {
  serviceProvider: serviceProvider[];
  filters: Filters;
}

const ITEMS_PER_PAGE = 9;

export default function ServiceProviderGrid({
  serviceProvider,
  filters,
}: serviceProviderProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // ✅ Filter providers
  const filteredVenues = useMemo(() => {
    return serviceProvider.filter((provider) => {
      // Location filter
      if (
        filters.location &&
        !provider.location
          .toLowerCase()
          .includes(filters.location.toLowerCase())
      ) {
        return false;
      }

      // Rating filter
      if (filters.ratings.length > 0) {
        const hasMatchingRating = filters.ratings.some((rating) => {
          if (rating === '5.0') return provider.rating === 5.0;
          if (rating === '4.0+') return provider.rating >= 4.0;
          if (rating === '3.0+') return provider.rating >= 3.0;
          return false;
        });

        if (!hasMatchingRating) return false;
      }

      // ✅ IMPORTANT
      return true;
    });
  }, [serviceProvider, filters]);

  // ✅ Pagination (NOW OUTSIDE useMemo)
  const totalPages = Math.ceil(filteredVenues.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentVenues = filteredVenues.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      {/* Results Count */}
      <div className="mb-6">
        <p className="text-slate-600">
          Showing{' '}
          <span className="font-semibold text-slate-900">
            {filteredVenues.length}{' '}
          Provider{filteredVenues.length !== 1 && 's'}
          </span>
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[24px] mb-12">
        {currentVenues.map((provider) => (
          <ServiceProviderCard
            key={provider.id}
            serviceProvider={provider}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-slate-300 disabled:opacity-50"
          >
            <ChevronLeft size={20} />
          </button>

          {[...Array(totalPages)].map((_, index) => {
            const page = index + 1;
            return (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`px-3 py-2 rounded-lg ${
                  currentPage === page
                    ? 'bg-[#B74140] text-white'
                    : 'border border-slate-300'
                }`}
              >
                {page}
              </button>
            );
          })}

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-slate-300 disabled:opacity-50"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* No Results */}
      {filteredVenues.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-bold">No providers found</h3>
          <p className="text-slate-600">
            Try adjusting your filters to see more results
          </p>
        </div>
      )}
    </div>
  );
}
