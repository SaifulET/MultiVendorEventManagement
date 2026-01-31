'use client';

import { useState } from 'react';
import { MapPin, Calendar, Users, Star, Wifi, Car, UtensilsCrossed, Music, Wind, Accessibility, LucideIcon } from 'lucide-react';
import { Filters } from './type';
import MapModal from './MapModal';

interface FilterSidebarProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
}

// Simple geocoding function - in production, use a proper geocoding API
const geocodeLocation = async (location: string): Promise<{ lat: number; lng: number } | null> => {
  // Default NYC coordinates
  const defaultCoords = { lat: 40.7489, lng: -73.9680 };
  
  if (!location.trim()) return defaultCoords;
  
  // Simple mapping for demo - in production, use Nominatim or Google Geocoding API
  const locationMap: Record<string, { lat: number; lng: number }> = {
    'manhattan': { lat: 40.7831, lng: -73.9712 },
    'brooklyn': { lat: 40.6782, lng: -73.9442 },
    'queens': { lat: 40.7282, lng: -73.7949 },
    'downtown': { lat: 40.7589, lng: -73.9851 },
    'midtown': { lat: 40.7549, lng: -73.9840 },
    'new york': defaultCoords,
    'nyc': defaultCoords,
  };
  
  const lowerLocation = location.toLowerCase();
  
  // Check if it's in our map
  for (const [key, coords] of Object.entries(locationMap)) {
    if (lowerLocation.includes(key)) {
      return coords;
    }
  }
  
  // Try to parse as coordinates (e.g., "40.7589, -73.9851")
  const coordMatch = location.match(/(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
  if (coordMatch) {
    return {
      lat: parseFloat(coordMatch[1]),
      lng: parseFloat(coordMatch[2])
    };
  }
  
  return defaultCoords;
};

interface AmenityOption {
  value: string;
  icon: LucideIcon;
  label: string;
}

export default function FilterSidebar({ filters, onFilterChange }: FilterSidebarProps) {
  const [showFullMap, setShowFullMap] = useState<boolean>(false);
  const [mapPosition, setMapPosition] = useState<{ lat: number; lng: number }>({ lat: 40.7489, lng: -73.9680 });

  const updateFilter = <K extends keyof Filters>(key: K, value: Filters[K]): void => {
    onFilterChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (key: 'categories' | 'ratings' | 'amenities', value: string): void => {
    const current = filters[key] as string[];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onFilterChange({ ...filters, [key]: updated });
  };

  const handleLocationSelect = (lat: number, lng: number): void => {
    setMapPosition({ lat, lng });
    // Update the location filter with coordinates
    updateFilter('location', `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    console.log('Location selected:', { lat, lng });
  };

  const handleShowOnMap = async (): Promise<void> => {
    // Geocode the location input before showing map
    const coords = await geocodeLocation(filters.location);
    if (coords) {
      setMapPosition(coords);
    }
    setShowFullMap(true);
  };

  const amenitiesOptions: AmenityOption[] = [
    { value: 'wifi', icon: Wifi, label: 'WiFi' },
    { value: 'parking', icon: Car, label: 'Parking' },
    { value: 'catering', icon: UtensilsCrossed, label: 'Catering' },
    { value: 'audiovisual', icon: Music, label: 'Audio/Visual' },
    { value: 'ac', icon: Wind, label: 'Air Conditioning' },
    { value: 'accessible', icon: Accessibility, label: 'Accessible' }
  ];

  return (
    <>
      <div className="bg-white rounded-2xl border border-[#E5E7EB]  overflow-hidden ">
        {/* Map Preview Section - Always Visible */}
        <div className="relative">
          <div className="relative px-[24px] pt-[24px]  h-[103px] ">
            <iframe
              src="https://www.openstreetmap.org/export/embed.html?bbox=-74.0060,40.7128,-73.9352,40.7589&layer=mapnik&marker=40.7489,-73.9680"
              className="w-full h-full pointer-events-none rounded-lg"
              style={{ border: 0 }}
              title="Map preview"
            />
            {/* Show On Map Button Overlay */}
            <button
              onClick={handleShowOnMap}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#B74140] hover:bg-[#a33b39] text-white px-4 py-2 rounded-full font-medium text-sm border border-[#E5E7EB]  transition-colors flex items-center w-[145px] h-[27px]"
            >
              <MapPin size={16} />
              Show On Map
            </button>
          </div>
        </div>

        {/* Filters Section */}
        <div className="p-6 space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Filters</h2>

          {/* Location */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <MapPin size={18} className="text-slate-500" />
              Location
            </label>
            <input
              type="text"
              placeholder="Enter city or zip code"
              value={filters.location}
              onChange={(e) => updateFilter('location', e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all text-sm"
            />
          </div>

          {/* Distance */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700 flex items-center justify-between">
              <span>Distance</span>
              <span className="text-slate-500 font-normal">{filters.distance}M</span>
            </label>
            <input
              type="range"
              min="100"
              max="1000"
              step="50"
              value={filters.distance}
              onChange={(e) => updateFilter('distance', parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Date */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Calendar size={18} className="text-slate-500" />
              Date
            </label>
            <input
              type="text"
              placeholder="mm/dd/yyyy"
              value={filters.date}
              onChange={(e) => updateFilter('date', e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all text-sm"
            />
          </div>

          {/* Capacity */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Users size={18} className="text-slate-500" />
              Capacity
            </label>
            <input
              type="number"
              placeholder="Number of guests"
              value={filters.capacity || ''}
              onChange={(e) => updateFilter('capacity', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all text-sm"
            />
          </div>

          {/* Category */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700">Category</label>
            <div className="space-y-2">
              {['Wedding Halls', 'Conference Centers', 'Outdoor Spaces', 'Restaurants'].map((category) => (
                <label key={category} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(category)}
                    onChange={() => toggleArrayFilter('categories', category)}
                    className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                  />
                  <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">
                    {category}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700">Rating</label>
            <div className="space-y-2">
              {['5.0', '4.0+', '3.0+'].map((rating) => (
                <label key={rating} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.ratings.includes(rating)}
                    onChange={() => toggleArrayFilter('ratings', rating)}
                    className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                  />
                  <div className="flex items-center gap-1.5">
                    {[...Array(rating === '5.0' ? 5 : parseInt(rating))].map((_, i) => (
                      <Star key={i} size={14} fill="#FCD34D" className="text-yellow-400" />
                    ))}
                    <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors ml-1">
                      {rating === '5.0' ? '(5.0)' : `(${rating})`}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Amenities */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700">Amenities</label>
            <div className="space-y-2">
              {amenitiesOptions.map(({ value, icon: Icon, label }) => (
                <label key={value} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.amenities.includes(value)}
                    onChange={() => toggleArrayFilter('amenities', value)}
                    className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                  />
                  <Icon size={16} className="text-slate-500 group-hover:text-slate-700 transition-colors" />
                  <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Apply Button */}
          <button className="w-full bg-[#B74140] text-white py-3 rounded-lg font-semibold hover:bg-[#802423] transition-colors border border-[#E5E7EB] ">
            Apply Filters
          </button>
        </div>
      </div>

      {/* Map Modal */}
      <MapModal
        isOpen={showFullMap}
        onClose={() => setShowFullMap(false)}
        onLocationSelect={handleLocationSelect}
        initialPosition={mapPosition}
      />
    </>
  );
}