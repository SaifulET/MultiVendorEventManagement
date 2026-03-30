'use client';

import { useEffect, useMemo, useState } from 'react';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import VenueCard from './VenueCard';
import { Filters, Venue } from './type';

interface VenueGridProps {
  venues: Venue[];
  filters: Filters;
}

const ITEMS_PER_PAGE = 9;

export default function VenueGrid({ venues, filters }: VenueGridProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const filteredVenues = useMemo(() => {
    return venues.filter((venue) => {
      if (
        filters.location &&
        !venue.location.toLowerCase().includes(filters.location.toLowerCase())
      ) {
        return false;
      }

      if (filters.capacity && venue.capacity < filters.capacity) {
        return false;
      }

      if (filters.categories.length > 0) {
        const normalizedCategory = venue.category.toLowerCase();
        const hasMatchingCategory = filters.categories.some((category) => {
          const normalizedFilter = category.toLowerCase();

          return (
            normalizedCategory.includes(normalizedFilter) ||
            normalizedFilter.includes(normalizedCategory)
          );
        });

        if (!hasMatchingCategory) {
          return false;
        }
      }

      if (filters.ratings.length > 0) {
        const hasMatchingRating = filters.ratings.some((rating) => {
          if (rating === '5.0') return venue.rating === 5.0;
          if (rating === '4.0+') return venue.rating >= 4.0;
          if (rating === '3.0+') return venue.rating >= 3.0;
          return false;
        });

        if (!hasMatchingRating) {
          return false;
        }
      }

      if (filters.amenities.length > 0) {
        const hasAllAmenities = filters.amenities.every((amenity) =>
          venue.amenities.includes(amenity)
        );

        if (!hasAllAmenities) {
          return false;
        }
      }

      return true;
    });
  }, [venues, filters]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, venues]);

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
      <div className="mb-6">
        <p className="text-slate-600">
          Showing <span className="font-semibold text-slate-900">{filteredVenues.length}</span> venue
          {filteredVenues.length !== 1 && 's'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[24px] mb-12">
        {currentVenues.map((venue) => (
          <VenueCard key={venue.id} venue={venue} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={20} className="text-slate-600" />
          </button>

          <div className="flex items-center gap-2">
            {[...Array(totalPages)].map((_, index) => {
              const pageNumber = index + 1;
              const showPage =
                pageNumber === 1 ||
                pageNumber === totalPages ||
                (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1);
              const showEllipsisBefore = pageNumber === currentPage - 2 && currentPage > 3;
              const showEllipsisAfter = pageNumber === currentPage + 2 && currentPage < totalPages - 2;

              if (showEllipsisBefore || showEllipsisAfter) {
                return (
                  <span key={pageNumber} className="px-3 py-2 text-slate-400">
                    ...
                  </span>
                );
              }

              if (!showPage) return null;

              return (
                <button
                  key={pageNumber}
                  onClick={() => goToPage(pageNumber)}
                  className={`min-w-[40px] px-3 py-2 rounded-lg font-medium transition-all ${
                    currentPage === pageNumber
                      ? 'bg-[#B74140] text-white border border-[#E5E7EB] '
                      : 'border border-[#E5E7EB] text-slate-700 hover:bg-[#943a38]'
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={20} className="text-slate-600" />
          </button>
        </div>
      )}

      {filteredVenues.length === 0 && (
        <div className="text-center py-16">
          <div className="text-2xl font-semibold text-slate-400 mb-4">No matches</div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">No venues found</h3>
          <p className="text-slate-600">Try adjusting your filters to see more results</p>
        </div>
      )}
    </div>
  );
}
