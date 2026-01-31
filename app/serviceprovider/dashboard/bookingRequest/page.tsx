'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Clock, 
  Check, 
  X, 
  Eye, 
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface Booking {
  id: string;
  client: {
    name: string;
    email: string;
    avatar: string;
  };
  date: string;
  time: string;
  venue: {
    name: string;
    type: string;
  };
  status: 'pending' | 'approved' | 'rejected';
}
import { useRouter } from 'next/navigation';

interface VenueDashboardProps {
  bookings?: Booking[];
  onApprove?: (bookingId: string) => void;
  onDecline?: (bookingId: string) => void;
  onViewDetails?: (bookingId: string) => void;
  itemsPerPage?: number;
  stats?: {
    totalRequests?: number;
    pending?: number;
    accepted?: number;
    rejected?: number;
  };
}

// Generate sample data
const generateSampleBookings = (count: number): Booking[] => {
  const names = [
    { name: 'Sarah Johnson', email: 'sarah.j@email.com', avatar: 'https://i.pravatar.cc/150?img=1' },
    { name: 'Michael Chen', email: 'm.chen@company.com', avatar: 'https://i.pravatar.cc/150?img=12' },
    { name: 'Emily Rodriguez', email: 'emily.r@events.com', avatar: 'https://i.pravatar.cc/150?img=5' },
    { name: 'David Park', email: 'david.park@startup.io', avatar: 'https://i.pravatar.cc/150?img=15' },
    { name: 'Lisa Thompson', email: 'lisa.t@creative.com', avatar: 'https://i.pravatar.cc/150?img=9' },
    { name: 'James Wilson', email: 'james.w@corp.com', avatar: 'https://i.pravatar.cc/150?img=13' },
    { name: 'Maria Garcia', email: 'maria.g@events.co', avatar: 'https://i.pravatar.cc/150?img=10' },
    { name: 'Robert Brown', email: 'robert.b@business.com', avatar: 'https://i.pravatar.cc/150?img=14' },
    { name: 'Jennifer Lee', email: 'jennifer.l@company.io', avatar: 'https://i.pravatar.cc/150?img=24' },
    { name: 'William Davis', email: 'william.d@startup.co', avatar: 'https://i.pravatar.cc/150?img=33' }
  ];

  const venues = [
    { name: 'Grand Ballroom', type: 'Corporate Event' },
    { name: 'Garden Terrace', type: 'Wedding Reception' },
    { name: 'Conference Hall A', type: 'Business Meeting' },
    { name: 'Rooftop Lounge', type: 'Product Launch' },
    { name: 'Art Gallery Space', type: 'Exhibition Opening' },
    { name: 'Main Auditorium', type: 'Conference' },
    { name: 'Sky Lounge', type: 'Networking Event' },
    { name: 'Banquet Hall', type: 'Gala Dinner' }
  ];

  const statuses: ('pending' | 'approved' | 'rejected')[] = ['pending', 'approved', 'rejected'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `booking-${i + 1}`,
    client: names[i % names.length],
    date: `Jan ${5 + (i % 25)}, 2025`,
    time: `${6 + (i % 6)}:00 PM - ${10 + (i % 3)}:00 PM`,
    venue: venues[i % venues.length],
    status: i < 5 ? 'pending' : statuses[i % 3]
  }));
};

const BookingRequest: React.FC<VenueDashboardProps> = ({ 
  bookings: initialBookings,
  onApprove,
  onDecline,
  onViewDetails,
  itemsPerPage = 8,
  stats: initialStats
}) => {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings || generateSampleBookings(250));
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  // Update bookings when initialBookings prop changes
  useEffect(() => {
    if (initialBookings) {
      setBookings(initialBookings);
    }
  }, [initialBookings]);

  // Calculate stats from current bookings state
  const stats = initialStats || {
    totalRequests: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    accepted: bookings.filter(b => b.status === 'approved').length,
    rejected: bookings.filter(b => b.status === 'rejected').length
  };

  // Pagination calculations
  const totalPages = Math.ceil(bookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBookings = bookings.slice(startIndex, endIndex);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= 7) {
      // Show all pages if total is 7 or less
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      // Show pages around current page
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('....');
      }
      
      // Common page numbers
      if (!pages.includes(30) && totalPages >= 30) pages.push(30);
      if (!pages.includes(60) && totalPages >= 60) pages.push(60);
      if (!pages.includes(120) && totalPages >= 120) pages.push(120);
      
      // Always show last page
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const handleApprove = (bookingId: string) => {
    // Update local state
    setBookings(prevBookings => 
      prevBookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: 'approved' as const }
          : booking
      )
    );

    // Call parent callback if provided
    if (onApprove) {
      onApprove(bookingId);
    } else {
      console.log('Approve booking:', bookingId);
    }
  };

  const handleDecline = (bookingId: string) => {
    // Update local state
    setBookings(prevBookings => 
      prevBookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: 'rejected' as const }
          : booking
      )
    );

    // Call parent callback if provided
    if (onDecline) {
      onDecline(bookingId);
    } else {
      console.log('Decline booking:', bookingId);
    }
  };

  const handleViewDetails = (bookingId: string) => {
    console.log(bookingId)
    router.push("/serviceprovider/bookingRequest/"+bookingId);
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Requests Card */}
          <div className="bg-white rounded-2xl p-[24px] border border-[#E5E7EB]">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Total Requests</p>
                <p className="text-4xl font-bold text-gray-900">{stats.totalRequests}</p>
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-red-500" />
              </div>
            </div>
          </div>

          {/* Pending Card */}
          <div className="bg-white rounded-2xl p-[24px] border border-[#E5E7EB]">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Pending</p>
                <p className="text-4xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
          </div>

          {/* Accepted Card */}
          <div className="bg-white rounded-2xl p-[24px] border border-[#E5E7EB]">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Accepted</p>
                <p className="text-4xl font-bold text-green-600">{stats.accepted}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <Check className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </div>

          {/* Rejected Card */}
          <div className="bg-white rounded-2xl p-[24px] border border-[#E5E7EB]">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Rejected</p>
                <p className="text-4xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                <X className="w-6 h-6 text-red-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Booking Requests Table */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB]">
          {/* Table Header */}
          <div className="px-[24px] py-[20px] border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Recent Booking Requests</h2>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-4 text-left">
                    <span className="text-sm font-semibold text-gray-700">Client Name</span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-sm font-semibold text-gray-700">Date</span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-sm font-semibold text-gray-700">Venue Name</span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-sm font-semibold text-gray-700">Status</span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-sm font-semibold text-gray-700">Action</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentBookings.map((booking) => (
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
                        {booking.venue.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {booking.venue.type}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full ${
                          booking.status === 'approved'
                            ? 'bg-green-50 text-green-700'
                            : booking.status === 'rejected'
                            ? 'bg-red-50 text-[#B74140]'
                            : 'bg-yellow-50 text-yellow-700'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {booking.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(booking.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white text-xs font-medium rounded-lg hover:bg-green-600 transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleDecline(booking.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-red-200 text-[#B74140] text-xs font-medium rounded-lg hover:bg-red-50 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                              Decline
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleViewDetails(booking.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#B74140] font-medium">
                SHOWING {startIndex + 1}-{Math.min(endIndex, bookings.length)} OF {bookings.length}
              </p>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1">
                  {getPageNumbers().map((page, index) => (
                    <React.Fragment key={index}>
                      {typeof page === 'number' ? (
                        <button
                          onClick={() => goToPage(page)}
                          className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === page
                              ? 'bg-[#B74140] text-white'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {page}
                        </button>
                      ) : (
                        <span className="px-2 text-gray-400">{page}</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingRequest;