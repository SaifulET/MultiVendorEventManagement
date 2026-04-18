'use client';

import React, { useEffect, useState } from 'react';
import {
  Home,
  Calendar,
  DollarSign,
  Star,
  Check,
  X,
  Eye,
  ChevronRight,
  LoaderCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import { getApiErrorMessage } from '@/lib/api';
import {
  approveServiceProviderBooking,
  fetchServiceProviderBookings,
  formatBookingDate,
  formatBookingTime,
  getBookingStatus,
  getBookingStatusLabel,
  getCustomerAvatar,
  getCustomerEmail,
  getCustomerName,
  getServiceName,
  rejectServiceProviderBooking,
  type ServiceProviderBooking,
} from '@/lib/service-provider-bookings';

interface Booking {
  client: {
    avatar: string;
    email: string;
    name: string;
  };
  date: string;
  id: string;
  service: {
    name: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  time: string;
}

const DASHBOARD_LIMIT = 5;

const mapBooking = (booking: ServiceProviderBooking): Booking => ({
  client: {
    avatar: getCustomerAvatar(booking),
    email: getCustomerEmail(booking),
    name: getCustomerName(booking),
  },
  date: formatBookingDate(booking.bookingDate),
  id: booking._id,
  service: {
    name: getServiceName(booking),
  },
  status: getBookingStatus(booking),
  time: formatBookingTime(booking.hours, booking.durationHours),
});

export default function VenueDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [loadingActionId, setLoadingActionId] = useState<string | null>(null);
  const router = useRouter();

  const loadBookings = async () => {
    const response = await fetchServiceProviderBookings({
      limit: DASHBOARD_LIMIT,
      page: 1,
    });

    setBookings((response.data ?? []).map(mapBooking));
  };

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      try {
        setIsLoading(true);
        setError('');

        const response = await fetchServiceProviderBookings({
          limit: DASHBOARD_LIMIT,
          page: 1,
        });

        if (!isMounted) {
          return;
        }

        setBookings((response.data ?? []).map(mapBooking));
      } catch (fetchError) {
        if (!isMounted) {
          return;
        }

        setError(getApiErrorMessage(fetchError));
        setBookings([]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initialize();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAction = async (bookingId: string, action: 'approve' | 'reject') => {
    try {
      setLoadingActionId(bookingId);

      if (action === 'approve') {
        await approveServiceProviderBooking(bookingId);
      } else {
        await rejectServiceProviderBooking(bookingId);
      }

      await loadBookings();
    } catch (actionError) {
      setError(getApiErrorMessage(actionError));
    } finally {
      setLoadingActionId(null);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-[24px]">
            <div className="flex items-start justify-between mb-10">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-[#B74140]" />
              </div>
              <span className="text-xs font-medium text-green-500">+12%</span>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-2">Total Services</p>
            <p className="text-3xl font-bold text-gray-900">24</p>
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded-xl p-[24px]">
            <div className="flex items-start justify-between mb-10">
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-500" />
              </div>
              <span className="text-xs font-medium text-green-500">+8%</span>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-2">Upcoming Bookings</p>
            <p className="text-3xl font-bold text-gray-900">47</p>
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded-xl p-[24px]">
            <div className="flex items-start justify-between mb-10">
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-xs font-medium text-green-500">+24%</span>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-2">Monthly Revenue</p>
            <p className="text-3xl font-bold text-gray-900">£18,420</p>
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded-xl p-[24px]">
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Star className="w-5 h-5 text-purple-600 fill-purple-600" />
              </div>
              <span className="px-2 py-1 bg-green-50 text-green-600 text-sm font-medium rounded-lg">
                +0.2
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">4.8</p>
            <p className="text-base text-gray-600">Average Rating</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl border border-[#E5E7EB]">
          <div className="border-b  border-[#E5E7EB] px-6 py-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                Recent Booking Requests
              </h2>
              <button
                onClick={() => router.push('/serviceprovider/dashboard/bookingRequest')}
                className="flex items-center gap-2 text-sm font-medium text-[#B74140] hover:text-[#A03A39] transition-colors"
              >
                View All
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {error ? (
            <div className="mx-6 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

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
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                      <div className="flex items-center justify-center gap-3">
                        <LoaderCircle className="w-5 h-5 animate-spin" />
                        Loading booking requests...
                      </div>
                    </td>
                  </tr>
                ) : bookings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                      No booking requests found.
                    </td>
                  </tr>
                ) : (
                  bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={booking.client.avatar}
                            alt={booking.client.name}
                            className="w-10 h-10 rounded-full object-cover"
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
                                : booking.status === 'rejected'
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
                            {getBookingStatusLabel({ _id: booking.id, status: booking.status })}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {booking.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleAction(booking.id, 'approve')}
                                disabled={loadingActionId === booking.id}
                                className="px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1 transition-colors bg-green-500 hover:bg-green-600 text-white disabled:opacity-60 disabled:cursor-not-allowed"
                              >
                                <Check className="w-3 h-3" />
                                Approve
                              </button>
                              <button
                                onClick={() => handleAction(booking.id, 'reject')}
                                disabled={loadingActionId === booking.id}
                                className="px-3 py-1.5 bg-red-50 text-red-500 text-xs font-medium rounded-lg hover:bg-red-100 flex items-center gap-1 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                              >
                                <X className="w-3 h-3" />
                                Decline
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => router.push(`/serviceprovider/bookingRequest/${booking.id}`)}
                            className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-200 flex items-center gap-1 transition-colors"
                          >
                            <Eye className="w-3 h-3" />
                            View Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
