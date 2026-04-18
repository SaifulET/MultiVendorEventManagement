'use client';

import React, { useEffect, useState } from 'react';
import {
  FileText,
  Clock,
  Check,
  X,
  Eye,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import { getApiErrorMessage } from '@/lib/api';
import {
  approveServiceProviderBooking,
  fetchServiceProviderBookings,
  fetchServiceProviderBookingStats,
  formatBookingDate,
  formatBookingTime,
  getBookingStatus,
  getBookingStatusLabel,
  getCustomerAvatar,
  getCustomerEmail,
  getCustomerName,
  getServiceName,
  getServiceType,
  rejectServiceProviderBooking,
  type ServiceProviderBooking,
  type ServiceProviderBookingMeta,
  type ServiceProviderBookingStats,
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
    type: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  time: string;
}

const ITEMS_PER_PAGE = 10;

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
    type: getServiceType(booking),
  },
  status: getBookingStatus(booking),
  time: formatBookingTime(booking.hours, booking.durationHours),
});

export default function BookingRequest() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<ServiceProviderBookingStats>({
    accepted: 0,
    pending: 0,
    rejected: 0,
    totalRequests: 0,
  });
  const [meta, setMeta] = useState<ServiceProviderBookingMeta | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [loadingActionId, setLoadingActionId] = useState<string | null>(null);
  const router = useRouter();

  const loadBookings = async (page: number) => {
    const [bookingsResponse, statsResponse] = await Promise.all([
      fetchServiceProviderBookings({
        limit: ITEMS_PER_PAGE,
        page,
      }),
      fetchServiceProviderBookingStats(),
    ]);

    setBookings((bookingsResponse.data ?? []).map(mapBooking));
    setMeta(bookingsResponse.meta ?? null);
    setStats(statsResponse);
  };

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      try {
        setIsLoading(true);
        setError('');

        const [bookingsResponse, statsResponse] = await Promise.all([
          fetchServiceProviderBookings({
            limit: ITEMS_PER_PAGE,
            page: currentPage,
          }),
          fetchServiceProviderBookingStats(),
        ]);

        if (!isMounted) {
          return;
        }

        setBookings((bookingsResponse.data ?? []).map(mapBooking));
        setMeta(bookingsResponse.meta ?? null);
        setStats(statsResponse);
      } catch (fetchError) {
        if (!isMounted) {
          return;
        }

        setError(getApiErrorMessage(fetchError));
        setBookings([]);
        setMeta(null);
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
  }, [currentPage]);

  const totalPages = meta?.totalPages ?? 1;
  const startIndex = meta ? (meta.page - 1) * meta.limit + 1 : 0;
  const endIndex = meta ? Math.min(meta.page * meta.limit, meta.total) : 0;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let page = 1; page <= totalPages; page += 1) {
        pages.push(page);
      }
      return pages;
    }

    pages.push(1);

    if (currentPage > 3) {
      pages.push('...');
    }

    for (let page = Math.max(2, currentPage - 1); page <= Math.min(totalPages - 1, currentPage + 1); page += 1) {
      pages.push(page);
    }

    if (currentPage < totalPages - 2) {
      pages.push('....');
    }

    if (!pages.includes(totalPages)) {
      pages.push(totalPages);
    }

    return pages;
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleAction = async (bookingId: string, action: 'approve' | 'reject') => {
    try {
      setLoadingActionId(bookingId);

      if (action === 'approve') {
        await approveServiceProviderBooking(bookingId);
      } else {
        await rejectServiceProviderBooking(bookingId);
      }

      const nextPage = bookings.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;

      if (nextPage !== currentPage) {
        setCurrentPage(nextPage);
        return;
      }

      await loadBookings(currentPage);
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

        <div className="bg-white rounded-2xl border border-[#E5E7EB]">
          <div className="px-[24px] py-[20px] border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Recent Booking Requests</h2>
          </div>

          {error ? (
            <div className="mx-6 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

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
                        <p className="text-xs text-gray-500">
                          {booking.service.type}
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
                          {getBookingStatusLabel({ _id: booking.id, status: booking.status })}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {booking.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleAction(booking.id, 'approve')}
                                disabled={loadingActionId === booking.id}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white text-xs font-medium rounded-lg hover:bg-green-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                              >
                                <Check className="w-3.5 h-3.5" />
                                Approve
                              </button>
                              <button
                                onClick={() => handleAction(booking.id, 'reject')}
                                disabled={loadingActionId === booking.id}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-red-200 text-[#B74140] text-xs font-medium rounded-lg hover:bg-red-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                              >
                                <X className="w-3.5 h-3.5" />
                                Decline
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => router.push(`/serviceprovider/bookingRequest/${booking.id}`)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
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

          <div className="px-6 py-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#B74140] font-medium">
                SHOWING {bookings.length ? startIndex : 0}-{bookings.length ? endIndex : 0} OF {meta?.total ?? 0}
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
}
