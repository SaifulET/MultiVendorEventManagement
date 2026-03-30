'use client';

import { MapPin, Calendar, Star } from 'lucide-react';
import { Filters } from './type';

interface FilterSidebarProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  availableCategories: string[];
}

export default function FilterSidebar({ filters, onFilterChange, availableCategories }: FilterSidebarProps) {
  const updateFilter = <K extends keyof Filters>(key: K, value: Filters[K]): void => {
    onFilterChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (key: 'categories' | 'ratings', value: string): void => {
    const current = filters[key] as string[];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onFilterChange({ ...filters, [key]: updated });
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden ">
      

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

        

          {/* Category */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700">Category</label>
            <div className="space-y-2">
              {availableCategories.map((category) => (
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


          {/* Apply Button */}
          <button className="w-full bg-[#B74140] text-white py-3 rounded-lg font-semibold hover:bg-[#802423] transition-colors shadow-md">
            Apply Filters
          </button>
        </div>
      </div>

     
    </>
  );
}
