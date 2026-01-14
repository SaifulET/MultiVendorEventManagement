'use client';

import React, { useState, ChangeEvent } from 'react';
import dynamic from 'next/dynamic';
import {
  ChevronLeft, ChevronRight, MapPin, Upload, Plus, Wifi, Car,
  Snowflake, Utensils, Mic, Shield, Accessibility, Music, X, ArrowLeftIcon
} from 'lucide-react';
import { useRouter } from 'next/navigation';



interface AvailabilityStatus {
  [key: number]: 'available' | 'pending' | 'booked' | null;
}



const VenueManagement: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState<number>(11);
  const [currentYear, setCurrentYear] = useState<number>(2024);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([
    '/api/placeholder/300/200',
    '/api/placeholder/300/200',
    '/api/placeholder/300/200'
  ]);
  const [videoLinks, setVideoLinks] = useState<string[]>(['']);
  const [availability, setAvailability] = useState<AvailabilityStatus>({
    8: 'available', 9: 'available', 10: 'available', 11: 'booked', 12: 'available',
    13: 'available', 14: 'available', 15: 'available', 16: 'booked', 17: 'available',
    18: 'available', 19: 'available', 20: 'available', 21: 'available', 22: 'available',
    23: 'booked', 24: 'available', 25: 'available', 26: 'pending', 27: 'available',
    28: 'available', 29: 'available', 30: 'available', 31: 'pending'
  });

  const daysInMonth: number = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth: number = new Date(currentYear, currentMonth, 1).getDay();
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];

  const getStatusColor = (status?: 'available' | 'pending' | 'booked' | null): string => {
    if (status === 'available') return 'bg-emerald-400 hover:bg-emerald-500 text-white';
    if (status === 'pending') return 'bg-yellow-400 hover:bg-yellow-500 text-white';
    if (status === 'booked') return 'bg-red-400 hover:bg-red-500 text-white';
    return 'text-gray-400 hover:bg-gray-50';
  };


  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>): void => {
    const files = e.target.files;
    if (!files) return;
    
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number): void => {
    setSelectedImages(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleDayClick = (day: number): void => {
    setAvailability(prev => {
      const current = prev[day];
      let next: 'available' | 'pending' | 'booked' | null;
      
      if (!current) next = 'available';
      else if (current === 'available') next = 'pending';
      else if (current === 'pending') next = 'booked';
      else next = null;
      
      return { ...prev, [day]: next };
    });
  };

  const handlePrevMonth = (): void => {
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



  const addVideoLink = (): void => {
    setVideoLinks([...videoLinks, '']);
  };

  const updateVideoLink = (index: number, value: string): void => {
    const newLinks = [...videoLinks];
    newLinks[index] = value;
    setVideoLinks(newLinks);
  };

  const removeVideoLink = (index: number): void => {
    setVideoLinks(videoLinks.filter((_, idx) => idx !== index));
  };

  const renderCalendar = (): React.ReactElement[] => {
    const days: React.ReactElement[] = [];
    const dayLabels: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const status = availability[day];
      days.push(
        <button
          key={day}
          onClick={() => handleDayClick(day)}
          className={`aspect-square rounded-lg font-medium text-sm transition-colors outline-none ${getStatusColor(status)}`}
        >
          {day}
        </button>
      );
    }

    return [
      ...dayLabels.map(label => (
        <div key={label} className="text-center text-sm font-medium text-gray-600 py-2">
          {label}
        </div>
      )),
      ...days
    ];
  };

 

  const route = useRouter();
  
  return (
    <div className="min-h-screen bg-gray-50 p-[32px] md:px-[160px] ">
      <div>
        <button className='flex' onClick={()=>{route.push("/serviceprovider/dashboard/myServices")}}>
          <ArrowLeftIcon className='w-7 h-7'/> 
          <h1 className="font-inter font-bold text-[30px] leading-[36px] tracking-[0] text-gray-900 mb-[24px] md:mb-[34px]">Add Your Service</h1>
        </button>
       
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Form */}
          <div className="lg:col-span-2 space-y-6 ">
            {/* Venue Information */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-[24px]">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Service Information</h2>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Service Name</label>
                  <input
                    type="text"
                    placeholder="Enter service name"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-gray-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Category
                  </label>

                  <div className="relative">
                    <select
                      className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg
                                 outline-none focus:border-gray-400 transition-colors
                                 appearance-none bg-white cursor-pointer"
                    >
                      <option>Select category</option>
                      <option>Wedding Hall</option>
                      <option>Conference Room</option>
                      <option>Banquet Hall</option>
                    </select>

                    {/* Down Arrow */}
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-900 mb-2">Full Service Description</label>
                  <textarea  id="description"   className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-gray-400 transition-colors" placeholder='Describe your service in detail...'></textarea>
                </div>

              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Pricing</h2>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Per Hour</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-gray-400 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Discount (%)</label>
                  <input
                    type="text"
                    placeholder="Optional discount percentage"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-gray-400 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Gallery */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Gallery</h2>
              
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center mb-6">
                <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-700 font-medium mb-1">Drag & drop images here</p>
                <p className="text-gray-500 text-sm mb-4">or click to browse files</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-block px-6 py-2.5 bg-[#B74140] hover:bg-[#862c2a] text-white rounded-lg cursor-pointer transition-colors"
                >
                  Choose Files
                </label>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {selectedImages.map((img: string, idx: number) => (
                  <div key={idx} className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 group">
                    <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeImage(idx)}
                      className="absolute top-2 right-2 bg-[#B74140] text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity outline-none hover:bg-[#702120]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <label htmlFor="file-upload" className="aspect-video rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors outline-none cursor-pointer">
                  <Plus className="w-8 h-8 text-gray-400" />
                </label>
              </div>
            </div>

            {/* Venue Video */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Venue Video (if have)</h2>
              
              <div className="space-y-4">
                {videoLinks.map((link, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-900 mb-2">YouTube Video URL {index + 1}</label>
                      <input
                        type="text"
                        value={link}
                        onChange={(e) => updateVideoLink(index, e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=xxxxx"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-gray-400 transition-colors"
                      />
                    </div>
                    {videoLinks.length > 1 && (
                      <button
                        onClick={() => removeVideoLink(index)}
                        className="mt-8 p-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors outline-none"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addVideoLink}
                  className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium transition-colors outline-none"
                >
                  <Plus className="w-5 h-5" />
                  Add Another Video Link
                </button>
                <p className="text-xs text-gray-500">Only YouTube links are supported</p>
              </div>
            </div>
          </div>

          {/* Right Column - Calendar & Publish */}
          <div className="space-y-6">
            {/* Availability Calendar */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Availability Calendar</h2>
              
              <div className="mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">{monthNames[currentMonth]} {currentYear}</h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={handlePrevMonth}
                      className="p-1 hover:bg-gray-100 rounded outline-none transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={handleNextMonth}
                      className="p-1 hover:bg-gray-100 rounded outline-none transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {renderCalendar()}
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm pt-4 border-t">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-emerald-400"></div>
                  <span className="text-gray-700">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-yellow-400"></div>
                  <span className="text-gray-700">Pending Bookings</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-red-400"></div>
                  <span className="text-gray-700">Booked</span>
                </div>
              </div>
            </div>

            {/* Publish Settings */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Publish Settings</h2>
              
              <button onClick={()=>{route.push("/venueprovider/dashboard/myVanue")}} className="w-full py-3 bg-[#B74140] hover:bg-[#802423] text-white font-semibold rounded-lg transition-colors outline-none">
                Publish Venue
              </button>
            </div>
          </div>
        </div>
      </div>

   
    </div>
  );
};

export default VenueManagement;