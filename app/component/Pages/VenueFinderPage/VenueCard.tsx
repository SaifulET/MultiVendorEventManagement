'use client';

import { 
  Star, 
  Users, 
  MapPin, 
  Music, 
  Wifi, 
  Car, 
  UtensilsCrossed, 
  Wind, 
  Accessibility,
  type LucideIcon 
} from 'lucide-react';
import { Venue } from './type';

interface VenueCardProps {
  venue: Venue;
}

// Define a more specific type for amenity keys
type AmenityKey = 'wifi' | 'parking' | 'catering' | 'audiovisual' | 'ac' | 'accessible';

const amenityIcons: Record<AmenityKey, LucideIcon> = {
  wifi: Wifi,
  parking: Car,
  catering: UtensilsCrossed,
  audiovisual: Music,
  ac: Wind,
  accessible: Accessibility
};

// Type guard to check if a string is a valid AmenityKey
const isAmenityKey = (key: string): key is AmenityKey => {
  return key in amenityIcons;
};

export default function VenueCard({ venue }: VenueCardProps) {
  const handleViewDetails = () => {
    if(getButtonText() === 'View Details') {
     
      window.location.href = `/pages/findVenues/details`;
    }
  }

  const getButtonStyle = (): string => {
    switch (venue.status) {
      case 'available':
        return 'bg-[#B74140] hover:bg-[#9d3534] text-white';
      case 'booked':
        return 'bg-[#F87171] hover:bg-[#ef5a5a] text-white cursor-not-allowed';
      case 'unavailable':
        return 'bg-[#8B9592] hover:bg-[#737f7c] text-white cursor-not-allowed';
      default:
        return 'bg-gray-300 text-gray-500 cursor-not-allowed';
    }
  };

  const getButtonText = (): string => {
    switch (venue.status) {
      case 'available':
        return 'View Details';
      case 'booked':
        return 'Already Booked';
      case 'unavailable':
        return 'Not Available';
      default:
        return 'Unknown Status';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB]  hover:shadow-xl transition-all duration-300 overflow-hidden group border border-slate-200">
      {/* Image */}
      <div className=" h-[191px] overflow-hidden">
        <img
          src={venue.image}
          alt={venue.name}
          className="w-full h-full fit group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Content */}
      <div className="p-[16px]">
        <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-[#B74140] transition-colors">
          {venue.name}
        </h3>
        
        <div className="flex items-center gap-2 text-slate-600 mb-4">
          <MapPin size={16} className="text-slate-400 flex-shrink-0" />
          <span className="text-sm truncate">{venue.location}</span>
        </div>

        <div className="flex items-center gap-2 text-slate-600 mb-4">
          <Users size={16} className="text-slate-400 flex-shrink-0" />
          <span className="text-sm">Up to {venue.capacity.toLocaleString()} people</span>
        </div>

        {/* Amenities */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          {venue.amenities.slice(0, 4).map((amenity) => {
            // Use type guard to ensure amenity is a valid key
            if (isAmenityKey(amenity)) {
              const Icon = amenityIcons[amenity];
              return (
                <div 
                  key={amenity} 
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                  title={amenity.charAt(0).toUpperCase() + amenity.slice(1)}
                >
                  <Icon size={18} />
                </div>
              );
            }
            return null;
          })}
        </div>

        {/* Price and Button */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <div>
            <span className="text-2xl font-bold text-slate-900">${venue.price.toLocaleString()}</span>
            <span className="text-slate-500 text-sm ml-1">/day</span>
          </div>
          
          <button
            disabled={venue.status !== 'available'}
            onClick={handleViewDetails}
            className={`px-6 py-2.5 rounded-lg font-semibold transition-all border border-[#E5E7EB]  disabled:opacity-70 disabled:cursor-not-allowed ${getButtonStyle()}`}
          >
            {getButtonText()}
          </button>
        </div>
      </div>
    </div>
  );
}