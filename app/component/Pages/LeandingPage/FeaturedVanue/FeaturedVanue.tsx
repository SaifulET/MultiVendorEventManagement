'use client';

import React, { useState } from 'react';
import img from "@/public/img.svg"
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Types
interface Venue {
  id: string;
  name: string;
  location: string;
  rating: number;
  reviewCount: number;
  pricePerDay: number;
  imageUrl: string;
  category: VenueCategory;
}

type VenueCategory = 'Wedding Halls' | 'Conference Centers' | 'Outdoor Spaces' | 'Restaurants' | 'Banquet Halls' | 'Hotels' | 'Resorts' | 'Community Centers';

interface VenueCategoryItem {
  label: VenueCategory;
  value: string;
}

// Sample venue data - replace with your actual data
const sampleVenues: Venue[] = [
  {
    id: '1',
    name: 'Grand Ballroom Palace',
    location: 'Midtown, New York',
    rating: 4.9,
    reviewCount: 127,
    pricePerDay: 2500,
    imageUrl: img.src,
    category: 'Wedding Halls',
  },
  {
    id: '2',
    name: 'Tech Hub Conference Center',
    location: 'Manhattan, New York',
    rating: 4.7,
    reviewCount: 89,
    pricePerDay: 1200,
    imageUrl:img.src,
    category: 'Conference Centers',
  },
  {
    id: '3',
    name: 'Garden Oasis',
    location: 'Queens, New York',
    rating: 5.0,
    reviewCount: 45,
    pricePerDay: 800,
    imageUrl: img.src,
    category: 'Outdoor Spaces',
  },
  {
    id: '4',
    name: 'Elegant Restaurant Hall',
    location: 'Brooklyn, New York',
    rating: 4.8,
    reviewCount: 156,
    pricePerDay: 1500,
    imageUrl: img.src,
    category: 'Restaurants',
  },
  {
    id: '5',
    name: 'Royal Wedding Manor',
    location: 'Upper East Side, New York',
    rating: 4.9,
    reviewCount: 203,
    pricePerDay: 3500,
    imageUrl: img.src,
    category: 'Wedding Halls',
  },
  {
    id: '6',
    name: 'Modern Conference Suite',
    location: 'Midtown, New York',
    rating: 4.6,
    reviewCount: 67,
    pricePerDay: 900,
    imageUrl: img.src,
    category: 'Conference Centers',
  },
  {
    id: '7',
    name: 'Luxury Banquet Hall',
    location: 'Downtown, New York',
    rating: 4.8,
    reviewCount: 142,
    pricePerDay: 2200,
    imageUrl: img.src,
    category: 'Banquet Halls',
  },
  {
    id: '8',
    name: 'Riverside Resort',
    location: 'Upstate, New York',
    rating: 4.7,
    reviewCount: 98,
    pricePerDay: 3000,
    imageUrl: img.src,
    category: 'Resorts',
  },
  {
    id: '9',
    name: 'Grand Plaza Hotel',
    location: 'Manhattan, New York',
    rating: 4.9,
    reviewCount: 215,
    pricePerDay: 2800,
    imageUrl: img.src,
    category: 'Hotels',
  },
  {
    id: '10',
    name: 'Central Community Center',
    location: 'Brooklyn, New York',
    rating: 4.5,
    reviewCount: 73,
    pricePerDay: 600,
    imageUrl: img.src,
    category: 'Community Centers',
  },
   {
    id: '11',
    name: 'Grand Ballroom Palace',
    location: 'Midtown, New York',
    rating: 4.9,
    reviewCount: 127,
    pricePerDay: 2500,
    imageUrl: img.src,
    category: 'Wedding Halls',
  },
   {
    id: '12',
    name: 'Grand Ballroom Palace',
    location: 'Midtown, New York',
    rating: 4.9,
    reviewCount: 127,
    pricePerDay: 2500,
    imageUrl: img.src,
    category: 'Wedding Halls',
  },
];

const categories: VenueCategoryItem[] = [
  { label: 'Wedding Halls', value: 'wedding-halls' },
  { label: 'Conference Centers', value: 'conference-centers' },
  { label: 'Outdoor Spaces', value: 'outdoor-spaces' },
  { label: 'Restaurants', value: 'restaurants' },
  { label: 'Banquet Halls', value: 'banquet-halls' },
  { label: 'Hotels', value: 'hotels' },
  { label: 'Resorts', value: 'resorts' },
  { label: 'Community Centers', value: 'community-centers' },
];

// VenueCard Component
const VenueCard: React.FC<{ venue: Venue }> = ({ venue }) => {
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
    <div className="bg-white rounded-lg overflow-hidden border border-[#E5E7EB] transition-all duration-300 transform hover:-translate-y-1 group">
      {/* Image Container */}
      <div className="relative h-48 sm:h-56 overflow-hidden">
        <Image
  src={venue.imageUrl}
  alt={venue.name}
  fill
  className="object-cover transition-transform duration-500 group-hover:scale-110"
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
              ${venue.pricePerDay.toLocaleString()}
            </span>
            <span className="text-sm text-gray-500">/day</span>
          </div>
          <button onClick={()=>{router.push("/pages/findVenues/details")}} className="bg-[#B74140] hover:bg-[#9a3534] text-white px-4 sm:px-6 py-2 rounded-md text-sm font-medium transition-colors duration-200 shadow-md hover:shadow-lg">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Component
export default function FeaturedVenuesPage() {
  // Set initial selected category to 'Wedding Halls' instead of 'All'
  const [selectedCategory, setSelectedCategory] = useState<VenueCategory>('Wedding Halls');
  const [visibleCount, setVisibleCount] = useState(3);

  const filteredVenues = sampleVenues.filter((venue) => venue.category === selectedCategory);

  const displayedVenues = filteredVenues.slice(0, visibleCount);
  const hasMore = visibleCount < filteredVenues.length;

  const handleCategoryClick = (category: VenueCategory) => {
    setSelectedCategory(category);
    setVisibleCount(3); // Reset visible count when changing category
  };
  const router = useRouter();
  const handleShowMore = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    router.push('/pages/findVenues');
   
  };

  return (
    <div className=" bg-[#FAFAFA] px-[32px] py-[32px] lg:px-[64px] lg:py-[80px]">
      <div className="">
        {/* Header */}
        <h2 className="font-inter font-semibold text-[36px] leading-[40px] tracking-normal text-center text-gray-900 mb-8">
          Featured Venues
        </h2>

        {/* Category Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-[34px]">
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => handleCategoryClick(category.label)}
              className={`px-4 sm:px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 border-2 border-dashed border-red-700
             ${
                selectedCategory === category.label
                  ? 'bg-[#B74140] text-white border border-[#E5E7EB] scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-[#E5E7EB]'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

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