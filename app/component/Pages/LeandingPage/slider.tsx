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
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [slideDirection, setSlideDirection] = useState<'right' | 'left'>('right');

  const slides = [
    {
      title: 'Book the Ideal Hall, Stress-Free',
      subtitle: 'VENUE PERFECTED',
      description: 'Browse verified marriage halls and service providers and book the perfect space for your event—within your budget.',
      image: slider1
    },
    {
      title: 'Find Your Dream Venue',
      subtitle: 'PERFECT LOCATIONS',
      description: 'Discover the most beautiful venues for your special day with our curated selection.',
      image: slider2
    },
    {
      title: 'Premium Service Providers',
      subtitle: 'EXPERT SERVICES',
      description: 'Connect with verified professionals who will make your event unforgettable.',
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
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    
    if (isAutoPlaying) {
      interval = setInterval(() => {
        setSlideDirection('right');
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 5000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isAutoPlaying, slides.length]);

  // Pause auto-play on user interaction
  const handleManualSlideChange = (direction: 'next' | 'prev') => {
    setIsAutoPlaying(false);
    
    if (direction === 'next') {
      nextSlide();
    } else {
      prevSlide();
    }
    
    // Resume auto-play after 10 seconds of inactivity
    const timeoutId = setTimeout(() => {
      setIsAutoPlaying(true);
    }, 10000);
    
    return () => clearTimeout(timeoutId);
  };

  const handleSearch = () => {
    console.log('Searching with:', { location, date });
  };

  // Get slide animation class based on direction
  const getSlideClass = (index: number): string => {
    if (index === currentSlide) {
      return 'translate-x-0 opacity-100';
    }
    
    if (slideDirection === 'right') {
      if (index === (currentSlide - 1 + slides.length) % slides.length) {
        return '-translate-x-full opacity-0';
      } else {
        return 'translate-x-full opacity-0';
      }
    } else {
      if (index === (currentSlide + 1) % slides.length) {
        return 'translate-x-full opacity-0';
      } else {
        return '-translate-x-full opacity-0';
      }
    }
  };

  return (
    <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden">
      {/* Slider Images with sliding animation */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-all duration-700 ease-in-out transform ${getSlideClass(index)}`}
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
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={() => handleManualSlideChange('prev')}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10 bg-black/20 hover:bg-black/40 p-2 rounded-full backdrop-blur-sm"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-10 h-10 md:w-12 md:h-12" />
      </button>

      <button
        onClick={() => handleManualSlideChange('next')}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10 bg-black/20 hover:bg-black/40 p-2 rounded-full backdrop-blur-sm"
        aria-label="Next slide"
      >
        <ChevronRight className="w-10 h-10 md:w-12 md:h-12" />
      </button>

      {/* Content Container with sliding animation */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="w-full max-w-4xl mx-4 md:mx-8 lg:mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            {/* Subtitle with animation */}
            <div className={`overflow-hidden mb-2 transition-all duration-700 ease-in-out ${
              slideDirection === 'right' 
                ? 'animate-slideInFromRight' 
                : 'animate-slideInFromLeft'
            }`}>
              <p className="text-white text-sm md:text-base tracking-widest font-light">
                {slides[currentSlide].subtitle}
              </p>
            </div>

            {/* Title with animation */}
            <div className={`overflow-hidden mb-4 transition-all duration-700 ease-in-out delay-100 ${
              slideDirection === 'right' 
                ? 'animate-slideInFromRight' 
                : 'animate-slideInFromLeft'
            }`}>
              <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                {slides[currentSlide].title}
              </h1>
            </div>

            {/* Description with animation */}
            <div className={`overflow-hidden mb-8 transition-all duration-700 ease-in-out delay-200 ${
              slideDirection === 'right' 
                ? 'animate-slideInFromRight' 
                : 'animate-slideInFromLeft'
            }`}>
              <p className="text-white text-base md:text-lg max-w-2xl mx-auto px-4 md:px-0">
                {slides[currentSlide].description}
              </p>
            </div>

            {/* CTA Buttons with animation */}
            <div className={`flex flex-col sm:flex-row gap-4 mb-8 justify-center px-4 md:px-0 transition-all duration-700 ease-in-out delay-300 ${
              slideDirection === 'right' 
                ? 'animate-slideInFromRight' 
                : 'animate-slideInFromLeft'
            }`}>
              <Link
                href="/pages/venues"
                className="bg-[#B74140] text-white px-8 py-4 rounded-md hover:bg-[#a03736] transition-colors font-medium text-lg min-w-[200px]"
              >
                Find Venues
              </Link>
              <a
                href="/pages/serviceproviders"
                className="bg-transparent text-white border-2 border-white px-8 py-4 rounded-md hover:bg-white hover:text-gray-900 transition-colors font-medium text-lg min-w-[200px]"
              >
                Find Service Providers
              </a>
            </div>

            {/* Search Box with animation */}
            <div className={`bg-white rounded-lg shadow-xl p-2 md:p-3 flex flex-col md:flex-row items-center gap-2 max-w-3xl mx-auto transition-all duration-700 ease-in-out delay-400 ${
              slideDirection === 'right' 
                ? 'animate-slideInFromRight' 
                : 'animate-slideInFromLeft'
            }`}>
              <div className="flex items-center flex-1 w-full px-4 py-3 border-b md:border-b-0 md:border-r border-gray-200">
                <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                <input
                  type="text"
                  placeholder="Enter location or venue name"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="flex-1 outline-none text-gray-700 placeholder-gray-400 text-base"
                />
              </div>

              <div className="flex items-center flex-1 w-full px-4 py-3">
                <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                <input
                  type="date"
                  placeholder="Select date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="flex-1 outline-none text-gray-700 placeholder-gray-400 text-base"
                />
              </div>

              <button
                onClick={handleSearch}
                className="bg-[#B74140] text-white px-8 py-3 rounded-md hover:bg-[#a03736] transition-colors flex items-center justify-center gap-3 w-full md:w-auto font-medium"
              >
                <Search className="w-5 h-5" />
                <span className="text-base">Search</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setIsAutoPlaying(false);
              setSlideDirection(index > currentSlide ? 'right' : 'left');
              setCurrentSlide(index);
              setTimeout(() => setIsAutoPlaying(true), 10000);
            }}
            className={`transition-all duration-300 rounded-full ${
              index === currentSlide
                ? 'bg-white w-8 h-2'
                : 'bg-white/50 hover:bg-white/75 w-2 h-2'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}