'use client';

import React, { useState } from 'react';
import { Play, MapPin, DollarSign, Users, Wifi, Volume2, Utensils, Wind, Accessibility, Calendar, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface CalendarDay {
  date: number;
  available: boolean;
  booked: boolean;
  isCurrentMonth: boolean;
}

interface MediaOption {
  name: string;
  color: string;
  type: 'image' | 'video';
  thumbnail: string;
  source?: string;
}

interface Review {
  name: string;
  rating: number;
  time: string;
  comment: string;
  avatar: string;
}

const VenueBookingPage: React.FC = () => {
  const [selectedMedia, setSelectedMedia] = useState<string>('Pink');
  const [currentMonth, setCurrentMonth] = useState<number>(0);
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const mediaOptions: MediaOption[] = [
    { 
      name: 'Pink', 
      color: 'bg-pink-300',
      type: 'video',
      thumbnail: 'https://images.unsplash.com/photo-1519167758481-83f29da8685c?w=200&h=200&fit=crop',
      source: 'https://www.w3schools.com/html/mov_bbb.mp4'
    },
    { 
      name: 'Green', 
      color: 'bg-green-600',
      type: 'video',
      thumbnail: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=200&h=200&fit=crop',
      source: 'https://www.w3schools.com/html/movie.mp4'
    },
    { 
      name: 'Red', 
      color: 'bg-red-600',
      type: 'image',
      thumbnail: 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=200&h=200&fit=crop'
    },
    { 
      name: 'Blue', 
      color: 'bg-blue-600',
      type: 'video',
      thumbnail: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=200&h=200&fit=crop',
      source: 'https://www.w3schools.com/html/mov_bbb.mp4'
    },
    { 
      name: 'Purple', 
      color: 'bg-purple-600',
      type: 'image',
      thumbnail: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=200&h=200&fit=crop'
    },
    { 
      name: 'Black', 
      color: 'bg-gray-900',
      type: 'video',
      thumbnail: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=200&h=200&fit=crop',
      source: 'https://www.w3schools.com/html/movie.mp4'
    },
    { 
      name: 'Image', 
      color: 'bg-gray-700',
      type: 'image',
      thumbnail: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=200&h=200&fit=crop'
    }
  ];

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const generateCalendar = (): CalendarDay[] => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const calendar: CalendarDay[] = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      calendar.push({ date: 0, available: false, booked: false, isCurrentMonth: false });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isAvailable = Math.random() > 0.5;
      calendar.push({
        date: day,
        available: isAvailable,
        booked: !isAvailable,
        isCurrentMonth: true
      });
    }

    return calendar;
  };

  const calendar = generateCalendar();

  const reviews: Review[] = [
    {
      name: 'Sarah Johnson',
      rating: 5,
      time: '2 weeks ago',
      comment: 'Absolutely stunning venue! The staff was incredibly helpful and the space exceeded our expectations. Our wedding was perfect thanks to their attention to detail.',
      avatar: 'SJ'
    },
    {
      name: 'Michael Chen',
      rating: 4,
      time: '1 month ago',
      comment: 'Great venue for corporate events. The AV equipment was top-notch and the catering was excellent. Would definitely book again for future events.',
      avatar: 'MC'
    },
    {
      name: 'Emily Rodriguez',
      rating: 5,
      time: '3 weeks ago',
      comment: 'Beautiful venue with amazing city views. The event coordination team made everything seamless. Highly recommend for any special occasion.',
      avatar: 'ER'
    }
  ];

  const handlePreviousMonth = (): void => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = (): void => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleMediaClick = (mediaName: string): void => {
    setSelectedMedia(mediaName);
    setIsPlaying(false);
  };
const router= useRouter()
  const handlePlayClick = (): void => {
    const currentMedia = mediaOptions.find(m => m.name === selectedMedia);
    if (currentMedia?.type === 'video') {
      setIsPlaying(true);
    }
  };
  const bookHandler = () => {
    // Navigate to booking confirmation page
    window.location.href = '/pages/venueBookings/confirmed-booking-slug';
  }

 const renderStars = (rating: number) => {
  return Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      size={14}
      className={i < rating ? 'fill-[#FACC15] text-[#FACC15]' : 'fill-gray-300 text-gray-300'}
    />
  ));
};

  const currentMedia = mediaOptions.find(m => m.name === selectedMedia);

  return (
    <div className="min-h-screen md:px-[80px]">
      <div className="px-[24px] py-[32px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-[32px]">
          {/* Left Column: Media Gallery + Details */}
          <div className="lg:col-span-8">
            {/* Media Gallery Card */}
            <div className="bg-white rounded-lg border border-[#E5E7EB]  overflow-hidden mb-[42px]">
              {/* Main Image/Video Display */}
              <div className="aspect-video bg-gray-200 relative  w-[811px] h-[480px]">
                {isPlaying && currentMedia?.type === 'video' ? (
                  <video
                    key={currentMedia.source}
                    className="w-full h-full object-cover "
                    controls
                    autoPlay
                    src={currentMedia.source}
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <>
                   <Image
  src={
    currentMedia?.thumbnail ||
    "https://images.unsplash.com/photo-1519167758481-83f29da8685c?w=1200&h=675&fit=crop"
  }
  alt="Grand Ballroom"
  fill
  className="object-cover"
/>
                    {currentMedia?.type === 'video' && (
                      <button 
                        onClick={handlePlayClick}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center border border-[#E5E7EB]  hover:scale-110 transition-transform">
                          <Play className="w-10 h-10 text-gray-800 ml-1" fill="currentColor" />
                        </div>
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Media Options */}
              <div className="mt-[17px] pb-[5px]">
                <div className="flex lg:gap-[8px] xl:gap-[14px] pl-[4px]">
                  {mediaOptions.map((option) => (
                    <button
                      key={option.name}
                      onClick={() => handleMediaClick(option.name)}
                      className={`relative rounded-lg overflow-hidden transition-all w-[64px] xl:w-[94px]  ${
                        selectedMedia === option.name ? 'ring-2 ring-[#B74140]' : ''
                      }`}
                    >
                      <div className="aspect-square relative ">
                        <div className={`w-full h-full ${option.color}`}></div>
                        {option.type === 'video' && (
                          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                            <Play className="w-6 h-6 text-white" fill="white" />
                          </div>
                        )}
                        <div className="absolute inset-0 opacity-40">
                          <img
                            src={option.thumbnail}
                            alt={option.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <div className="bg-white py-1.5 text-center">
                        <span className="text-xs font-medium text-gray-800">{option.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Venue Details Card */}
            <div className="bg-white rounded-lg border border-[#E5E7EB]  p-6 mb-[32px]">
              <h1 className="text-2xl font-bold mb-2">Grand Ballroom at The Metropolitan</h1>
              
              <div className="flex items-start gap-2 text-gray-600 mb-6">
                <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                <span className="text-sm">123 Downtown Avenue, Dhaka, Bangladesh</span>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <DollarSign size={18} className="text-[#B74140]" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-600">Per Person</div>
                    <div className="font-semibold text-sm">$50/ day</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users size={18} className="text-[#B74140]" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-600">Capacity</div>
                    <div className="font-semibold text-sm">Up to 300 guests</div>
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <h2 className="text-lg font-semibold mb-3">Amenities</h2>
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="flex items-center gap-2 text-gray-700">
                  <Wifi size={16} className="text-[#B74140]" />
                  <span className="text-sm">Free WiFi</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Volume2 size={16} className="text-[#B74140]" />
                  <span className="text-sm">Audio/Visual</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar size={16} className="text-[#B74140]" />
                  <span className="text-sm">Parking</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Wind size={16} className="text-[#B74140]" />
                  <span className="text-sm">Air Conditioning</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Utensils size={16} className="text-[#B74140]" />
                  <span className="text-sm">Catering</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Accessibility size={16} className="text-[#B74140]" />
                  <span className="text-sm">Accessible</span>
                </div>
              </div>

              {/* Description */}
              <h2 className="text-lg font-semibold mb-3">Description</h2>
              <p className="text-sm text-gray-700 leading-relaxed mb-6">
                Experience elegance at its finest in our Grand Ballroom. This stunning venue features soaring ceilings, crystal chandeliers, and panoramic city views. Perfect for weddings, corporate events, and special celebrations. Our dedicated event team ensures every detail is perfect for your memorable occasion.
              </p>

              {/* Map */}
              <div className="rounded-lg overflow-hidden border border-gray-200 h-64">
                <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src="https://www.openstreetmap.org/export/embed.html?bbox=90.3940%2C23.7620%2C90.4140%2C23.7820&layer=mapnik&marker=23.7720,90.4040"
                  allowFullScreen
                ></iframe>
              </div>
            </div>

            {/* Reviews Card */}
            <div className="bg-white rounded-lg border border-[#E5E7EB]  p-6">
              <h2 className="text-lg font-semibold mb-6">Reviews ({reviews.length})</h2>
              <div className="space-y-4">
                {reviews.map((review, index) => (
                  <div key={index} className="border-b border-gray-200 last:border-0 pb-4 last:pb-0">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="w-10 h-10 bg-[#B74140] rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                        {review.avatar}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-sm">{review.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex gap-0.5">{renderStars(review.rating)}</div>
                          <span className="text-xs text-gray-500">{review.time}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Booking Calendar */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-lg border border-[#E5E7EB]  p-5 sticky top-8">
              <h3 className="text-base font-semibold mb-4">Check Availability</h3>
              
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={handlePreviousMonth}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft size={18} className="text-gray-600" />
                </button>
                <div className="text-sm font-semibold text-gray-800">
                  {monthNames[currentMonth]} {currentYear}
                </div>
                <button
                  onClick={handleNextMonth}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight size={18} className="text-gray-600" />
                </button>
              </div>

              {/* Calendar Header */}
              <div className="grid grid-cols-7 gap-1.5 mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                  <div key={day} className="text-center text-xs font-medium text-gray-600">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1.5 mb-5">
                {calendar.map((day, index) => (
                  <button
                    key={index}
                    disabled={!day.isCurrentMonth}
                    className={`aspect-square flex items-center justify-center text-xs rounded transition-colors ${
                      !day.isCurrentMonth
                        ? 'invisible'
                        : day.available
                        ? 'bg-[#3CCF911A] text-gray-800 hover:bg-[#3CCF9133] '
                        : 'bg-[#FF5A5A1A] text-gray-800 '
                    }`}
                  >
                    {day.isCurrentMonth ? day.date : ''}
                  </button>
                ))}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-3 mb-5 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 bg-[#3CCF91]  rounded"></div>
                  <span className="text-gray-700">Available</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 bg-[#FF5A5A] rounded"></div>
                  <span className="text-gray-700">Booked</span>
                </div>
              </div>

              {/* Action Buttons */}
              <button onClick={bookHandler} className="w-full bg-[#B74140] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#a03837] transition-colors mb-2.5">
                Book Now
              </button>
              <button onClick={()=>{router.push("/home/dashboard/chat")}} className="w-full border border-[#E5E7EB]  text-gray-700 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors">
                Contact Provider
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueBookingPage;