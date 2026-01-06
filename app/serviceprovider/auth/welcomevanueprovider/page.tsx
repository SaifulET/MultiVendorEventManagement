'use client'
import { useRouter } from 'next/navigation';
import React from 'react';

export default function AccountReady() {
  const router =useRouter()
  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center p-4 md:p-12 bg-gradient-to-br from-[#3A0101] via-[#8D1414] to-[#C94B4B]">
      <div className="w-full max-w-[672px] bg-white shadow-[0px_25px_50px_rgba(0,0,0,0.25)] rounded-2xl p-6 md:p-12 relative">
        {/* Success Icon */}
        <div className="w-20 h-20 md:w-24 md:h-24 bg-[#B74241] rounded-full flex items-center justify-center mx-auto mb-8 md:mb-12">
          <svg 
            className="w-8 h-8 md:w-10 md:h-10 text-white" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={3} 
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {/* Content Container */}
        <div className="flex flex-col gap-6 md:gap-10">
          {/* Header Section */}
          <div className="text-center space-y-4 md:space-y-6">
            <h1 className="text-2xl md:text-4xl font-bold text-[#111827] leading-tight px-2 md:px-0">
             Your Service Provider Account Is Ready
            </h1>
            <p className="text-base md:text-xl text-[#4B5563] leading-relaxed px-2 md:px-8">
              Congratulations! Your service provider account has been successfully created. You can now list your services, receive bookings, and start earning.
            </p>
          </div>

          {/* Buttons Section */}
          <div className="flex flex-col gap-4">
            {/* Primary Button */}
            <button className="w-full h-12 md:h-14 bg-[#B74241] hover:bg-[#9a3635] transition-colors shadow-[0px_4px_6px_rgba(0,0,0,0.1),0px_10px_15px_rgba(0,0,0,0.1)] rounded-xl flex items-center justify-center gap-3">
              <svg 
                className="w-3 h-3 md:w-4 md:h-4 text-white" 
                fill="currentColor" 
                viewBox="0 0 16 16"
              >
                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
              </svg>
              <button onClick={()=>{router.push("/serviceprovider/auth/profileInfo")}} className="text-sm md:text-base font-semibold text-white">
                Add Your Business Information
              </button>
            </button>

            {/* Secondary Button */}
            <button className="w-full h-12 md:h-14 bg-[#F3F4F6] hover:bg-[#E5E7EB] transition-colors border border-[#E5E7EB] rounded-xl flex items-center justify-center gap-3">
              <svg 
                className="w-4 h-4 text-[#374151]" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 5l7 7-7 7"
                />
              </svg>
              <button onClick={()=>{router.push("/serviceprovider/dashboard/dashboard")}} className="text-sm md:text-base font-semibold text-[#374151]">
                Go to Provider Dashboard
              </button>
            </button>
          </div>

          {/* Stats Section */}
          <div className="flex flex-col md:flex-row md:flex-wrap items-center justify-center gap-3 md:gap-4">
            {/* Stat 1 */}
            <div className="w-full md:w-auto px-4 md:px-6 py-3 md:py-3.5 bg-[#EFF6FF] rounded-full flex items-center justify-center gap-3">
              <svg 
                className="w-3 h-4 text-[#3B82F6]" 
                fill="currentColor" 
                viewBox="0 0 16 16"
              >
                <path d="M3 2.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 .5.5v11a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5v-11zm1 .5v10h8V3H4z"/>
                <path d="M5 5h6v1H5V5zm0 2h6v1H5V7zm0 2h6v1H5V9z"/>
              </svg>
              <span className="text-sm md:text-base font-semibold text-[#374151] whitespace-nowrap">
                18,000+ Venues Listed
              </span>
            </div>

            {/* Stat 2 */}
            <div className="w-full md:w-auto px-4 md:px-6 py-3 md:py-3.5 bg-[#F0FDF4] rounded-full flex items-center justify-center gap-3">
              <svg 
                className="w-4 h-3.5 text-[#22C55E]" 
                fill="currentColor" 
                viewBox="0 0 16 16"
              >
                <path d="M0 0h1v15h15v1H0V0zm10 3.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V4.9l-3.613 4.417a.5.5 0 0 1-.74.037L7.06 6.767l-3.656 5.027a.5.5 0 0 1-.808-.588l4-5.5a.5.5 0 0 1 .758-.06l2.609 2.61L13.445 4H10.5a.5.5 0 0 1-.5-.5z"/>
              </svg>
              <span className="text-sm md:text-base font-semibold text-[#374151] whitespace-nowrap">
                3× Revenue Growth
              </span>
            </div>

            {/* Stat 3 */}
            <div className="w-full md:w-auto px-4 md:px-6 py-3 md:py-3.5 bg-[#FAF5FF] rounded-full flex items-center justify-center gap-3">
              <svg 
                className="w-3.5 h-4 text-[#A855F7]" 
                fill="currentColor" 
                viewBox="0 0 16 16"
              >
                <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
              </svg>
              <span className="text-sm md:text-base font-semibold text-[#374151] whitespace-nowrap">
                20,000+ Venue Bookings
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Element - Hidden on mobile for cleaner look */}
      <div className="hidden md:block fixed -bottom-12 -left-12 w-24 h-24 bg-gradient-to-br from-[#DCFCE7] to-[#DBEAFE] opacity-20 rounded-full" />
    </div>
  );
}