import { api } from '@/lib/api';
import { formatHourRange } from '@/lib/booking';
import { formatDateDDMMYY } from '@/lib/date';

export interface EventPlannerBookingMeta {
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

interface EventPlannerProfile {
  address?: string | null;
  description?: string | null;
  name?: string | null;
}

interface BookingProvider {
  eventPlanner?: EventPlannerProfile | null;
  fullName?: string | null;
  profileImage?: string | null;
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

export interface EventPlannerBooking {
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

interface EventPlannerBookingsResponse {
  success: boolean;
  meta?: EventPlannerBookingMeta;
  data?: EventPlannerBooking[];
}

interface EventPlannerBookingResponse {
  success: boolean;
  data?: EventPlannerBooking;
}

export interface EventPlannerBookingStats {
  accepted: number;
  pending: number;
  rejected: number;
  totalRequests: number;
}

interface FetchEventPlannerBookingsParams {
  limit: number;
  page: number;
  status?: string;
}

export const fetchEventPlannerBookings = async ({
  limit,
  page,
  status,
}: FetchEventPlannerBookingsParams) => {
  const params = new URLSearchParams({
    limit: String(limit),
    page: String(page),
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  if (status) {
    params.set('status', status);
  }

  const response = await api.get<EventPlannerBookingsResponse>(`/api/v1/bookings/provider?${params.toString()}`);
  return response.data;
};

export const fetchEventPlannerBookingDetails = async (bookingId: string) => {
  const response = await api.get<EventPlannerBookingResponse>(`/api/v1/bookings/${bookingId}`);
  return response.data;
};

export const approveEventPlannerBooking = async (bookingId: string) => {
  await api.patch(`/api/v1/bookings/event-planner/${bookingId}/approve`);
};

export const rejectEventPlannerBooking = async (bookingId: string) => {
  await api.patch(`/api/v1/bookings/event-planner/${bookingId}/reject`);
};

export const fetchEventPlannerBookingStats = async (): Promise<EventPlannerBookingStats> => {
  const [allBookings, pendingBookings, approvedBookings, confirmedBookings, rejectedBookings] = await Promise.all([
    fetchEventPlannerBookings({ limit: 1, page: 1 }),
    fetchEventPlannerBookings({ limit: 1, page: 1, status: 'pending' }),
    fetchEventPlannerBookings({ limit: 1, page: 1, status: 'approved' }),
    fetchEventPlannerBookings({ limit: 1, page: 1, status: 'confirmed' }),
    fetchEventPlannerBookings({ limit: 1, page: 1, status: 'rejected' }),
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

export const getCustomerAvatar = (booking: EventPlannerBooking) =>
  booking.customer?.profileImage || buildInitialAvatar(booking.customer?.fullName);

export const getCustomerName = (booking: EventPlannerBooking) =>
  booking.customer?.fullName?.trim() || 'Customer';

export const getCustomerEmail = (booking: EventPlannerBooking) =>
  booking.customer?.email?.trim() || 'Email unavailable';

export const getCustomerPhone = (booking: EventPlannerBooking) =>
  booking.customer?.phoneNumber?.trim() || 'Phone unavailable';

export const getPlannerName = (booking: EventPlannerBooking) =>
  booking.provider?.eventPlanner?.name?.trim() || booking.provider?.fullName?.trim() || 'Event Planner';

export const getPlannerDescription = (booking: EventPlannerBooking) =>
  booking.provider?.eventPlanner?.description?.trim() || 'Event planner booking request';

export const getPlannerType = (booking: EventPlannerBooking) =>
  toTitleCase(booking.targetType, 'Event');

export const getBookingStatus = (booking: EventPlannerBooking): 'pending' | 'approved' | 'rejected' => {
  const normalized = booking.status?.trim().toLowerCase() ?? '';

  if (normalized === 'approved' || normalized === 'confirmed') {
    return 'approved';
  }

  if (['rejected', 'declined', 'cancelled', 'canceled'].includes(normalized)) {
    return 'rejected';
  }

  return 'pending';
};

export const getBookingStatusLabel = (booking: EventPlannerBooking) =>
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

export const formatCurrencyAmount = (amount?: number, currency = 'GBP') => {
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

export const formatPaymentStatus = (status?: string) => toTitleCase(status, 'Payment pending');
