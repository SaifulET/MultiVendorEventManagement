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
  ChevronRight, 
  BookPlus,
  CircleCheck
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import check from "@/public/check.svg";
import Image from 'next/image';
import MyBookingsPage from '@/app/component/home/mybookings/MyBookingPage';
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
  const [upcomingBookingsCount, setUpcomingBookingsCount] = useState(12);
  const [completedBookingsCount, setCompletedBookingsCount] = useState(48);

  

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
      router.push("/home/mybookings/" + bookingId);
    }
  };

  const handleViewAll = () => {
    if (onViewAll) {
      onViewAll();
    } else {
      router.push("/home/dashboard/mybookings")
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[50px] mb-[32px]">

          {/* Upcoming Bookings Card */}
          <div className="bg-[#FAFAFA] border border-gray-200 rounded-xl p-[25px]">
            <div className="flex items-start justify-between mb-[4px]">
              <p className="font-medium text-[14px] leading-[20px] tracking-normal text-[#6B6B6B] ">Upcoming Bookings</p>
              <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                <BookPlus className="w-5 h-5 text-[#B74140]"/>
              </div>
            </div>
            <p className="text-[24px] font-bold text-gray-900">{completedBookingsCount}</p>
          </div>


          {/* Completed Bookings Card */}
          <div className="bg-[#FAFAFA] border border-gray-200 rounded-xl p-[25px]">
            <div className="flex items-start justify-between mb-[4px]">
              <p className="font-medium text-[14px] leading-[20px] tracking-normal text-[#6B6B6B] ">Completed Bookings</p>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                 <Image src={check} alt="check" width={20} height={20}/>
              </div>
            </div>
            <p className="text-[24px] font-bold text-gray-900">{upcomingBookingsCount}</p>
          </div>

         


         

         
        </div>

       <MyBookingsPage/>
      </div>
    </div>
  );
};

export default VenueDashboard;