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

  // Auto slide effect (optional - uncomment if needed)
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     nextSlide();
  //   }, 5000);
  //   return () => clearInterval(interval);
  // }, [nextSlide]);

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
            {/* Dark overlay for better text readability */}
            <div className="absolute inset-0 bg-black/40 md:bg-black/20" />
          </div>
        </div>
      ))}

      {/* Navigation Arrows - Always visible on mobile, hover on desktop */}
      <button
        onClick={() => handleManualSlideChange('prev')}
        className={`absolute left-0 sm:left-4 md:left-8 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-all duration-300 z-20 bg-black/40 hover:bg-black/60 p-1 sm:p-3 rounded-full backdrop-blur-sm
          md:opacity-0 md:-translate-x-4
          ${showArrows ? 'md:opacity-100 md:translate-x-0' : ''}
          opacity-100 translate-x-0
        `}
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 md:w-10 md:h-10" />
      </button>

      <button
        onClick={() => handleManualSlideChange('next')}
        className={`absolute right-0 sm:right-0 md:right-8 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-all duration-300 z-20 bg-black/40 hover:bg-black/60 p-1 sm:p-3 rounded-full backdrop-blur-sm
          md:opacity-0 md:translate-x-4 
          ${showArrows ? 'md:opacity-100 md:translate-x-0' : ''}
          opacity-100 translate-x-0
        `}
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 md:w-10 md:h-10" />
      </button>

      {/* Content Container */}
      <div className="absolute inset-0 flex items-center justify-center z-10 px-4 sm:px-6 md:px-8">
        <div className="w-full max-w-[645px]">
          {/* Subtitle */}
          <div className="overflow-hidden mb-3 sm:mb-4 md:mb-6">
            <p className="text-[#D1D5DB] font-inter font-medium text-[10px] sm:text-xs leading-4 tracking-[1.5px] sm:tracking-[2px] text-center uppercase">
              {slides[currentSlide].subtitle}
            </p>
          </div>

          {/* Title */}
          <div className="overflow-hidden mb-3 sm:mb-4 md:mb-6">
            <h1 className="text-white font-inter font-bold text-[28px] sm:text-[36px] md:text-[48px] lg:text-[60px] leading-[110%] md:leading-[100%] tracking-tight md:tracking-normal text-center px-2">
              {slides[currentSlide].title}
            </h1>
          </div>

          {/* Description */}
          <div className="overflow-hidden mb-4 sm:mb-5 md:mb-6">
            <p className="text-white font-inter font-normal text-[14px] sm:text-[16px] md:text-[18px] leading-[140%] md:leading-[120%] tracking-normal text-center px-4 sm:px-6 md:px-0">
              {slides[currentSlide].description}
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-5 sm:mb-6 md:mb-8 justify-center px-4 sm:px-2">
            <Link
              href="/pages/findVenues"
              className="bg-[#B74140] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-md hover:bg-[#a03736] transition-colors font-medium text-sm sm:text-base md:text-lg w-full sm:w-[260px] text-center"
            >
              Find Venues
            </Link>
            <Link
              href="/pages/findServiceProvider"
              className="bg-transparent text-white border-2 border-white px-6 sm:px-8 py-3 sm:py-4 rounded-md hover:bg-white hover:text-gray-900 transition-colors font-medium text-sm sm:text-base md:text-lg w-full sm:w-[260px] text-center"
            >
              Find Service Providers
            </Link>
          </div>

          {/* Search Box */}
          <div className="bg-white rounded-lg shadow-xl p-2 sm:p-3 flex flex-col md:flex-row items-stretch gap-2 max-w-3xl mx-auto">
            <div className="flex items-center flex-1 w-full px-3 sm:px-4 py-2.5 sm:py-3 border-b md:border-b-0 md:border-r border-gray-200">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mr-2 sm:mr-3 flex-shrink-0" />
              <input
                type="text"
                placeholder="Location or venue"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="flex-1 outline-none text-gray-700 placeholder-gray-400 text-sm sm:text-base"
              />
            </div>

            <div className="flex items-center flex-1 w-full px-3 sm:px-4 py-2.5 sm:py-3 border-b md:border-b-0 md:border-r border-gray-200">
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
              className="bg-[#B74140] text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-md hover:bg-[#a03736] transition-colors flex items-center justify-center gap-2 sm:gap-3 w-full md:w-auto font-medium"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Search</span>
            </button>
          </div>

          {/* Slide Indicators (optional - for mobile) */}
          <div className="flex justify-center gap-2 mt-4 md:hidden">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setSlideDirection(index > currentSlide ? 'right' : 'left');
                  setCurrentSlide(index);
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'bg-white w-6' 
                    : 'bg-white/50'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}