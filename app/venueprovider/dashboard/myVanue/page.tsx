'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Edit2,
  Video,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import { api, getApiErrorMessage } from '@/lib/api';

interface VenueApiItem {
  _id: string;
  information?: {
    venueName?: string;
    venueType?: string;
    addressLine?: string;
    city?: string;
    area?: string;
  };
  pricing?: {
    basePrice?: number;
    currency?: string;
  };
  capacity?: {
    maximumGuests?: number;
  };
  media?: {
    galleryImages?: string[];
    videoUrl?: string;
  };
  publishStatus?: string;
  createdAt?: string;
}

interface VenueListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface VenueListResponse {
  success: boolean;
  meta: VenueListMeta;
  data: VenueApiItem[];
}

interface VenueCardData {
  id: string;
  name: string;
  type: string;
  location: string;
  capacity: number | null;
  price: number | null;
  currency: string;
  status: string;
  createdDate: string;
  imageUrl: string | null;
  hasVideo: boolean;
}

const ITEMS_PER_PAGE = 10;

const formatPublishStatus = (status?: string) => {
  if (!status) {
    return 'Pending';
  }

  return status
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const formatCreatedDate = (value?: string) => {
  if (!value) {
    return 'N/A';
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return 'N/A';
  }

  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatCurrencyValue = (amount: number | null, currency: string) => {
  if (amount === null) {
    return 'N/A';
  }

  return `${currency} ${amount.toLocaleString()}`;
};

const getStatusBadgeClasses = (status: string) => {
  const normalized = status.toLowerCase();

  if (normalized === 'published') {
    return 'bg-green-100 text-green-700';
  }

  if (normalized === 'pending') {
    return 'bg-yellow-100 text-yellow-700';
  }

  return 'bg-red-100 text-red-700';
};

export default function VenueManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [venues, setVenues] = useState<VenueApiItem[]>([]);
  const [meta, setMeta] = useState<VenueListMeta>({
    page: 1,
    limit: ITEMS_PER_PAGE,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        setIsLoading(true);
        setError('');

        const response = await api.get<VenueListResponse>(
          '/api/v1/venue-provider/venues',
          {
            params: {
              page: currentPage,
              limit: ITEMS_PER_PAGE,
              sortBy: 'createdAt',
              sortOrder: 'desc',
            },
          }
        );
        console.log(response,"kdk")

        setVenues(Array.isArray(response.data.data) ? response.data.data : []);
        setMeta(
          response.data.meta ?? {
            page: currentPage,
            limit: ITEMS_PER_PAGE,
            total: 0,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
          }
        );
      } catch (fetchError) {
        setError(getApiErrorMessage(fetchError));
      } finally {
        setIsLoading(false);
      }
    };

    fetchVenues();
  }, [currentPage]);

  const mappedVenues = useMemo<VenueCardData[]>(() => {
    return venues.map((venue) => {
      const information = venue.information ?? {};
      const pricing = venue.pricing ?? {};
      const capacity = venue.capacity ?? {};
      const media = venue.media ?? {};
      const locationParts = [
        information.addressLine,
        information.area,
        information.city,
      ].filter(Boolean);

      return {
        id: venue._id,
        name: information.venueName?.trim() || 'Untitled Venue',
        type: information.venueType?.trim() || 'Venue',
        location: locationParts.length ? locationParts.join(', ') : 'N/A',
        capacity:
          typeof capacity.maximumGuests === 'number'
            ? capacity.maximumGuests
            : null,
        price:
          typeof pricing.basePrice === 'number' ? pricing.basePrice : null,
        currency: pricing.currency?.trim() || 'BDT',
        status: formatPublishStatus(venue.publishStatus),
        createdDate: formatCreatedDate(venue.createdAt),
        imageUrl:
          Array.isArray(media.galleryImages) &&
          typeof media.galleryImages[0] === 'string'
            ? media.galleryImages[0]
            : null,
        hasVideo:
          typeof media.videoUrl === 'string' && media.videoUrl.trim().length > 0,
      };
    });
  }, [venues]);

  const filteredVenues = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return mappedVenues;
    }

    return mappedVenues.filter((venue) => {
      return (
        venue.name.toLowerCase().includes(normalizedQuery) ||
        venue.location.toLowerCase().includes(normalizedQuery) ||
        venue.type.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [mappedVenues, searchQuery]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > meta.totalPages || page === currentPage) {
      return;
    }

    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEdit = (id: string) => {
    router.push(`/venueprovider/dashboard/myVanue/${id}`);
  };

  const getPageNumbers = () => {
    const totalPages = meta.totalPages || 1;
    const pages: Array<number | string> = [];

    if (totalPages <= 5) {
      for (let page = 1; page <= totalPages; page += 1) {
        pages.push(page);
      }
      return pages;
    }

    if (currentPage <= 3) {
      return [1, 2, 3, 4, '...', totalPages];
    }

    if (currentPage >= totalPages - 2) {
      return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  return (
    <div className="min-h-screen">
      <div>
        <div className="flex justify-between p-[32px]">
          <h1 className="font-inter text-2xl font-bold leading-8 tracking-normal">
            My Venues
          </h1>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
            <input
              type="text"
              placeholder="Search by venue name"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {error ? (
          <div className="mx-8 mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {isLoading ? (
          <div className="mx-8 rounded-lg border border-[#E5E7EB] bg-white p-12 text-center text-gray-500">
            Loading venues...
          </div>
        ) : (
          <>
            <div className="hidden overflow-hidden rounded-lg border border-[#E5E7EB] bg-white lg:block">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-y border-[#E5E7EB] bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium leading-none tracking-normal text-[#676767]">
                        Venue Name
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium leading-none tracking-normal text-[#676767]">
                        Location
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium leading-none tracking-normal text-[#676767]">
                        Capacity
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium leading-none tracking-normal text-[#676767]">
                        Price
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium leading-none tracking-normal text-[#676767]">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium leading-none tracking-normal text-[#676767]">
                        Created Date
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium leading-none tracking-normal text-[#676767]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredVenues.map((venue) => (
                      <tr key={venue.id} className="transition-colors hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 text-xs text-gray-500">
                              {venue.imageUrl ? (
                                <img
                                  src={venue.imageUrl}
                                  alt={venue.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span>No Image</span>
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{venue.name}</div>
                              <div className="text-sm text-gray-500">{venue.type}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-700">{venue.location}</td>
                        <td className="px-6 py-4 text-gray-700">
                          {venue.capacity !== null ? `${venue.capacity} guests` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-900">
                          {formatCurrencyValue(venue.price, venue.currency)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClasses(venue.status)}`}
                          >
                            {venue.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-700">{venue.createdDate}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(venue.id)}
                              className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              className={`rounded-lg p-2 transition-colors ${
                                venue.hasVideo
                                  ? 'text-purple-600 hover:bg-purple-50'
                                  : 'cursor-not-allowed text-gray-300'
                              }`}
                              disabled={!venue.hasVideo}
                            >
                              <Video className="h-4 w-4" />
                            </button>
                            <button className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-4 lg:hidden">
              {filteredVenues.map((venue) => (
                <div
                  key={venue.id}
                  className="rounded-lg border border-[#E5E7EB] bg-white p-4"
                >
                  <div className="mb-3 flex items-start gap-3">
                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 text-xs text-gray-500">
                      {venue.imageUrl ? (
                        <img
                          src={venue.imageUrl}
                          alt={venue.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span>No Image</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="mb-1 text-lg font-semibold text-gray-900">
                        {venue.name}
                      </h3>
                      <p className="mb-2 text-sm text-gray-500">{venue.type}</p>
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClasses(venue.status)}`}
                      >
                        {venue.status}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Location:</span>
                      <span className="font-medium text-gray-900">{venue.location}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Capacity:</span>
                      <span className="font-medium text-gray-900">
                        {venue.capacity !== null ? `${venue.capacity} guests` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Price:</span>
                      <span className="font-bold text-gray-900">
                        {formatCurrencyValue(venue.price, venue.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Created:</span>
                      <span className="font-medium text-gray-900">{venue.createdDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 border-t border-[#E5E7EB] pt-3">
                    <button
                      onClick={() => handleEdit(venue.id)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-blue-600 transition-colors hover:bg-blue-100"
                    >
                      <Edit2 className="h-4 w-4" />
                      <span className="text-sm font-medium">Edit</span>
                    </button>
                    <button
                      className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 transition-colors ${
                        venue.hasVideo
                          ? 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                          : 'cursor-not-allowed bg-gray-50 text-gray-300'
                      }`}
                      disabled={!venue.hasVideo}
                    >
                      <Video className="h-4 w-4" />
                      <span className="text-sm font-medium">Media</span>
                    </button>
                    <button className="flex items-center justify-center rounded-lg bg-red-50 px-4 py-2 text-[#B74140] transition-colors hover:bg-red-100">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredVenues.length === 0 ? (
              <div className="rounded-lg border border-[#E5E7EB] bg-white p-12 text-center">
                <p className="text-lg text-gray-500">
                  No venues found matching your search.
                </p>
              </div>
            ) : null}

            {meta.total > 0 ? (
              <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-lg border border-[#E5E7EB] bg-white p-4 sm:flex-row">
                <div className="text-sm text-gray-600">
                  SHOWING {(meta.page - 1) * meta.limit + 1}-
                  {Math.min(meta.page * meta.limit, meta.total)} OF {meta.total}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!meta.hasPrevPage}
                    className="rounded-lg border border-[#E5E7EB] p-2 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  <div className="flex items-center gap-1">
                    {getPageNumbers().map((page, index) => (
                      <React.Fragment key={index}>
                        {page === '...' ? (
                          <span className="px-3 py-2 text-gray-400">...</span>
                        ) : (
                          <button
                            onClick={() => handlePageChange(page as number)}
                            className={`min-w-[40px] rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                              currentPage === page
                                ? 'bg-[#B74140] text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {page}
                          </button>
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!meta.hasNextPage}
                    className="rounded-lg border border-[#E5E7EB] p-2 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
