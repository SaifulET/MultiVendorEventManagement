'use client';

import { useEffect, useMemo, useState } from 'react';
import { Calendar, LoaderCircle, Send, Star } from 'lucide-react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';

import img from '@/public/profile.jpg';
import { api, getApiErrorMessage } from '@/lib/api';
import { formatDateDDMMYY } from '@/lib/date';
import BookingPopup from '@/app/component/shared/BookingPopup';

type BookingType = 'venue' | 'service' | 'event';
type BookingStatus = 'pending' | 'completed' | 'cancelled' | 'upcoming';

interface BookingDetailsResponse {
  success: boolean;
  data?: BookingDetails;
}

interface BookingDetails {
  _id: string;
  bookingDate?: string;
  status?: string;
  targetType?: string;
}

interface ReviewDialogState {
  actionLabel?: string;
  message: string;
  redirectPath?: string;
  title: string;
}

const bookingTypeLabels: Record<BookingType, string> = {
  event: 'Event Planner',
  service: 'Service Provider',
  venue: 'Venue',
};

const bookingTypeActionLabels: Record<BookingType, string> = {
  event: 'Event Planner',
  service: 'Service Provider',
  venue: 'Venue',
};

const toBookingType = (targetType?: string): BookingType => {
  switch (targetType?.trim().toLowerCase()) {
    case 'venue':
      return 'venue';
    case 'service':
      return 'service';
    default:
      return 'event';
  }
};

const toBookingStatus = (status?: string, bookingDate?: string): BookingStatus => {
  const normalizedStatus = status?.trim().toLowerCase() ?? '';

  if (normalizedStatus === 'completed') {
    return 'completed';
  }

  if (['cancelled', 'canceled', 'declined', 'rejected'].includes(normalizedStatus)) {
    return 'cancelled';
  }

  if (normalizedStatus === 'pending') {
    return 'pending';
  }

  if (bookingDate) {
    const parsedDate = new Date(`${bookingDate}T00:00:00`);

    if (!Number.isNaN(parsedDate.getTime())) {
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

      if (parsedDate >= todayStart) {
        return 'upcoming';
      }
    }
  }

  return 'completed';
};

const buildBookingTitle = (bookingType: BookingType, bookingId: string) =>
  `${bookingTypeLabels[bookingType]} Booking #${bookingId.slice(-6).toUpperCase()}`;

export default function BookingReviewForm() {
  const params = useParams<{ slug?: string | string[] }>();
  const router = useRouter();
  const bookingId = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;

  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [overallRating, setOverallRating] = useState(5);
  const [review, setReview] = useState('');
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [dialog, setDialog] = useState<ReviewDialogState | null>(null);

  useEffect(() => {
    if (!bookingId) {
      setError('Booking not found.');
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const fetchBooking = async () => {
      try {
        setIsLoading(true);
        setError('');

        const response = await api.get<BookingDetailsResponse>(`/api/v1/bookings/${bookingId}`);

        if (!isMounted) {
          return;
        }

        setBooking(response.data.data ?? null);
      } catch (fetchError) {
        if (!isMounted) {
          return;
        }

        setBooking(null);
        setError(getApiErrorMessage(fetchError));
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void fetchBooking();

    return () => {
      isMounted = false;
    };
  }, [bookingId]);

  const bookingType = toBookingType(booking?.targetType);
  const bookingStatus = toBookingStatus(booking?.status, booking?.bookingDate);
  const canReview = bookingStatus === 'completed';
  const bookingTypeLabel = bookingTypeLabels[bookingType];
  const reviewHeading = `Rate Your ${bookingTypeActionLabels[bookingType]}`;
  const bookingTitle = booking?._id
    ? buildBookingTitle(bookingType, booking._id)
    : `${bookingTypeLabel} Booking`;
  const bookingDateLabel = useMemo(
    () => formatDateDDMMYY(booking?.bookingDate, 'Date unavailable'),
    [booking?.bookingDate]
  );

  const handleCloseDialog = () => {
    const redirectPath = dialog?.redirectPath;
    setDialog(null);

    if (redirectPath) {
      router.push(redirectPath);
    }
  };

  const handleSubmit = async () => {
    if (!bookingId) {
      setError('Booking not found.');
      return;
    }

    if (!canReview) {
      setError('You can only review a booking after it is completed.');
      return;
    }

    if (!review.trim()) {
      setError('Please write a short review before submitting.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      await api.post(`/api/v1/reviews/${bookingId}`, {
        rating: overallRating,
        comment: review.trim(),
      });

      setDialog({
        title: 'Review Submitted',
        message: `Thanks for sharing your experience with this ${bookingTypeLabel.toLowerCase()}.`,
        actionLabel: 'Back To My Bookings',
        redirectPath: '/home/dashboard/mybookings',
      });
    } catch (submissionError) {
      setError(getApiErrorMessage(submissionError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    router.push('/home/dashboard/mybookings');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen px-[32px] py-[32px] md:px-[104px] md:py-[38px]">
        <div className="rounded-lg border border-[#E5E7EB] bg-white p-10 text-center text-gray-600">
          <div className="flex items-center justify-center gap-3">
            <LoaderCircle className="h-5 w-5 animate-spin" />
            Loading booking review details...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-[32px] py-[32px] md:px-[104px] md:py-[38px]">
      <div>
        <h1 className="mb-[20px] text-2xl font-bold text-gray-900 md:text-3xl">
          {reviewHeading}
        </h1>

        {error ? (
          <div className="mb-[20px] rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="mb-[20px] rounded-lg border border-[#E5E7EB] bg-white p-[16px] md:p-[25px]">
          <div className="flex items-start gap-4">
            <div className="relative">
              <Image
                src={img}
                alt={bookingTitle}
                width={80}
                height={80}
                className="rounded-lg object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-lg font-semibold text-gray-900 md:text-xl">
                {bookingTitle}
              </h2>
              <p className="mt-1 text-sm text-gray-600 md:text-base">
                {bookingTypeLabel}
              </p>
              <div className="mt-2 flex items-center text-gray-500">
                <Calendar className="mr-2 h-4 w-4" />
                <p className="text-xs md:text-sm">Booking Date: {bookingDateLabel}</p>
              </div>
              {!canReview ? (
                <p className="mt-3 text-sm font-medium text-[#B74140]">
                  Reviews are available only after this booking is completed.
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="mb-[20px] rounded-lg border border-[#E5E7EB] bg-white p-[16px] md:p-[25px]">
            <h3 className="mb-4 text-base font-semibold text-gray-900 md:text-lg">
              Overall Rating
            </h3>

            <div className="flex flex-col items-center py-6">
              <div className="mb-4 flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    disabled={!canReview}
                    onClick={() => setOverallRating(star)}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(null)}
                    className="transition-transform hover:scale-110 focus:outline-none disabled:cursor-not-allowed"
                  >
                    <Star
                      className={`h-10 w-10 transition-colors md:h-12 md:w-12 ${
                        star <= (hoveredStar ?? overallRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'fill-gray-300 text-gray-300'
                      }`}
                      strokeWidth={star <= (hoveredStar ?? overallRating) ? 0 : 1.5}
                    />
                  </button>
                ))}
              </div>
              <div className="text-2xl font-bold text-gray-900 md:text-3xl">
                {overallRating} / 5
              </div>
              <div className="mt-2 text-sm text-gray-500">Tap a star to rate</div>
            </div>
          </div>

          <div className="mb-[20px] rounded-lg border border-[#E5E7EB] bg-white p-[16px] md:p-[25px]">
            <h3 className="mb-4 text-base font-semibold text-gray-900 md:text-lg">
              Write a Review
            </h3>

            <textarea
              value={review}
              onChange={(event) => setReview(event.target.value)}
              placeholder="Share your experience... what did you like? What could be better?"
              disabled={!canReview || isSubmitting}
              className="min-h-[120px] w-full resize-none rounded-lg border border-gray-300 p-4 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-[#B74140] disabled:cursor-not-allowed disabled:bg-gray-50 md:min-h-[150px] md:text-base"
              maxLength={500}
            />

            <div className="mt-2 flex items-center justify-between text-xs text-gray-500 md:text-sm">
              <span>Share a helpful note about the booking</span>
              <span>{review.length} / 500</span>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-[20px] pb-6 md:flex-row md:items-center md:justify-between">
            <button
              type="button"
              onClick={handleSkip}
              className="flex w-full items-center justify-center rounded-lg border border-[#E5E7EB] py-[16px] text-sm font-medium text-gray-600 transition-colors hover:text-gray-800 md:text-base"
            >
              Skip for now
            </button>

            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={!canReview || isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#B74140] px-8 py-[16px] text-sm font-semibold text-white transition-colors hover:bg-[#862b2a] disabled:cursor-not-allowed disabled:opacity-60 md:text-base"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin md:h-5 md:w-5" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 md:h-5 md:w-5" />
                  Submit Review
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <BookingPopup
        open={Boolean(dialog)}
        title={dialog?.title ?? ''}
        message={dialog?.message ?? ''}
        actionLabel={dialog?.actionLabel}
        onClose={handleCloseDialog}
      />
    </div>
  );
}
