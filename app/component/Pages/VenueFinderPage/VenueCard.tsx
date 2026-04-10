'use client';

import { useRouter } from 'next/navigation';

import { formatPoundAmount } from '@/lib/currency';

import { Venue } from './type';

interface VenueCardProps {
  venue: Venue;
}

export default function VenueCard({ venue }: VenueCardProps) {
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
              <linearGradient id={`finder-half-${venue.id}-${index}`}>
                <stop offset="50%" stopColor="#FFC107" />
                <stop offset="50%" stopColor="#E0E0E0" />
              </linearGradient>
            </defs>
          ) : null}
          <path
            fill={isFilled ? '#FFC107' : isHalf ? `url(#finder-half-${venue.id}-${index})` : '#E0E0E0'}
            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
          />
        </svg>
      );
    });
  };

  return (
    <div className="group overflow-hidden rounded-lg border border-[#E5E7EB] bg-white transition-all duration-300 hover:-translate-y-1">
      <div className="relative h-48 overflow-hidden sm:h-56">
        {venue.image ? (
          <img
            src={venue.image}
            alt={venue.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-sm font-medium text-slate-500">
            No image available
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      <div className="p-4 sm:p-5">
        <h3 className="mb-2 line-clamp-1 text-lg font-bold text-gray-900 sm:text-xl">
          {venue.name}
        </h3>

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
          <span className="line-clamp-1 text-sm">{venue.location}</span>
        </div>

        <div className="mb-4 flex items-center">
          <div className="mr-2 flex">
            {renderStars(venue.rating)}
          </div>
          <span className="text-sm font-semibold text-gray-900">
            {venue.rating > 0 ? venue.rating.toFixed(1) : 'New'}
          </span>
          <span className="ml-1 text-sm text-gray-500">
            ({venue.reviews} review{venue.reviews === 1 ? '' : 's'})
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
          <div>
            <span className="text-xl font-bold text-gray-900 sm:text-2xl">
              {formatPoundAmount(venue.price, { suffix: '/Day' })}
            </span>
          </div>
          <button
            onClick={() => { router.push(`/pages/findVenues/${venue.id}`); }}
            className="rounded-md bg-[#B74140] px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-[#9a3534] sm:px-6"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}
