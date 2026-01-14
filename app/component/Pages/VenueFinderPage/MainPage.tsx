'use client';

import { useState } from 'react';

import { Filter } from 'lucide-react';
import { Filters, Venue } from "./type"
import FilterSidebar from './FilterSideBar';
import FilterModal from './FilterModal';
import VenueGrid from './VenueGrid';

// Mock venue data
const mockVenues: Venue[] = [
  {
    id: '1',
    name: 'Grand Ballroom Plaza',
    location: 'Downtown, New York',
    rating: 4.9,
    reviews: 127,
    capacity: 500,
    price: 850,
    image: '',
    amenities: ['wifi', 'parking', 'catering', 'ac'],
    status: 'available',
    latitude: 40.7589,
    longitude: -73.9851
  },
  {
    id: '2',
    name: 'Skyline Rooftop',
    location: 'Midtown, New York',
    rating: 4.8,
    reviews: 98,
    capacity: 200,
    price: 650,
    image: '',
    amenities: ['wifi', 'audiovisual', 'ac'],
    status: 'available',
    latitude: 40.7549,
    longitude: -73.9840
  },
  {
    id: '3',
    name: 'Urban Loft Studio',
    location: 'Brooklyn, New York',
    rating: 4.7,
    reviews: 64,
    capacity: 150,
    price: 425,
    image: '',
    amenities: ['wifi', 'parking'],
    status: 'booked',
    latitude: 40.6782,
    longitude: -73.9442
  },
  {
    id: '4',
    name: 'Garden Pavilion',
    location: 'Queens, New York',
    rating: 5.0,
    reviews: 142,
    capacity: 300,
    price: 720,
    image: '',
    amenities: ['wifi', 'parking', 'catering'],
    status: 'available',
    latitude: 40.7282,
    longitude: -73.7949
  },
  {
    id: '5',
    name: 'Executive Conference',
    location: 'Manhattan, New York',
    rating: 4.6,
    reviews: 83,
    capacity: 100,
    price: 550,
    image: '',
    amenities: ['wifi', 'audiovisual', 'ac'],
    status: 'unavailable',
    latitude: 40.7580,
    longitude: -73.9855
  },
  {
    id: '6',
    name: 'Modern Art Gallery',
    location: 'Chelsea, New York',
    rating: 4.9,
    reviews: 91,
    capacity: 180,
    price: 120,
    image: '',
    amenities: ['wifi', 'ac', 'accessible'],
    status: 'unavailable',
    latitude: 40.7465,
    longitude: -74.0014
  },
  {
    id: '7',
    name: 'Riverside Terrace',
    location: 'Upper West Side, New York',
    rating: 4.8,
    reviews: 156,
    capacity: 250,
    price: 780,
    image: '',
    amenities: ['wifi', 'parking', 'catering', 'ac'],
    status: 'available',
    latitude: 40.7870,
    longitude: -73.9754
  },
  {
    id: '8',
    name: 'Industrial Warehouse',
    location: 'Williamsburg, Brooklyn',
    rating: 4.7,
    reviews: 78,
    capacity: 400,
    price: 890,
    image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800',
    amenities: ['wifi', 'parking', 'audiovisual'],
    status: 'available',
    latitude: 40.7081,
    longitude: -73.9571
  },
  {
    id: '9',
    name: 'Luxury Hotel Ballroom',
    location: 'Midtown, New York',
    rating: 5.0,
    reviews: 203,
    capacity: 600,
    price: 1200,
    image: 'https://images.unsplash.com/photo-1519167758481-83f29da8a1c0?w=800',
    amenities: ['wifi', 'parking', 'catering', 'ac', 'accessible'],
    status: 'available',
    latitude: 40.7614,
    longitude: -73.9776
  },
  {
    id: '10',
    name: 'Luxury Hotel Ballroom',
    location: 'Midtown, New York',
    rating: 5.0,
    reviews: 203,
    capacity: 600,
    price: 1200,
    image: 'https://images.unsplash.com/photo-1519167758481-83f29da8a1c0?w=800',
    amenities: ['wifi', 'parking', 'catering', 'ac', 'accessible'],
    status: 'available',
    latitude: 40.7614,
    longitude: -73.9776
  }
];

export default function VenueFinderPage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    location: '',
    distance: 500,
    date: '',
    capacity: undefined,
    categories: [],
    ratings: [],
    amenities: []
  });

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  return (
    <div className="">
      {/* Header */}
      <header className="bg-white  border-b border-[#E5E7EB]  sticky top-0 z-40 ">
        <div className=" px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="text-center m-auto">
              <h1 className="font-inter font-semibold md:text-[30px] md:leading-[36px] tracking-normal">
                Find Your Perfect Venue
              </h1>
              <p className="text-slate-600 mt-1 text-sm sm:text-base">
                Browse through 1,247 venues available for your next event
              </p>
            </div>
            
            {/* Mobile Filter Button */}
            <button
              onClick={() => setIsFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-[#B74140] text-white rounded-lg hover:bg-[#9b3534] transition-colors border border-[#E5E7EB] "
            >
              <Filter size={20} />
              <span className="font-medium">Filters</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className=" px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-[24px]">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-32">
              <FilterSidebar
                filters={filters}
                onFilterChange={handleFilterChange}
              />
            </div>
          </aside>

          {/* Mobile Filter Modal */}
          <FilterModal
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
            filters={filters}
            onFilterChange={handleFilterChange}
          />

          {/* Venue Grid */}
          <main className="flex-1 min-w-0">
            <VenueGrid venues={mockVenues} filters={filters} />
          </main>
        </div>
      </div>
    </div>
  );
}