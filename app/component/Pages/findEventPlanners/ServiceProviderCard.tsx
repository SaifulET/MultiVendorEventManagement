'use client';

import { MapPin, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { serviceProvider } from './type';

interface serviceProviderCardProps {
  serviceProvider: serviceProvider;
}

export default function ServiceProviderCard({ serviceProvider }: serviceProviderCardProps) {
  const router = useRouter();

  const handleViewDetails = () => {
    router.push(`/pages/findEventPlanners/${serviceProvider.id}`);
  };

  const getButtonStyles = (): string => {
    switch (serviceProvider.status) {
      case 'available':
        return 'bg-[#F0FDF4] text-[#3CCF91]';
      case 'booked':
        return 'bg-[#FEF2F2] text-[#FF5A5A] cursor-not-allowed';
      case 'unavailable':
        return 'bg-[#8B9592] text-white cursor-not-allowed';
      default:
        return 'bg-gray-300 text-gray-500 cursor-not-allowed';
    }
  };

  return (
    <div className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-300">
      <div className="h-[191px] overflow-hidden">
        <img
          src={serviceProvider.image}
          alt={serviceProvider.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="p-[16px] pb-[20px]">
        <h3 className="mb-2 text-xl font-bold text-slate-900 transition-colors group-hover:text-[#B74140]">
          {serviceProvider.name}
        </h3>

        <div className="mb-4 flex items-center gap-2 text-slate-600">
          <span className="truncate text-sm">{serviceProvider.categories}</span>
        </div>

        <div className="mb-4 flex items-center gap-2 text-slate-600">
          <MapPin size={16} className="flex-shrink-0 text-slate-400" />
          <span className="truncate text-sm">{serviceProvider.location}</span>
        </div>

        <div className="mb-4 flex items-center gap-2 text-slate-600">
          <span className="flex items-center gap-1">
            {Array.from({ length: Math.round(serviceProvider.rating) }).map((_, index) => (
              <Star
                key={index}
                size={16}
                className="fill-current text-yellow-400"
              />
            ))}
            {Math.round(serviceProvider.rating) < 5 &&
              Array.from({ length: 5 - Math.round(serviceProvider.rating) }).map((_, index) => (
                <Star key={index} size={16} className="text-slate-300" />
              ))}
          </span>

          <span className="truncate text-sm">
            {serviceProvider.rating > 0 ? serviceProvider.rating.toFixed(1) : 'New'}
          </span>
          <span className="truncate text-sm">
            ({serviceProvider.reviews} reviews)
          </span>
        </div>

        <div className="mb-[22px] flex items-center justify-between border-t border-slate-200 pt-4">
          <div>
            {serviceProvider.price > 0 ? (
              <>
                <span className="text-2xl font-bold text-slate-900">
                  {serviceProvider.price.toLocaleString()}
                </span>
                <span className="ml-1 text-sm text-slate-500"> BDT/hr</span>
              </>
            ) : (
              <span className="text-base font-semibold text-slate-900">
                Custom pricing
              </span>
            )}
          </div>
          <div>
            <span className={`rounded-full px-[12px] py-[4px] text-center font-inter text-[12px] font-medium leading-[1] tracking-normal ${getButtonStyles()}`}>
              {serviceProvider.status !== 'unavailable' ? serviceProvider.status : 'Not Available'}
            </span>
          </div>
        </div>

        <button
          onClick={handleViewDetails}
          className="w-full rounded-lg border border-[#E5E7EB] bg-[#B74140] px-6 py-[12px] font-semibold text-white transition-all hover:bg-[#9d3534] disabled:cursor-not-allowed disabled:opacity-70"
        >
          View Details
        </button>
      </div>
    </div>
  );
}
