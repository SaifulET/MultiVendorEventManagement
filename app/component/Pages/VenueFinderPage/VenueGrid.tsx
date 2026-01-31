'use client';

import { useState, useMemo } from 'react';
import VenueCard from './VenueCard';
import { Venue, Filters } from './type';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface VenueGridProps {
  venues: Venue[];
  filters: Filters;
}

const ITEMS_PER_PAGE = 9; // 3 rows × 3 columns

export default function VenueGrid({ venues, filters }: VenueGridProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Filter venues based on filters
  const filteredVenues = useMemo(() => {
    return venues.filter((venue) => {
      // Location filter
      if (filters.location && !venue.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }

      // Capacity filter
      if (filters.capacity && venue.capacity < filters.capacity) {
        return false;
      }

      // Rating filter
      if (filters.ratings.length > 0) {
        const hasMatchingRating = filters.ratings.some((rating) => {
          if (rating === '5.0') return venue.rating === 5.0;
          if (rating === '4.0+') return venue.rating >= 4.0;
          if (rating === '3.0+') return venue.rating >= 3.0;
          return false;
        });
        if (!hasMatchingRating) return false;
      }

      // Amenities filter
      if (filters.amenities.length > 0) {
        const hasAllAmenities = filters.amenities.every((amenity) =>
          venue.amenities.includes(amenity)
        );
        if (!hasAllAmenities) return false;
      }

      return true;
    });
  }, [venues, filters]);

  // Pagination
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
          Showing <span className="font-semibold text-slate-900">{filteredVenues.length}</span> venue
          {filteredVenues.length !== 1 && 's'}
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[24px] mb-12">
        {currentVenues.map((venue) => (
          <VenueCard key={venue.id} venue={venue} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {/* Previous Button */}
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={20} className="text-slate-600" />
          </button>

          {/* Page Numbers */}
          <div className="flex items-center gap-2">
            {[...Array(totalPages)].map((_, index) => {
              const pageNumber = index + 1;
              
              // Show first page, last page, current page, and pages around current
              const showPage =
                pageNumber === 1 ||
                pageNumber === totalPages ||
                (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1);

              // Show ellipsis
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
                      : 'border border-[#E5E7EB]  text-slate-700 hover:bg-[#943a38]'
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}
          </div>

          {/* Next Button */}
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={20} className="text-slate-600" />
          </button>
        </div>
      )}

      {/* No Results */}
      {filteredVenues.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">No venues found</h3>
          <p className="text-slate-600">Try adjusting your filters to see more results</p>
        </div>
      )}
    </div>
  );
}