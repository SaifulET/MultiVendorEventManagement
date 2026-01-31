'use client';

import React, { useState } from 'react';
import img from "@/public/pp1.svg"
import { useRouter } from 'next/navigation';

// Types
interface ServiceProvider {
  id: string;
  name: string;
  service: string;
  location: string;
  rating: number;
  reviewCount: number;
  pricePerHour: number;
  imageUrl: string;
  category: ServiceCategory;
}

type ServiceCategory =
  | 'Catering'
  | 'DJ & Music'
  | 'Decor'
  | 'Photography'
  | 'Entertainment';

interface ServiceCategoryItem {
  label: ServiceCategory;
  value: string;
}

// Sample venue data - replace with your actual data
const sampleServiceProviders: ServiceProvider[] = [
  {
    id: '1',
    name: 'Jenny Wilson',
    service: 'Catering',
    location: 'Manhattan, NY',
    rating: 4.9,
    reviewCount: 127,
    pricePerHour: 950,
    imageUrl: img.src,
    category: 'Catering',
  },
  {
    id: '2',
    name: 'Devon Lane',
    service: 'DJ & Music',
    location: 'Manhattan, NY',
    rating: 4.9,
    reviewCount: 102,
    pricePerHour: 520,
    imageUrl: img.src,
    category: 'DJ & Music',
  },
  {
    id: '3',
    name: 'Eleanor Pena',
    service: 'Decor',
    location: 'Manhattan, NY',
    rating: 4.9,
    reviewCount: 114,
    pricePerHour: 650,
    imageUrl: img.src,
    category: 'Decor',
  },
  {
    id: '4',
    name: 'Robert Fox',
    service: 'Photography',
    location: 'Brooklyn, NY',
    rating: 4.8,
    reviewCount: 89,
    pricePerHour: 700,
    imageUrl: img.src,
    category: 'Photography',
  },
  {
    id: '5',
    name: 'Leslie Alexander',
    service: 'Catering',
    location: 'Queens, NY',
    rating: 4.7,
    reviewCount: 76,
    pricePerHour: 600,
    imageUrl: img.src,
    category: 'Catering',
  },
   {
    id: '2',
    name: 'Albert Flores',
    service: 'Catering',
    location: 'Manhattan, NY',
    rating: 4.9,
    reviewCount: 127,
    pricePerHour: 950,
    imageUrl: img.src,
    category: 'Catering',
  },
   {
    id: '3',
    name: 'Floyd Miles',
    service: 'Catering',
    location: 'Manhattan, NY',
    rating: 4.9,
    reviewCount: 127,
    pricePerHour: 950,
    imageUrl: img.src,
    category: 'Catering',
  },
];


const categories = [
  { label: 'Catering', value: 'catering' },
  { label: 'Photography', value: 'photography' },
  { label: 'Entertainment', value: 'entertainment' },
  { label: 'Decorations', value: 'decor' },
];


// VenueCard Component
const VenueCard: React.FC<{ venue: ServiceProvider }> = ({ venue }) => {
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
          {isHalf && (
            <defs>
              <linearGradient id={`half-${index}`}>
                <stop offset="50%" stopColor="#FFC107" />
                <stop offset="50%" stopColor="#E0E0E0" />
              </linearGradient>
            </defs>
          )}
          <path
            fill={isFilled ? '#FFC107' : isHalf ? `url(#half-${index})` : '#E0E0E0'}
            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
          />
        </svg>
      );
    });
  };
const router = useRouter();
  return (
    <div className="bg-white rounded-lg overflow-hidden border border-[#E5E7EB]  transition-all duration-300 transform hover:-translate-y-1 group">
      {/* Image Container */}
      <div className="relative h-48 sm:h-56 overflow-hidden">
        <img
          src={venue.imageUrl}
          alt={venue.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content Container */}
      <div className="p-4 sm:p-5">
        {/* Venue Name */}
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 line-clamp-1">
          {venue.name}
        </h3>

        {/* Location */}
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
          <span className="text-sm line-clamp-1">{venue.location}</span>
        </div>

        {/* Rating */}
        <div className="flex items-center mb-4">
          <div className="flex mr-2">
            {renderStars(venue.rating)}
          </div>
          <span className="text-sm font-semibold text-gray-900">
            {venue.rating.toFixed(1)}
          </span>
          <span className="text-sm text-gray-500 ml-1">
            ({venue.reviewCount} reviews)
          </span>
        </div>

        {/* Price and CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            <span className="text-xl sm:text-2xl font-bold text-gray-900">
              ${venue.pricePerHour.toLocaleString()}
            </span>
            <span className="text-sm text-gray-500">/day</span>
          </div>
          <button onClick={()=>{router.push("/pages/findEventPlanners/details")}} className="bg-[#B74140] hover:bg-[#9a3534] text-white px-4 sm:px-6 py-2 rounded-md text-sm font-medium transition-colors duration-200 border border-[#E5E7EB]">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Component
export default function TrustedEventPlannerPage() {
  // Set initial selected category to 'Wedding Halls' instead of 'All'
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory>('Catering');
  const [visibleCount, setVisibleCount] = useState(3);

  const filteredVenues = sampleServiceProviders.filter((venue) => venue.category === selectedCategory);

  const displayedVenues = filteredVenues.slice(0, visibleCount);
  const hasMore = visibleCount < filteredVenues.length;

const router = useRouter();

  const handleShowMore = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    router.push('/pages/findEventPlanners');
  };

  return (
    <div className=" bg-[#FAFAFA] px-[32px] py-[32px] lg:px-[64px] lg:py-[80px]">
      <div className="">
        {/* Header */}
        <h2 className="text-center font-inter font-bold text-[36px] leading-[40px] tracking-normal text-gray-900 mb-8">
          Trusted Event planner for Every Event
        </h2>

        

        {/* Venue Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-[48px]">
          {displayedVenues.map((venue) => (
            <VenueCard key={venue.id} venue={venue} />
          ))}
        </div>

        {/* Show More Button */}
        {hasMore && (
          <div className="flex justify-center">
            <button
              onClick={handleShowMore}
              className="bg-[#B74140] hover:bg-[#9a3534] text-white px-12 py-3 rounded-lg text-lg font-semibold transition-all duration-200 border border-[#E5E7EB] transform hover:-translate-y-0.5"
            >
              Show More
            </button>
          </div>
        )}

        {/* No Results Message */}
        {displayedVenues.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              No venues found in this category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}