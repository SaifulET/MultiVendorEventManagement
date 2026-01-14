'use client';

import React, { useState } from 'react';
import { Check, MapPin, Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface VenueForm {
  venueName: string;
  venueCategory: string;
  description: string;
  fullAddress: string;
  city: string;
  postCode: string;
  pricePerPerson: string;
  guestCapacity: string;
  amenities: string[];
  images: string[];
  videoLinks: string[];
}

const categories = [
  'Banquet Hall',
  'Wedding Hall',
  'Conference Hall',
  'Outdoor Venue',
  'Rooftop Venue',
  'Restaurant'
];

const amenitiesList = [
  { id: 'parking', label: 'Parking', icon: '🅿️' },
  { id: 'ac', label: 'AC', icon: '❄️' },
  { id: 'generator', label: 'Generator', icon: '⚡' },
  { id: 'sound', label: 'Sound System', icon: '🔊' },
  { id: 'washroom', label: 'Washroom', icon: '🚻' },
  { id: 'accessibility', label: 'Accessibility', icon: '♿' },
  { id: 'wifi', label: 'WiFi', icon: '📶' },
  { id: 'catering', label: 'Catering', icon: '🍽️' },
  { id: 'projector', label: 'Projector', icon: '📽️' }
];

export default function EditVenue() {
  const [formData, setFormData] = useState<VenueForm>({
    venueName: 'Grand Ballroom Heritage Hall',
    venueCategory: 'Banquet Hall',
    description: 'Elegant banquet hall perfect for weddings, corporate events, and special celebrations. Features stunning architecture and modern amenities.',
    fullAddress: '123 Heritage Street, Gulshan-2, Dhaka 1212',
    city: 'Dhaka',
    postCode: '1212',
    pricePerPerson: '85000',
    guestCapacity: '500',
    amenities: ['parking', 'ac', 'generator', 'sound', 'washroom', 'wifi', 'projector'],
    images: [
      '🏛️',
      '💒',
      '🏢'
    ],
    videoLinks: ['https://youtube.com/watch?v=example']
  });

  const [currentMonth, setCurrentMonth] = useState(new Date(2024, 0, 1));
  const [selectedDates, setSelectedDates] = useState<{[key: string]: 'available' | 'booked' | 'pending'}>({
    '2024-1-1': 'available',
    '2024-1-4': 'available',
    '2024-1-6': 'available',
    '2024-1-7': 'available',
    '2024-1-9': 'available',
    '2024-1-10': 'available',
    '2024-1-11': 'available',
    '2024-1-13': 'available',
    '2024-1-16': 'available',
    '2024-1-17': 'available',
    '2024-1-18': 'available',
    '2024-1-21': 'available',
    '2024-1-23': 'available',
    '2024-1-25': 'available',
    '2024-1-27': 'available',
    '2024-1-28': 'available',
    '2024-1-30': 'available',
    '2024-1-2': 'booked',
    '2024-1-5': 'booked',
    '2024-1-12': 'booked',
    '2024-1-15': 'booked',
    '2024-1-20': 'booked',
    '2024-1-26': 'booked',
    '2024-1-29': 'booked',
    '2024-1-31': 'booked',
    '2024-1-3': 'pending',
    '2024-1-24': 'pending'
  });

  const handleInputChange = (field: keyof VenueForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAmenityToggle = (amenityId: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(a => a !== amenityId)
        : [...prev.amenities, amenityId]
    }));
  };
  const router = useRouter();
const HandleSave=()=>{
  router.push("/venueprovider/dashboard/myVanue")
}
  const handleImageUpload = () => {
    const newEmoji = ['🎭', '🎪', '🎨', '🎬', '🎤'][Math.floor(Math.random() * 5)];
    setFormData(prev => ({ ...prev, images: [...prev.images, newEmoji] }));
  };

  const handleImageRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const addVideoLink = () => {
    setFormData(prev => ({
      ...prev,
      videoLinks: [...prev.videoLinks, '']
    }));
  };

  const updateVideoLink = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      videoLinks: prev.videoLinks.map((link, i) => i === index ? value : link)
    }));
  };

  const removeVideoLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      videoLinks: prev.videoLinks.filter((_, i) => i !== index)
    }));
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const toggleDateStatus = (day: number) => {
    const dateKey = `${currentMonth.getFullYear()}-${currentMonth.getMonth() + 1}-${day}`;
    const currentStatus = selectedDates[dateKey];
    
    setSelectedDates(prev => {
      const newDates = { ...prev };
      if (!currentStatus) {
        newDates[dateKey] = 'available';
      } else if (currentStatus === 'available') {
        newDates[dateKey] = 'booked';
      } else if (currentStatus === 'booked') {
        newDates[dateKey] = 'pending';
      } else {
        delete newDates[dateKey];
      }
      return newDates;
    });
  };

  const getDateStatus = (day: number) => {
    const dateKey = `${currentMonth.getFullYear()}-${currentMonth.getMonth() + 1}-${day}`;
    return selectedDates[dateKey];
  };

  const changeMonth = (direction: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1));
  };

  return (
    <div className="min-h-screen  ">
      <div className="">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Edit Venue</h1>
          <button onClick={()=>{HandleSave()}} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#B74140] hover:bg-[#ad3c3a] text-white px-6 py-3 rounded-lg font-medium transition-colors">
            <Check className="w-5 h-5" />
            Publish Venue
          </button>
        </div>

        {/* Section 1: Basic Information */}
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 mb-6">
          <div className="flex items-start gap-3 mb-6">
            <div className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-semibold flex-shrink-0">
              1
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
              <p className="text-sm text-gray-500">Enter the core details of your venue</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Venue Name</label>
              <input
                type="text"
                value={formData.venueName}
                onChange={(e) => handleInputChange('venueName', e.target.value)}
                className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Venue Category</label>
              <select
                value={formData.venueCategory}
                onChange={(e) => handleInputChange('venueCategory', e.target.value)}
                className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Location */}
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 mb-6">
          <div className="flex items-start gap-3 mb-6">
            <div className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-semibold flex-shrink-0">
              2
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Location</h2>
              <p className="text-sm text-gray-500">Set your venues address and map location</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Address</label>
              <input
                type="text"
                value={formData.fullAddress}
                onChange={(e) => handleInputChange('fullAddress', e.target.value)}
                className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Post Code</label>
                <input
                  type="text"
                  value={formData.postCode}
                  onChange={(e) => handleInputChange('postCode', e.target.value)}
                  className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Map Location</label>
              <div className="bg-gray-100 rounded-lg p-12 flex flex-col items-center justify-center border-2 border-dashed  border-[#E5E7EB]">
                <MapPin className="w-12 h-12 text-red-500 mb-3" />
                <p className="text-gray-700 font-medium mb-1">Click to set location pin</p>
                <p className="text-sm text-gray-500">Drag the pin to adjust position</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Pricing & Capacity */}
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 mb-6">
          <div className="flex items-start gap-3 mb-6">
            <div className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-semibold flex-shrink-0">
              3
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Pricing & Capacity</h2>
              <p className="text-sm text-gray-500">Define pricing structure and venue capacity</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Per Person</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={formData.pricePerPerson}
                  onChange={(e) => handleInputChange('pricePerPerson', e.target.value)}
                  className="w-full pl-8 pr-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Guest Capacity</label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.guestCapacity}
                  onChange={(e) => handleInputChange('guestCapacity', e.target.value)}
                  className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">guests</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Amenities */}
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 mb-6">
          <div className="flex items-start gap-3 mb-6">
            <div className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-semibold flex-shrink-0">
              4
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Amenities</h2>
              <p className="text-sm text-gray-500">Select available facilities and services</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {amenitiesList.map(amenity => (
              <label
                key={amenity.id}
                className="flex items-center gap-3 p-4 border border-[#E5E7EB] rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={formData.amenities.includes(amenity.id)}
                  onChange={() => handleAmenityToggle(amenity.id)}
                  className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <span className="text-xl">{amenity.icon}</span>
                <span className="text-sm font-medium text-gray-700">{amenity.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Section 5: Media */}
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 mb-6">
          <div className="flex items-start gap-3 mb-6">
            <div className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-semibold flex-shrink-0">
              5
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Media Section</h2>
              <p className="text-sm text-gray-500">Upload images and videos to showcase your venue</p>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Image Gallery</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {formData.images.map((img, index) => (
                <div key={index} className="relative group aspect-square bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center text-6xl">
                    {img}
                  </div>
                  <button
                    onClick={() => handleImageRemove(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={handleImageUpload}
                className="aspect-square border border-dashed  border-[#E5E7EB] rounded-lg flex flex-col items-center justify-center hover:border-red-500 hover:bg-red-50 transition-colors"
              >
                <svg className="w-8 h-8 text-red-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm text-gray-600">Upload Image</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Video Links</label>
            <div className="space-y-3">
              {formData.videoLinks.map((link, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="url"
                    value={link}
                    onChange={(e) => updateVideoLink(index, e.target.value)}
                    placeholder="https://youtube.com/watch?v=example"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => removeVideoLink(index)}
                    className="px-4 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              <button
                onClick={addVideoLink}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium"
              >
                <Plus className="w-5 h-5" />
                Add Video Link
              </button>
            </div>
          </div>
        </div>

        {/* Section 6: Availability Calendar */}
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 mb-6">
          <div className="flex items-start gap-3 mb-6">
            <div className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-semibold flex-shrink-0">
              6
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Availability Calendar</h2>
              <p className="text-sm text-gray-500">Manage venue booking dates</p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => changeMonth(-1)}
                  className="p-2 border border-[#E5E7EB] rounded-lg hover:bg-gray-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => changeMonth(1)}
                  className="p-2 border border-[#E5E7EB] rounded-lg hover:bg-gray-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-600 ">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2 text-center">
              {getDaysInMonth().map((day, index) => {
                if (day === null) {
                  return <div key={index} className="w-[140px] h-[48px] " />;
                }
                const status = getDateStatus(day);
                return (
                  <button
                    key={index}
                    onClick={() => toggleDateStatus(day)}
                    className={`w-[140px] h-[48px]  rounded-lg font-medium text-sm transition-colors ${
                      status === 'available'
                        ? 'bg-green-400 text-green-700 hover:bg-green-200'
                        : status === 'booked'
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        : 'bg-green-100 text-green-700 hover:bg-gray-100'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-400 rounded"></div>
                <span className="text-gray-700">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-400 rounded"></div>
                <span className="text-gray-700">Booked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                <span className="text-gray-700">Pending Booking</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}