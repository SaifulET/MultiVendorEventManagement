"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Calendar, Search } from 'lucide-react';
import Image from 'next/image';
import slider1 from "@/public/slider1.svg";
import slider2 from "@/public/slider2.svg";
import slider3 from "@/public/slider3.svg";
import Link from 'next/link';

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [slideDirection, setSlideDirection] = useState<'right' | 'left'>('right');
  const [showArrows, setShowArrows] = useState(false);

  const slides = [
    {
      title: 'Book the Ideal Hall, Stress-Free',
      subtitle: 'VENUE PERFECTED',
      description: 'Browse verified marriage halls and service providers and book the perfect space for your event—within your budget.',
      image: slider1
    },
    {
      title: 'Catering That Delivers Flavor',
      subtitle: 'Feast Without Fuss',
      description: 'Compare menus, per-head pricing, and lock in trusted chefs who turn weddings into culinary events.',
      image: slider2
    },
    {
      title: 'Book Event Services',
      subtitle: 'Plan Smart, Celebrate Better',
      description: 'From chairs and tents to lighting, décor, and full event planning — get everything you need for a flawless event, all in one place.',
      image: slider3
    }
  ];

  // Next slide function with direction
  const nextSlide = useCallback(() => {
    setSlideDirection('right');
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  // Previous slide function with direction
  const prevSlide = useCallback(() => {
    setSlideDirection('left');
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Auto slide effect
 

  // Pause auto-play on user interaction
  const handleManualSlideChange = (direction: 'next' | 'prev') => {
  
    
    if (direction === 'next') {
      nextSlide();
    } else {
      prevSlide();
    }
    
   
  };

  const handleSearch = () => {
    console.log('Searching with:', { location, date });
  };

  // Get slide animation class based on direction
  const getSlideClass = (index: number): string => {
    if (index === currentSlide) {
      return 'translate-x-0 opacity-100 z-10';
    }
    
    if (slideDirection === 'right') {
      if (index === (currentSlide - 1 + slides.length) % slides.length) {
        return '-translate-x-full opacity-0 z-0';
      } else {
        return 'translate-x-full opacity-0 z-0';
      }
    } else {
      if (index === (currentSlide + 1) % slides.length) {
        return 'translate-x-full opacity-0 z-0';
      } else {
        return '-translate-x-full opacity-0 z-0';
      }
    }
  };

  return (
    <div 
      className="relative w-full h-[500px] sm:h-[550px] md:h-[600px] lg:h-[616px] overflow-hidden bg-gray-900"
      onMouseEnter={() => setShowArrows(true)}
      onMouseLeave={() => setShowArrows(false)}
    >
      {/* Slider Images with sliding animation */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-all duration-500 ease-in-out transform ${getSlideClass(index)}`}
        >
          <div className="relative w-full h-full">
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover"
              priority={index === 0}
              sizes="100vw"
            />
            {/* Dark overlay for better text readability on mobile */}
            <div className="absolute inset-0 bg-black/30 md:bg-black/20" />
          </div>
        </div>
      ))}

      {/* Navigation Arrows - Always visible on mobile, hover on desktop */}
      <button
        onClick={() => handleManualSlideChange('prev')}
        className={`absolute left-2 sm:left-4 md:left-8 top-[25%] md:top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-all duration-300 z-20 bg-black/40 hover:bg-black/60 p-2 sm:p-3 rounded-full backdrop-blur-sm
          md:opacity-0 md:-translate-x-4
          ${showArrows ? 'md:opacity-100 md:translate-x-0' : ''}
          opacity-100 translate-x-0
        `}
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" />
      </button>

      <button
        onClick={() => handleManualSlideChange('next')}
        className={`absolute right-2 sm:right-4 md:right-8 top-[25%] md:top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-all duration-300 z-20 bg-black/40 hover:bg-black/60 p-2 sm:p-3 rounded-full backdrop-blur-sm
          md:opacity-0 md:translate-x-4
          ${showArrows ? 'md:opacity-100 md:translate-x-0' : ''}
          opacity-100 translate-x-0
        `}
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" />
      </button>

      {/* Content Container */}
      <div className=" absolute inset-0 flex items-center justify-center z-10 px-4 sm:px-6 md:px-8">
        <div className="w-[645px] text-center">
          <div className="">
            {/* Subtitle */}
            <div className="overflow-hidden mb-[24px]">
              <p className="text-[#D1D5DB] font-inter font-medium text-xs leading-4 tracking-[2px] text-center
">
                {slides[currentSlide].subtitle}
              </p>
            </div>

            {/* Title */}
            <div className="overflow-hidden mb-3 sm:mb-4">
              <h1 className="text-white font-inter font-bold text-[24px] md:text-[60px] leading-[100%] tracking-normal text-center
 px-2">
                {slides[currentSlide].title}
              </h1>
            </div>

            {/* Description */}
            <div className="overflow-hidden mb-[24px] ">
              <p className="text-white font-inter font-normal text-[18px] leading-[120%] tracking-normal text-center
">
                {slides[currentSlide].description}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8 justify-center px-2">
              <Link
                href="/pages/findVenues"
                className="bg-[#B74140] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-md hover:bg-[#a03736] transition-colors font-medium text-base sm:text-lg w-[260px]"
              >
                Find Venues
              </Link>
              <Link
                href="/pages/findServiceProvider"
                className="bg-transparent text-white border-2 border-white px-6 sm:px-8 py-3 sm:py-4 rounded-md hover:bg-white hover:text-gray-900 transition-colors font-medium text-base sm:text-lg w-[260px]"
              >
                Find Service Providers
              </Link>
            </div>

            {/* Search Box */}
            <div className="bg-white rounded-lg shadow-xl p-2 sm:p-3 flex flex-col md:flex-row items-center gap-2 max-w-3xl mx-auto">
              <div className="flex items-center flex-1 w-full px-3 sm:px-4 py-2 sm:py-3 border-b md:border-b-0 md:border-r border-gray-200">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mr-2 sm:mr-3 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Enter location or venue name"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="flex-1 outline-none text-gray-700 placeholder-gray-400 text-sm sm:text-base"
                />
              </div>

              <div className="flex items-center flex-1 w-full px-3 sm:px-4 py-2 sm:py-3">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mr-2 sm:mr-3 flex-shrink-0" />
                <input
                  type="date"
                  placeholder="Select date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="flex-1 outline-none text-gray-700 placeholder-gray-400 text-sm sm:text-base"
                />
              </div>

              <button
                onClick={handleSearch}
                className="bg-[#B74140] text-white px-6 sm:px-8 py-2 sm:py-3 rounded-md hover:bg-[#a03736] transition-colors flex items-center justify-center gap-2 sm:gap-3 w-full md:w-auto font-medium"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">Search</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}