'use client';

import { 
  Star, 
  MapPin, 
} from 'lucide-react';
import { serviceProvider  } from './type';

interface serviceProviderCardProps {
  serviceProvider: serviceProvider;
}

// Define a more specific type for amenity keys






export default function serviceProviderCard({ serviceProvider }: serviceProviderCardProps) {
  const handleViewDetails = () => {
   
     
      window.location.href = `/pages/findServiceProvider/confirmed-booking-slug`;
  }
  const getButtonStyles = (): string => {
    switch (serviceProvider.status) {
      case 'available':
        return 'bg-[#F0FDF4]  text-[#3CCF91]';
      case 'booked':
        return 'bg-[#FEF2F2] text-[#FF5A5A] cursor-not-allowed';
      case 'unavailable':
        return 'bg-[#8B9592]  text-white cursor-not-allowed';
      default:
        return 'bg-gray-300 text-gray-500 cursor-not-allowed';
    }
  };


  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] transition-all duration-300 overflow-hidden group border border-slate-200 ">
      {/* Image */}
      <div className=" h-[191px] overflow-hidden">
        <img
          src={serviceProvider.image}
          alt={serviceProvider.name}
          className="w-full h-full fit group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Content */}
      <div className="p-[16px] pb-[20px] ">
        <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-[#B74140] transition-colors">
          {serviceProvider.name}
        </h3>
       
        <div className="flex items-center gap-2 text-slate-600 mb-4">
         
          <span className="text-sm truncate">{serviceProvider.categories}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600 mb-4">
          <MapPin size={16} className="text-slate-400 flex-shrink-0" />
          <span className="text-sm truncate">{serviceProvider.location}</span>
        </div>

      
 <div className="flex items-center gap-2 text-slate-600 mb-4">
  <span className="flex items-center gap-1">
    {Array.from({ length: Math.round(serviceProvider.rating) }).map((_, i) => (
      <Star
        key={i}
        size={16}
        className="text-yellow-400 fill-current"
      />
    ))}
    {
      Math.round(serviceProvider.rating) < 5 &&
      Array.from({ length: 5 - Math.round(serviceProvider.rating) }).map((_, i) => (
        <Star key={i} size={16} className="text-slate-300 " />
      ))
    }
  </span>

  <span className="text-sm truncate">{serviceProvider.rating}</span>
  <span className="text-sm truncate">
    ({serviceProvider.reviews} reviews)
  </span>
</div>

       

        {/* Price and Button */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 mb-[22px]">
          <div>
            <span className="text-2xl font-bold text-slate-900">${serviceProvider.price.toLocaleString()}</span>
            <span className="text-slate-500 text-sm ml-1">/hr</span>
          </div>
          <div>
            <span className={` font-inter font-medium text-[12px] leading-[1] tracking-normal text-center px-[12px] py-[4px] rounded-full ${getButtonStyles()}`}>{serviceProvider.status !== 'unavailable'?serviceProvider.status:'Not Available'}</span>
          
          </div>
          
         
        </div>
         <button
            onClick={handleViewDetails}
            className={`w-full px-6 py-[12px] rounded-lg font-semibold transition-all border border-[#E5E7EB] disabled:opacity-70 disabled:cursor-not-allowed bg-[#B74140] hover:bg-[#9d3534] text-white`}
          >
            View Details
          </button>
      </div>
    </div>
  );
}