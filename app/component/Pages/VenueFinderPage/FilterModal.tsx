'use client';

import { X, MapPin, Calendar, Users, Star, Wifi, Car, UtensilsCrossed, Music, Wind, Accessibility } from 'lucide-react';
import { Filters } from './type';
import { useEffect, useState, ChangeEvent } from 'react';
import MapModal from './MapModal';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
}

// Simple geocoding function
const geocodeLocation = async (location: string): Promise<{ lat: number; lng: number } | null> => {
  const defaultCoords = { lat: 40.7489, lng: -73.9680 };
  
  if (!location.trim()) return defaultCoords;
  
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
  
  for (const [key, coords] of Object.entries(locationMap)) {
    if (lowerLocation.includes(key)) {
      return coords;
    }
  }
  
  const coordMatch = location.match(/(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
  if (coordMatch) {
    return {
      lat: parseFloat(coordMatch[1]),
      lng: parseFloat(coordMatch[2])
    };
  }
  
  return defaultCoords;
};

export default function FilterModal({ isOpen, onClose, filters, onFilterChange }: FilterModalProps) {
  const [showFullMap, setShowFullMap] = useState<boolean>(false);
  const [mapPosition, setMapPosition] = useState<{ lat: number; lng: number }>({ 
    lat: 40.7489, 
    lng: -73.9680 
  });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const updateFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (key: 'categories' | 'ratings' | 'amenities', value: string) => {
    const current = filters[key];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateFilter(key, updated);
  };

  const handleApply = () => {
    onClose();
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setMapPosition({ lat, lng });
    updateFilter('location', `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    console.log('Location selected:', { lat, lng });
  };

  const handleShowOnMap = async () => {
    const coords = await geocodeLocation(filters.location);
    if (coords) {
      setMapPosition(coords);
    }
    setShowFullMap(true);
  };

  // Event handler with proper typing
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement>, 
    key: keyof Filters, 
    type: 'number' | 'string' = 'string'
  ) => {
    const value = type === 'number' 
      ? (e.target.value ? parseInt(e.target.value) : undefined)
      : e.target.value;
    updateFilter(key, value as Filters[typeof key]);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 lg:hidden backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-x-0 bottom-0 z-50 lg:hidden animate-slide-up">
        <div className="bg-white  border border-[#E5E7EB]  h-[100vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-xl font-bold text-slate-900">Filters</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X size={24} className="text-slate-600" />
            </button>
          </div>

          {/* Map Preview Section */}
          <div className="relative border-b border-slate-200">
            <div className="relative h-32 bg-slate-100">
              <iframe
                src="https://www.openstreetmap.org/export/embed.html?bbox=-74.0060,40.7128,-73.9352,40.7589&layer=mapnik&marker=40.7489,-73.9680"
                className="w-full h-full pointer-events-none"
                style={{ border: 0 }}
                title="Map preview"
              />
              {/* Show On Map Button Overlay */}
              <button
                onClick={handleShowOnMap}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#B74140] hover:bg-[#8a3634] text-white px-4 py-2 rounded-full font-medium text-sm border border-[#E5E7EB]  transition-colors flex items-center gap-2"
              >
                <MapPin size={16} />
                Show On Map
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 pb-24">
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
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all"
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
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all"
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
                onChange={(e) => handleInputChange(e, 'capacity', 'number')}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* Category */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700">Category</label>
              <div className="space-y-3">
                {['Wedding Halls', 'Conference Centers', 'Outdoor Spaces', 'Restaurants'].map((category) => (
                  <label key={category} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={filters.categories.includes(category)}
                      onChange={() => toggleArrayFilter('categories', category)}
                      className="w-5 h-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                    />
                    <span className="text-base text-slate-700 group-hover:text-slate-900 transition-colors">
                      {category}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700">Rating</label>
              <div className="space-y-3">
                {['5.0', '4.0+', '3.0+'].map((rating) => (
                  <label key={rating} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={filters.ratings.includes(rating)}
                      onChange={() => toggleArrayFilter('ratings', rating)}
                      className="w-5 h-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                    />
                    <div className="flex items-center gap-2">
                      {[...Array(rating === '5.0' ? 5 : parseInt(rating))].map((_, i) => (
                        <Star key={i} size={16} fill="#FCD34D" className="text-yellow-400" />
                      ))}
                      <span className="text-base text-slate-700 group-hover:text-slate-900 transition-colors ml-1">
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
              <div className="space-y-3">
                {[
                  { value: 'wifi', icon: Wifi, label: 'WiFi' },
                  { value: 'parking', icon: Car, label: 'Parking' },
                  { value: 'catering', icon: UtensilsCrossed, label: 'Catering' },
                  { value: 'audiovisual', icon: Music, label: 'Audio/Visual' },
                  { value: 'ac', icon: Wind, label: 'Air Conditioning' },
                  { value: 'accessible', icon: Accessibility, label: 'Accessible' }
                ].map(({ value, icon: Icon, label }) => (
                  <label key={value} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={filters.amenities.includes(value)}
                      onChange={() => toggleArrayFilter('amenities', value)}
                      className="w-5 h-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                    />
                    <Icon size={18} className="text-slate-500 group-hover:text-slate-700 transition-colors" />
                    <span className="text-base text-slate-700 group-hover:text-slate-900 transition-colors">
                      {label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="flex-1 px-6 py-3 bg-[#B74140] text-white rounded-lg font-semibold hover:bg-[#862f2e] transition-colors border border-[#E5E7EB] "
            >
              Apply Filters
            </button>
          </div>
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