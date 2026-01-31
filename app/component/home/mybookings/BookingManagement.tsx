
"use client";
import React, { useState } from 'react';
import { Calendar, MapPin, Clock, Eye, Star, X, Clock4 } from 'lucide-react';
import { useRouter } from 'next/navigation';

type BookingStatus = 'pending' | 'upcoming' | 'completed' | 'cancelled';
type BookingType = 'venue' | 'service';

interface Booking {
  id: number;
  type: BookingType;
  name: string;
  date: string;
  time: string;
  location: string;
  status: BookingStatus;
  paid: boolean;
  image: string;
}

const bookings: Booking[] = [
  {
    id: 1,
    type: 'venue',
    name: 'Downtown Conference Center',
    date: 'March 15, 2024',
    time: '2:00 PM',
    location: '123 Business District, New York',
    status: 'pending',
    paid: true,
    image: '🏢'
  },
  {
    id: 2,
    type: 'service',
    name: 'Elite Photography Services',
    date: 'March 20, 2024',
    time: '10:00 AM',
    location: 'Coverage Area: Manhattan & Brooklyn',
    status: 'upcoming',
    paid: true,
    image: '📸'
  },
  {
    id: 3,
    type: 'venue',
    name: 'Garden Paradise Wedding Venue',
    date: 'February 14, 2024',
    time: '6:00 PM',
    location: '456 Garden Lane, Brooklyn',
    status: 'completed',
    paid: true,
    image: '🌸'
  },
  {
    id: 4,
    type: 'service',
    name: 'Pro DJ Entertainment',
    date: 'January 30, 2024',
    time: '7:00 PM - 12:00 AM',
    location: 'Coverage Area: Queens & Manhattan',
    status: 'cancelled',
    paid: false,
    image: '🎵'
  }
];

export default function BookingManagement() {
  const [activeTab, setActiveTab] = useState<string>('all');

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'pending', label: 'Pending' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' }
  ];

  const filteredBookings = bookings.filter(booking => {
    if (activeTab === 'all') return true;
    return booking.status === activeTab;
  });
  const router = useRouter();
  const ViewDetails = () => {
    router.push('/home/mybookings/booking-details');
    
  }

  const getStatusButton = (status: BookingStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-[#FFF4E5] text-[#FFB94F]">
            <Clock4 className='w-4 h-4'/> &nbsp;Pending
          </span>
        );
      case 'upcoming':
        return (
          <span className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-[#FEE5E5] text-[#B74140]">
           <Clock4 className='w-4 h-4'/> &nbsp;Upcoming
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-[#E5F9F0] text-[#3CCF91]">
            ✓ Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-[#FFE5E5] text-[#FF5A5A]">
            ✕ Cancelled
          </span>
        );
    }
  };

  const getActionButton = (status: BookingStatus) => {
    switch (status) {
      case 'pending':
      case 'upcoming':
        return (
          <button className="px-4 py-2 bg-[#2B7FFF] text-white rounded-lg text-sm font-medium hover:bg-[#1E5FCC] transition-colors">
            Complete Payment
          </button>
        );
      case 'completed':
        return (
          <button className="px-4 py-2 bg-[#3CCF91] text-white rounded-lg text-sm font-medium hover:bg-[#2DB67D] transition-colors flex items-center gap-1">
            <Star size={16} />
            Leave Review
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen ">
      <div className="">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6 overflow-x-auto">
          <div className="flex border-b border-gray-200 min-w-max md:min-w-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'text-[#2B7FFF] border-b-2 border-[#2B7FFF]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Booking Cards */}
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-lg shadow-sm p-4 md:p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Image */}
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center text-3xl">
                    {booking.image}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-grow min-w-0">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${
                        booking.type === 'venue'
                          ? 'bg-[#EFF6FF] text-[#1D4ED8]'
                          : 'bg-[#F3E8FF] text-[#7E22CE]'
                      }`}
                    >
                      {booking.type === 'venue' ? 'Venue' : 'Service Provider'}
                    </span>
                    {booking.paid && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-[#DCFCE7] text-[#15803D]">
                        Paid
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {booking.name}
                  </h3>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {booking.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {booking.time}
                    </span>
                  </div>
                  
                  <div className="flex items-start gap-1 text-sm text-gray-600 mt-1">
                    <MapPin size={14} className="flex-shrink-0 mt-0.5" />
                    <span className="break-words">{booking.location}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-row md:flex-row items-center gap-3 md:ml-auto">
                  <div className="flex-grow md:flex-grow-0 w-full md:w-auto">
                    {getStatusButton(booking.status)}
                  </div>
                  <div className="flex-grow md:flex-grow-0 w-full md:w-auto">
                    {getActionButton(booking.status)}
                  </div>
                  <button onClick={ViewDetails} className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex">
                    <Eye size={20} />&nbsp;View
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredBookings.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <p className="text-gray-500">No bookings found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}