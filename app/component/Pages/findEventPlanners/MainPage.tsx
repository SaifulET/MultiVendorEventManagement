'use client';

import { useState } from 'react';

import { Filter } from 'lucide-react';
import { Filters, serviceProvider } from "./type"
import FilterSidebar from './FilterSideBar';
import FilterModal from './FilterModal';
import ServiceProviderGrid from './ServiceProviderGrid';
import img from "@/public/serviceProvider.svg"
// Mock venue data
const mockVenues: serviceProvider[] = [
  {
    id: '1',
    name: 'Grand Ballroom Plaza',
    location: 'Downtown, New York',
    rating: 4.9,
    reviews: 127,
   
    price: 850,
    image: img,
   
    status: 'available',
    categories: 'Catering',
  },
  {
    id: '2',
    name: 'Skyline Rooftop',
    location: 'Midtown, New York',
    rating: 4.8,
    reviews: 98,
    
    price: 650,
    image: img,
    
    status: 'available',
    categories: 'Photography',
  },
  {
    id: '3',
    name: 'Urban Loft Studio',
    location: 'Brooklyn, New York',
    rating: 4.7,
    reviews: 64,
   
    price: 425,
    image: img,
    
    status: 'booked',
    categories: 'Music',
  },
  {
    id: '4',
    name: 'Garden Pavilion',
    location: 'Queens, New York',
    rating: 5.0,
    reviews: 142,
   
    price: 720,
    image: img,
   
    status: 'available',
    categories: 'Decoration',
  },
  {
    id: '5',
    name: 'Executive Conference',
    location: 'Manhattan, New York',
    rating: 4.6,
    reviews: 83,
   
    price: 550,
    image: img,
   
    status: 'unavailable',
    categories: 'Security',
  },
  {
    id: '6',
    name: 'Modern Art Gallery',
    location: 'Chelsea, New York',
    rating: 4.9,
    reviews: 91,
   
    price: 120,
    image: img,
   
    status: 'unavailable',
    categories: 'Entertainment',
  },
  {
    id: '7',
    name: 'Riverside Terrace',
    location: 'Upper West Side, New York',
    rating: 4.8,
    reviews: 156,
  
    price: 780,
    image: img,
   
    status: 'available',
    categories: 'Lighting',
  },
  {
    id: '8',
    name: 'Industrial Warehouse',
    location: 'Williamsburg, Brooklyn',
    rating: 3.4,
    reviews: 78,
   
    price: 890,
    image: img,

    status: 'available',
    categories: 'Audio-Visual',
  },
  {
    id: '9',
    name: 'Luxury Hotel Ballroom',
    location: 'Midtown, New York',
    rating: 5.0,
    reviews: 203,
 
    price: 1200,
    image: img,
  
    status: 'available',
    categories: 'Transportation',
  },
  {
    id: '10',
    name: 'Luxury Hotel Ballroom',
    location: 'Midtown, New York',
    rating: 5.0,
    reviews: 203,
   
    price: 1200,
    image:img,
    
    status: 'available',
    categories: 'Accommodation',
  }
];

export default function ProviderFinderPage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    location: '',
    distance: 500,
    date: '',
    categories: [],
    ratings: [],
   
  });

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  return (
    <div className="">
      {/* Header */}
      <header className="bg-white border-b border-[#E5E7EB]  z-40 ">
        <div className=" px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="text-center m-auto">
              <h1 className="font-inter font-semibold md:text-[30px] md:leading-[36px] tracking-normal">
                Find Your Perfect Event Planner
              </h1>
             
            </div>
            
            {/* Mobile Filter Button */}
            <button
              onClick={() => setIsFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-[#B74140] text-white rounded-lg hover:bg-[#9b3534] transition-colors border border-[#E5E7EB]"
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
            <ServiceProviderGrid   serviceProvider={mockVenues} filters={filters} />
          </main>
        </div>
      </div>
    </div>
  );
}