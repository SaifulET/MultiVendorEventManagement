'use client';

import React, { useState } from 'react';
import { 
  Home, 
  Calendar, 
  DollarSign, 
  Star, 
  Check, 
  X, 
  Eye, 
  ChevronRight 
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Booking {
  id: string;
  client: {
    name: string;
    email: string;
    avatar: string;
  };
  date: string;
  time: string;
  service: {
    name: string;
    type: string;
  };
  status: 'pending' | 'approved' | 'declined';
}

interface VenueDashboardProps {
  bookings?: Booking[];
  onApprove?: (bookingId: string) => Promise<void> | void;
  onDecline?: (bookingId: string) => Promise<void> | void;
  onViewDetails?: (bookingId: string) => void;
  onViewAll?: () => void;
  stats?: {
    totalVenues?: number;
    totalVenuesChange?: string;
    upcomingBookings?: number;
    upcomingBookingsChange?: string;
    monthlyRevenue?: number;
    monthlyRevenueChange?: string;
    averageRating?: number;
    averageRatingChange?: string;
  };
}

const defaultBookings: Booking[] = [
  {
    id: '1',
    client: {
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      avatar: 'https://i.pravatar.cc/150?img=1'
    },
    date: 'Dec 28, 2024',
    time: '6:00 PM - 11:00 PM',
    service: {
      name: 'Grand Ballroom',
      type: 'Corporate Event'
    },
    status: 'pending'
  },
  {
    id: '2',
    client: {
      name: 'Michael Chen',
      email: 'm.chen@company.com',
      avatar: 'https://i.pravatar.cc/150?img=12'
    },
    date: 'Dec 30, 2024',
    time: '2:00 PM - 8:00 PM',
    service: {
      name: 'Garden Terrace',
      type: 'Wedding Reception'
    },
    status: 'pending'
  },
  {
    id: '3',
    client: {
      name: 'Emily Rodriguez',
      email: 'emily.r@events.com',
      avatar: 'https://i.pravatar.cc/150?img=5'
    },
    date: 'Jan 5, 2025',
    time: '10:00 AM - 4:00 PM',
    service: {
      name: 'Conference Hall A',
      type: 'Business Meeting'
    },
    status: 'approved'
  },
  {
    id: '4',
    client: {
      name: 'David Park',
      email: 'david.park@startup.io',
      avatar: 'https://i.pravatar.cc/150?img=15'
    },
    date: 'Jan 8, 2025',
    time: '7:00 PM - 12:00 AM',
    service: {
      name: 'Rooftop Lounge',
      type: 'Product Launch'
    },
    status: 'pending'
  },
  {
    id: '5',
    client: {
      name: 'Lisa Thompson',
      email: 'lisa.t@creative.com',
      avatar: 'https://i.pravatar.cc/150?img=9'
    },
    date: 'Jan 12, 2025',
    time: '5:00 PM - 10:00 PM',
    service: {
      name: 'Art Gallery Space',
      type: 'Exhibition Opening'
    },
    status: 'pending'
  }
];

const VenueDashboard: React.FC<VenueDashboardProps> = ({ 
  bookings: initialBookings = defaultBookings,
  onApprove,
  onDecline,
  onViewDetails,
  onViewAll,
  stats = {}
}) => {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [loadingStates, setLoadingStates] = useState<Record<string, 'approving' | 'declining' | null>>({});
  const [upcomingBookingsCount, setUpcomingBookingsCount] = useState(47);
  const [monthlyRevenue, setMonthlyRevenue] = useState(18420);

  const {
    totalVenues = 24,
    totalVenuesChange = '+12%',
    upcomingBookingsChange = '+8%',
    monthlyRevenueChange = '+24%',
    averageRating = 4.8,
    averageRatingChange = '+0.2'
  } = stats;

  // Mock API call function
  const mockApiCall = (action: 'approve' | 'decline', bookingId: string): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`${action} booking:`, bookingId);
        resolve();
      }, 1000);
    });
  };

  const handleApprove = async (bookingId: string) => {
    // Set loading state for this specific booking
    setLoadingStates(prev => ({ ...prev, [bookingId]: 'approving' }));

    try {
      // If parent component provided onApprove callback, use it
      if (onApprove) {
        await onApprove(bookingId);
      } else {
        // Otherwise, use mock API call
        await mockApiCall('approve', bookingId);
      }

      // Update local state
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'approved' as const }
            : booking
        )
      );

      // Update stats
      setUpcomingBookingsCount(prev => prev + 1);
      
      // Simulate revenue increase (you can adjust this logic based on your needs)
      const booking = bookings.find(b => b.id === bookingId);
      if (booking) {
        // Add a random revenue amount between 500 and 5000 for demonstration
        const revenueIncrease = Math.floor(Math.random() * 4500) + 500;
        setMonthlyRevenue(prev => prev + revenueIncrease);
      }

    } catch (error) {
      console.error('Error approving booking:', error);
      // You could add error handling UI here
    } finally {
      // Clear loading state
      setLoadingStates(prev => ({ ...prev, [bookingId]: null }));
    }
  };

  const handleDecline = async (bookingId: string) => {
    // Set loading state for this specific booking
    setLoadingStates(prev => ({ ...prev, [bookingId]: 'declining' }));

    try {
      // If parent component provided onDecline callback, use it
      if (onDecline) {
        await onDecline(bookingId);
      } else {
        // Otherwise, use mock API call
        await mockApiCall('decline', bookingId);
      }

      // Update local state
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'declined' as const }
            : booking
        )
      );

      // Update stats (decrease upcoming bookings count)
      setUpcomingBookingsCount(prev => Math.max(0, prev - 1));

    } catch (error) {
      console.error('Error declining booking:', error);
      // You could add error handling UI here
    } finally {
      // Clear loading state
      setLoadingStates(prev => ({ ...prev, [bookingId]: null }));
    }
  };

  const handleViewDetails = (bookingId: string) => {
    if (onViewDetails) {
      onViewDetails(bookingId);
    } else {
      console.log("View details for booking:", bookingId);
      router.push("/eventPlanner/bookingRequest/" + bookingId);
    }
  };

  const handleViewAll = () => {
    if (onViewAll) {
      onViewAll();
    } else {
      router.push("/eventPlanner/dashboard/bookingRequest")
    }
  };

  // Get loading state for a specific booking
  const getLoadingState = (bookingId: string) => {
    return loadingStates[bookingId] || null;
  };

  return (
    <div className="min-h-screen">
      <div className="">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Venues Card */}
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-[24px]">
            <div className="flex items-start justify-between mb-10">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-[#B74140]" />
              </div>
              <span className="text-xs font-medium text-green-500">{totalVenuesChange}</span>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-2">Total Services</p>
            <p className="text-3xl font-bold text-gray-900">{totalVenues}</p>
          </div>

          {/* Upcoming Bookings Card */}
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-[24px]">
            <div className="flex items-start justify-between mb-10">
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-500" />
              </div>
              <span className="text-xs font-medium text-green-500">{upcomingBookingsChange}</span>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-2">Upcoming Bookings</p>
            <p className="text-3xl font-bold text-gray-900">{upcomingBookingsCount}</p>
          </div>

          {/* Monthly Revenue Card */}
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-[24px]">
            <div className="flex items-start justify-between mb-10">
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-xs font-medium text-green-500">{monthlyRevenueChange}</span>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-2">Monthly Revenue</p>
            <p className="text-3xl font-bold text-gray-900">${monthlyRevenue.toLocaleString()}</p>
          </div>

          {/* Average Rating Card */}
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-[24px]">
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Star className="w-5 h-5 text-purple-600 fill-purple-600" />
              </div>
              <span className="px-2 py-1 bg-green-50 text-green-600 text-sm font-medium rounded-lg">
                {averageRatingChange}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{averageRating}</p>
            <p className="text-base text-gray-600">Average Rating</p>
          </div>
        </div>

        {/* Recent Booking Requests Table */}
        <div className="bg-white border border-gray-100 rounded-xl border border-[#E5E7EB]">
          {/* Table Header */}
          <div className="border-b  border-[#E5E7EB] px-6 py-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                Recent Booking Requests
              </h2>
              <button 
                onClick={handleViewAll}
                className="flex items-center gap-2 text-sm font-medium text-[#B74140] hover:text-[#A03A39] transition-colors"
              >
                View All
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-[#E5E7EB]">
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Client Name
                    </span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Date
                    </span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Service Name
                    </span>
                  </th>
                  <th className="px-6 py-4 text-center">
                    <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </span>
                  </th>
                  <th className="px-6 py-4 text-center">
                    <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Action
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.map((booking) => {
                  const isLoading = getLoadingState(booking.id);
                  const isApproving = isLoading === 'approving';
                  const isDeclining = isLoading === 'declining';
                  
                  return (
                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={booking.client.avatar}
                            alt={booking.client.name}
                            className="w-10 h-10 rounded-full"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {booking.client.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {booking.client.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">{booking.date}</p>
                        <p className="text-xs text-gray-500">{booking.time}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">
                          {booking.service.name}
                        </p>
                        
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${
                              booking.status === 'approved'
                                ? 'bg-green-100 text-green-800'
                                : booking.status === 'declined'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            <svg
                              className="w-2 h-2"
                              fill="currentColor"
                              viewBox="0 0 8 8"
                            >
                              <circle cx="4" cy="4" r="3" />
                            </svg>
                            {booking.status.charAt(0).toUpperCase() +
                              booking.status.slice(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {booking.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(booking.id)}
                                disabled={isLoading !== null}
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1 transition-colors ${
                                  isApproving
                                    ? 'bg-green-400 cursor-not-allowed'
                                    : 'bg-green-500 hover:bg-green-600'
                                } text-white`}
                              >
                                {isApproving ? (
                                  <>
                                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Approving...
                                  </>
                                ) : (
                                  <>
                                    <Check className="w-3 h-3" />
                                    Approve
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => handleDecline(booking.id)}
                                disabled={isLoading !== null}
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1 transition-colors ${
                                  isDeclining
                                    ? 'bg-red-200 cursor-not-allowed'
                                    : 'bg-red-50 hover:bg-red-100'
                                } text-red-500`}
                              >
                                {isDeclining ? (
                                  <>
                                    <div className="w-3 h-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                                    Declining...
                                  </>
                                ) : (
                                  <>
                                    <X className="w-3 h-3" />
                                    Decline
                                  </>
                                )}
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleViewDetails(booking.id)}
                            disabled={isLoading !== null}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1 transition-colors ${
                              isLoading !== null
                                ? 'bg-gray-100 cursor-not-allowed text-gray-400'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                            }`}
                          >
                            <Eye className="w-3 h-3" />
                            View Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueDashboard;