'use client';

import { useEffect } from 'react';

import { Calendar, MapPin, Star, X } from 'lucide-react';

import { Filters } from './type';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  availableCategories: string[];
}

export default function FilterModal({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  availableCategories,
}: FilterModalProps) {
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

  const toggleArrayFilter = (key: 'categories' | 'ratings', value: string) => {
    const current = filters[key];
    const updated = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];

    updateFilter(key, updated);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
        onClick={onClose}
      />

      <div className="fixed inset-x-0 bottom-0 z-50 animate-slide-up lg:hidden">
        <div className="h-[100vh] overflow-y-auto border border-[#E5E7EB] bg-white">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
            <h2 className="text-xl font-bold text-slate-900">Filters</h2>
            <button
              onClick={onClose}
              className="rounded-lg p-2 transition-colors hover:bg-slate-100"
            >
              <X size={24} className="text-slate-600" />
            </button>
          </div>

          <div className="space-y-6 p-6 pb-24">
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <MapPin size={18} className="text-slate-500" />
                Location
              </label>
              <input
                type="text"
                placeholder="Enter city or area"
                value={filters.location}
                onChange={(event) => updateFilter('location', event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between text-sm font-semibold text-slate-700">
                <span>Distance</span>
                <span className="font-normal text-slate-500">{filters.distance}M</span>
              </label>
              <input
                type="range"
                min="100"
                max="1000"
                step="50"
                value={filters.distance}
                onChange={(event) => updateFilter('distance', parseInt(event.target.value, 10))}
                className="slider h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200"
              />
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Calendar size={18} className="text-slate-500" />
                Date
              </label>
              <input
                type="text"
                placeholder="mm/dd/yyyy"
                value={filters.date}
                onChange={(event) => updateFilter('date', event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-slate-900"
              />
            </div>

            {availableCategories.length ? (
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700">Category</label>
                <div className="space-y-3">
                  {availableCategories.map((category) => (
                    <label key={category} className="group flex cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        checked={filters.categories.includes(category)}
                        onChange={() => toggleArrayFilter('categories', category)}
                        className="h-5 w-5 cursor-pointer rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                      />
                      <span className="text-base text-slate-700 transition-colors group-hover:text-slate-900">
                        {category}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700">Rating</label>
              <div className="space-y-3">
                {['5.0', '4.0+', '3.0+'].map((rating) => (
                  <label key={rating} className="group flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={filters.ratings.includes(rating)}
                      onChange={() => toggleArrayFilter('ratings', rating)}
                      className="h-5 w-5 cursor-pointer rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                    />
                    <div className="flex items-center gap-2">
                      {Array.from({ length: rating === '5.0' ? 5 : parseInt(rating, 10) }).map((_, index) => (
                        <Star key={index} size={16} fill="#FCD34D" className="text-yellow-400" />
                      ))}
                      <span className="ml-1 text-base text-slate-700 transition-colors group-hover:text-slate-900">
                        {rating === '5.0' ? '(5.0)' : `(${rating})`}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 flex gap-3 border-t border-slate-200 bg-white px-6 py-4">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border-2 border-slate-300 px-6 py-3 font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border border-[#E5E7EB] bg-[#B74140] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#862f2e]"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
