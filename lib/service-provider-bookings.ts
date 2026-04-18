import { api } from '@/lib/api';
import { formatHourRange } from '@/lib/booking';
import { formatDateDDMMYY } from '@/lib/date';

export interface ServiceProviderBookingMeta {
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
  page: number;
  total: number;
  totalPages: number;
}

interface BookingCustomer {
  email?: string | null;
  fullName?: string | null;
  phoneNumber?: string | null;
  profileImage?: string | null;
}

interface BookingServiceProfile {
  serviceCategory?: string | null;
  serviceDescription?: string | null;
  serviceName?: string | null;
}

interface BookingProvider {
  fullName?: string | null;
  profileImage?: string | null;
  serviceProvider?: BookingServiceProfile | null;
}

interface BookingPricing {
  currency?: string;
  platformFeeAmount?: number;
  subtotal?: number;
  taxAmount?: number;
  totalAmount?: number;
  unitAmount?: number;
}

interface BookingPayment {
  status?: string;
}

export interface ServiceProviderBooking {
  _id: string;
  bookingDate?: string;
  createdAt?: string;
  customer?: BookingCustomer | null;
  durationHours?: number;
  hours?: number[];
  location?: string;
  payment?: BookingPayment;
  pricing?: BookingPricing;
  provider?: BookingProvider | null;
  reservedSlots?: string[];
  specialInstructions?: string;
  status?: string;
  targetType?: string;
  updatedAt?: string;
}

interface ServiceProviderBookingsResponse {
  success: boolean;
  meta?: ServiceProviderBookingMeta;
  data?: ServiceProviderBooking[];
}

interface ServiceProviderBookingResponse {
  success: boolean;
  data?: ServiceProviderBooking;
}

export interface ServiceProviderBookingStats {
  accepted: number;
  pending: number;
  rejected: number;
  totalRequests: number;
}

interface FetchServiceProviderBookingsParams {
  limit: number;
  page: number;
  status?: string;
}

export const fetchServiceProviderBookings = async ({
  limit,
  page,
  status,
}: FetchServiceProviderBookingsParams) => {
  const params = new URLSearchParams({
    limit: String(limit),
    page: String(page),
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  if (status) {
    params.set('status', status);
  }

  const response = await api.get<ServiceProviderBookingsResponse>(`/api/v1/bookings/provider?${params.toString()}`);
  return response.data;
};

export const fetchServiceProviderBookingDetails = async (bookingId: string) => {
  const response = await api.get<ServiceProviderBookingResponse>(`/api/v1/bookings/${bookingId}`);
  return response.data;
};

export const approveServiceProviderBooking = async (bookingId: string) => {
  await api.patch(`/api/v1/bookings/service-provider/${bookingId}/approve`);
};

export const rejectServiceProviderBooking = async (bookingId: string) => {
  await api.patch(`/api/v1/bookings/service-provider/${bookingId}/reject`);
};

export const fetchServiceProviderBookingStats = async (): Promise<ServiceProviderBookingStats> => {
  const [allBookings, pendingBookings, approvedBookings, confirmedBookings, rejectedBookings] = await Promise.all([
    fetchServiceProviderBookings({ limit: 1, page: 1 }),
    fetchServiceProviderBookings({ limit: 1, page: 1, status: 'pending' }),
    fetchServiceProviderBookings({ limit: 1, page: 1, status: 'approved' }),
    fetchServiceProviderBookings({ limit: 1, page: 1, status: 'confirmed' }),
    fetchServiceProviderBookings({ limit: 1, page: 1, status: 'rejected' }),
  ]);

  return {
    accepted: (approvedBookings.meta?.total ?? 0) + (confirmedBookings.meta?.total ?? 0),
    pending: pendingBookings.meta?.total ?? 0,
    rejected: rejectedBookings.meta?.total ?? 0,
    totalRequests: allBookings.meta?.total ?? 0,
  };
};

const toTitleCase = (value?: string | null, fallback = 'N/A') => {
  if (!value?.trim()) {
    return fallback;
  }

  return value.replace(/_/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase());
};

const escapeSvgText = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

export const buildInitialAvatar = (name?: string | null) => {
  const safeName = (name?.trim() || 'User').slice(0, 32);
  const initials =
    safeName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'U';

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="40" fill="#F3F4F6" />
      <text x="40" y="46" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" fill="#6B7280">${escapeSvgText(initials)}</text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const getCustomerAvatar = (booking: ServiceProviderBooking) =>
  booking.customer?.profileImage || buildInitialAvatar(booking.customer?.fullName);

export const getCustomerName = (booking: ServiceProviderBooking) =>
  booking.customer?.fullName?.trim() || 'Customer';

export const getCustomerEmail = (booking: ServiceProviderBooking) =>
  booking.customer?.email?.trim() || 'Email unavailable';

export const getCustomerPhone = (booking: ServiceProviderBooking) =>
  booking.customer?.phoneNumber?.trim() || 'Phone unavailable';

export const getServiceName = (booking: ServiceProviderBooking) =>
  booking.provider?.serviceProvider?.serviceName?.trim() || booking.provider?.fullName?.trim() || 'Service';

export const getServiceType = (booking: ServiceProviderBooking) =>
  toTitleCase(booking.provider?.serviceProvider?.serviceCategory, toTitleCase(booking.targetType, 'Service'));

export const getServiceDescription = (booking: ServiceProviderBooking) =>
  booking.provider?.serviceProvider?.serviceDescription?.trim() || 'Service booking request';

export const getBookingStatus = (booking: ServiceProviderBooking): 'pending' | 'approved' | 'rejected' => {
  const normalized = booking.status?.trim().toLowerCase() ?? '';

  if (normalized === 'approved' || normalized === 'confirmed') {
    return 'approved';
  }

  if (['rejected', 'declined', 'cancelled', 'canceled'].includes(normalized)) {
    return 'rejected';
  }

  return 'pending';
};

export const getBookingStatusLabel = (booking: ServiceProviderBooking) =>
  getBookingStatus(booking) === 'approved' ? 'Approved' : toTitleCase(booking.status, 'Pending');

export const formatBookingDate = (value?: string) => formatDateDDMMYY(value, 'Date unavailable');

export const formatBookingTime = (hours?: number[], durationHours?: number) => {
  if (Array.isArray(hours) && hours.length > 0) {
    return formatHourRange(hours);
  }

  if (typeof durationHours === 'number' && durationHours > 0) {
    return `${durationHours} hour${durationHours > 1 ? 's' : ''}`;
  }

  return 'Time unavailable';
};

export const formatCurrencyMinor = (amount?: number, currency = 'USD') => {
  if (typeof amount !== 'number' || !Number.isFinite(amount)) {
    return `${currency} 0.00`;
  }

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
};

export const formatDateTimeLabel = (value?: string) => {
  if (!value) {
    return 'Unavailable';
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return 'Unavailable';
  }

  return new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsed);
};

export const formatPaymentStatus = (status?: string) => toTitleCase(status, 'Payment pending');
