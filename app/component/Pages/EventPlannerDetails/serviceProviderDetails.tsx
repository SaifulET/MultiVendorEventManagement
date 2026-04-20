'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  BriefcaseBusiness,
  Building2,
  Calendar,
  CheckCircle2,
  Mail,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Star,
  Tag,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';

import { api, getApiErrorMessage } from '@/lib/api';
import { formatDateDDMMYY } from '@/lib/date';
import bgimg from '@/public/bg1.svg';
import plannerImg from '@/public/pp1.svg';

interface EventPlannerProfileInfo {
  verification?: {
    businessType?: string;
    companyName?: string;
    nationalIdOrTradeLicenseFiles?: string[];
  };
  name?: string;
  description?: string;
  coverageArea?: string[];
  address?: string;
  profileImage?: string;
}

interface EventPlannerDetails {
  _id: string;
  isBlocked?: boolean;
  fullName?: string;
  email?: string;
  profileImage?: string;
  role?: string;
  serviceCategories?: string[];
  isEmailVerified?: boolean;
  createdAt?: string;
  onboarding?: {
    verification?: {
      businessType?: string;
      companyName?: string;
      nationalIdOrTradeLicenseUrl?: string;
    };
    submittedAt?: string;
    eventProvider?: {
      _id?: string;
      fullName?: string;
      email?: string;
      profileImage?: string;
      profileInfo?: EventPlannerProfileInfo;
    };
  };
}

interface EventPlannerDetailsResponse {
  success: boolean;
  data?: EventPlannerDetails | EventPlannerDetails[];
}

interface PlannerReview {
  _id: string;
  bookingId?: string;
  customerId?: {
    _id?: string;
    fullName?: string;
    profileImage?: string;
  } | string;
  providerId?: string;
  targetType?: string;
  targetId?: string;
  rating?: number | string;
  comment?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface TargetReviewsResponse {
  success: boolean;
  data?: PlannerReview[];
}

const getArrayValues = (value?: string[]) =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && Boolean(item.trim()))
    : [];

const normalizePlanner = (
  payload: EventPlannerDetails | EventPlannerDetails[] | undefined,
  plannerId?: string
) => {
  if (Array.isArray(payload)) {
    if (!payload.length) {
      return null;
    }

    return payload.find((item) => item._id === plannerId) ?? payload[0];
  }

  if (payload && typeof payload === 'object') {
    return payload;
  }

  return null;
};

const formatDisplayDate = (value?: string) => {
  return formatDateDDMMYY(value, 'Not available');
};

const formatLabel = (value?: string) => {
  if (!value?.trim()) {
    return 'Not specified';
  }

  return value
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

const getReviewName = (review: PlannerReview, fallbackIndex: number) =>
  (typeof review.customerId === 'object' ? review.customerId?.fullName : undefined) ||
  `Guest ${fallbackIndex + 1}`;

const getReviewRating = (rating?: number | string) => {
  if (typeof rating === 'number' && Number.isFinite(rating)) {
    return Math.max(0, Math.min(5, Number(rating.toFixed(1))));
  }

  if (typeof rating === 'string') {
    const parsed = Number(rating);
    if (Number.isFinite(parsed)) {
      return Math.max(0, Math.min(5, Number(parsed.toFixed(1))));
    }
  }

  return 0;
};

const renderStars = (rating: number) =>
  Array.from({ length: 5 }, (_, index) => (
    <Star
      key={index}
      className={index < Math.round(rating) ? 'h-4 w-4 fill-yellow-400 text-yellow-400' : 'h-4 w-4 text-gray-300'}
    />
  ));

export default function WeddingPlannerProfile() {
  const params = useParams<{ slug?: string | string[] }>();
  const router = useRouter();
  const plannerId = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;

  const [planner, setPlanner] = useState<EventPlannerDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviews, setReviews] = useState<PlannerReview[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [reviewsError, setReviewsError] = useState('');

  useEffect(() => {
    if (!plannerId) {
      setIsLoading(false);
      setError('Event planner not found.');
      return;
    }

    let isMounted = true;

    const fetchPlanner = async () => {
      try {
        setIsLoading(true);
        setError('');

        const response = await api.get<EventPlannerDetailsResponse>(`/api/v1/public/event-planners/${plannerId}`);
        const normalizedPlanner = normalizePlanner(response.data.data, plannerId);

        if (!normalizedPlanner) {
          throw new Error('Event planner details are unavailable.');
        }

        if (!isMounted) {
          return;
        }

        setPlanner(normalizedPlanner);
      } catch (fetchError) {
        if (!isMounted) {
          return;
        }

        setPlanner(null);
        setError(getApiErrorMessage(fetchError));
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchPlanner();

    return () => {
      isMounted = false;
    };
  }, [plannerId]);

  useEffect(() => {
    if (!plannerId) {
      setReviews([]);
      setReviewsError('Event planner not found.');
      setIsLoadingReviews(false);
      return;
    }

    let isMounted = true;

    const fetchReviews = async () => {
      try {
        setIsLoadingReviews(true);
        setReviewsError('');

        const response = await api.get<TargetReviewsResponse>(`/api/v1/reviews/target/${plannerId}`);

        if (!isMounted) {
          return;
        }

        setReviews(Array.isArray(response.data.data) ? response.data.data : []);
      } catch (fetchError) {
        if (!isMounted) {
          return;
        }

        setReviews([]);
        setReviewsError(getApiErrorMessage(fetchError));
      } finally {
        if (isMounted) {
          setIsLoadingReviews(false);
        }
      }
    };

    void fetchReviews();

    return () => {
      isMounted = false;
    };
  }, [plannerId]);

  const profileInfo = planner?.onboarding?.eventProvider?.profileInfo;
  const categories = getArrayValues(planner?.serviceCategories);
  const plannerName =
    profileInfo?.name?.trim() ||
    planner?.fullName?.trim() ||
    planner?.onboarding?.eventProvider?.fullName?.trim() ||
    'Untitled Event Planner';
  const description =
    profileInfo?.description?.trim() ||
    'This event planner has not added a public description yet.';
  const coverageArea = getArrayValues(profileInfo?.coverageArea);
  const address = profileInfo?.address?.trim() || '';
  const businessType =
    profileInfo?.verification?.businessType?.trim() ||
    planner?.onboarding?.verification?.businessType?.trim() ||
    '';
  const companyName =
    profileInfo?.verification?.companyName?.trim() ||
    planner?.onboarding?.verification?.companyName?.trim() ||
    '';
  const email =
    planner?.email?.trim() ||
    planner?.onboarding?.eventProvider?.email?.trim() ||
    'Email unavailable';
  const plannerProfileImage =
    (typeof planner?.profileImage === 'string' && planner.profileImage.trim()) ||
    (typeof planner?.onboarding?.eventProvider?.profileImage === 'string' &&
      planner.onboarding.eventProvider.profileImage.trim()) ||
    (typeof profileInfo?.profileImage === 'string' && profileInfo.profileImage.trim()) ||
    plannerImg.src;
  const locationLabel = [
    ...coverageArea,
    address,
  ].filter((value, index, values): value is string => {
    if (!value?.trim()) {
      return false;
    }

    return values.findIndex((item) => item === value) === index;
  }).join(', ');
  const reviewRatings = useMemo(
    () => reviews.map((review) => getReviewRating(review.rating)).filter((rating) => Number.isFinite(rating)),
    [reviews]
  );
  const averageRating = reviewRatings.length
    ? Number((reviewRatings.reduce((total, rating) => total + rating, 0) / reviewRatings.length).toFixed(1))
    : 0;

  const bookHandler = () => {
    if (!planner?._id) {
      return;
    }

    router.push(`/pages/findEventPlannerConfirmation/${planner._id}`);
  };

  if (isLoading) {
    return (
      <div className="px-6 py-16 md:px-12 lg:px-24">
        <div className="mx-auto max-w-6xl animate-pulse space-y-6">
          <div className="h-64 rounded-3xl bg-gray-200" />
          <div className="h-40 rounded-3xl bg-gray-100" />
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="h-72 rounded-3xl bg-gray-100" />
            <div className="h-72 rounded-3xl bg-gray-100" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !planner) {
    return (
      <div className="px-6 py-16 md:px-12 lg:px-24">
        <div className="mx-auto max-w-3xl rounded-3xl border border-red-100 bg-red-50 p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Event planner details unavailable</h1>
          <p className="mt-3 text-gray-600">{error || 'We could not load this planner right now.'}</p>
          <button
            onClick={() => { router.push('/pages/findEventPlanners'); }}
            className="mt-6 rounded-lg bg-[#B74140] px-6 py-3 text-white transition-colors hover:bg-[#9d3534]"
          >
            Back to planners
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFAF8]">
      <div className="relative h-[220px] overflow-hidden md:h-[320px]">
        <Image
          src={bgimg}
          alt="Event planner background"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />
      </div>

      <div className="mx-auto max-w-6xl px-[32px] pb-12 md:px-[64px]">
        <div className="relative -mt-16 md:-mt-20">
          <div className="rounded-[28px] border border-[#E5E7EB] bg-white p-6 shadow-sm md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
                <img
                  src={plannerProfileImage}
                  alt={plannerName}
                  className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-md md:h-32 md:w-32"
                />

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="font-inter text-[24px] font-bold leading-[32px] text-gray-900">
                      {plannerName}
                    </h1>
                    {planner.isEmailVerified ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                        <CheckCircle2 className="h-4 w-4" />
                        Verified
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-1 text-gray-600">
                    {categories.length ? categories.join(', ') : 'Event Planner'}
                  </p>

                  <div className="mt-2 flex items-center gap-2 text-gray-500">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">
                      {locationLabel || 'Coverage area unavailable'}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex items-center">
                      {renderStars(averageRating)}
                    </div>
                    <span className="font-semibold text-gray-900">
                      {averageRating > 0 ? averageRating.toFixed(1) : 'New'}
                    </span>
                    <span className="text-sm text-gray-500">({reviews.length} reviews)</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row md:flex-shrink-0">
                <button
                  onClick={() => { router.push('/home/dashboard/chat'); }}
                  className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-6 py-3 transition-colors hover:bg-gray-50"
                >
                  <MessageSquare className="h-5 w-5" />
                  <span>Contact Planner</span>
                </button>
                <button
                  onClick={bookHandler}
                  className="rounded-lg bg-[#B74140] px-6 py-3 text-white transition-colors hover:bg-[#963533]"
                >
                  Book Now
                </button>
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-[#FAF4F3] p-5">
                <div className="flex items-center gap-3">
                  <Mail className="text-[#B74140]" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-base font-semibold text-gray-900">{email}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-[#FAF4F3] p-5">
                <div className="flex items-center gap-3">
                  <Building2 className="text-[#B74140]" />
                  <div>
                    <p className="text-sm text-gray-500">Company</p>
                    <p className="text-base font-semibold text-gray-900">
                      {companyName || 'Independent planner'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-[#FAF4F3] p-5">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="text-[#B74140]" />
                  <div>
                    <p className="text-sm text-gray-500">Business Type</p>
                    <p className="text-base font-semibold text-gray-900">
                      {formatLabel(businessType)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr,0.85fr]">
          <div className="space-y-8">
            <section className="rounded-[28px] border border-[#E5E7EB] bg-white p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-gray-900">About this planner</h2>
              <p className="mt-4 leading-7 text-gray-600">{description}</p>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-gray-500">
                    Coverage Area
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {coverageArea.length ? coverageArea.map((area) => (
                      <span
                        key={area}
                        className="rounded-full bg-[#F7F1F0] px-3 py-2 text-sm text-gray-700"
                      >
                        {area}
                      </span>
                    )) : (
                      <span className="text-sm text-gray-500">Coverage area unavailable</span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-gray-500">
                    Service Categories
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {categories.length ? categories.map((category) => (
                      <span
                        key={category}
                        className="rounded-full bg-[#F7F1F0] px-3 py-2 text-sm text-gray-700"
                      >
                        {category}
                      </span>
                    )) : (
                      <span className="text-sm text-gray-500">No public categories listed yet</span>
                    )}
                  </div>
                </div>
              </div>

              {address ? (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-gray-500">
                    Address
                  </h3>
                  <p className="mt-3 text-gray-600">{address}</p>
                </div>
              ) : null}
            </section>

            <section className="rounded-[28px] border border-[#E5E7EB] bg-white p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-gray-900">Booking readiness</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-[#F0E7E6] bg-[#FFFCFB] p-5">
                  <div className="flex items-center gap-3">
                    <Calendar className="text-[#B74140]" />
                    <div>
                      <p className="text-sm text-gray-500">Joined</p>
                      <p className="font-semibold text-gray-900">
                        {formatDisplayDate(planner.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#F0E7E6] bg-[#FFFCFB] p-5">
                  <div className="flex items-center gap-3">
                    <BriefcaseBusiness className="text-[#B74140]" />
                    <div>
                      <p className="text-sm text-gray-500">Profile Submitted</p>
                      <p className="font-semibold text-gray-900">
                        {formatDisplayDate(planner.onboarding?.submittedAt)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#F0E7E6] bg-[#FFFCFB] p-5">
                  <div className="flex items-center gap-3">
                    <Tag className="text-[#B74140]" />
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <p className="font-semibold text-gray-900">
                        {planner.isBlocked ? 'Currently unavailable' : 'Open for inquiries'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <section className="rounded-[28px] border border-[#E5E7EB] bg-white p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-gray-900">Planner summary</h2>
              <div className="mt-5 space-y-4 text-sm text-gray-600">
                <div className="flex items-start gap-3 rounded-2xl bg-[#FAF4F3] p-4">
                  <Mail className="mt-0.5 h-4 w-4 text-[#B74140]" />
                  <div>
                    <p className="font-medium text-gray-900">Public contact</p>
                    <p>{email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl bg-[#FAF4F3] p-4">
                  <MapPin className="mt-0.5 h-4 w-4 text-[#B74140]" />
                  <div>
                    <p className="font-medium text-gray-900">Coverage + address</p>
                    <p>{locationLabel || 'Coverage area unavailable'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl bg-[#FAF4F3] p-4">
                  <ShieldCheck className="mt-0.5 h-4 w-4 text-[#B74140]" />
                  <div>
                    <p className="font-medium text-gray-900">Verification</p>
                    <p>{planner.isEmailVerified ? 'Email verified' : 'Verification pending'}</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-[#E5E7EB] bg-white p-6 md:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Reviews & ratings</h2>
                  <p className="mt-2 text-sm text-gray-500">
                    {reviews.length ? `${reviews.length} customer reviews` : 'No reviews yet'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-gray-900">
                    {averageRating > 0 ? averageRating.toFixed(1) : 'New'}
                  </p>
                  <div className="mt-1 flex items-center justify-end gap-1">
                    {renderStars(averageRating)}
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-5">
                {isLoadingReviews ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-sm text-gray-500">
                    Loading customer reviews...
                  </div>
                ) : reviews.length ? reviews.map((review, index) => {
                  const reviewName = getReviewName(review, index);
                  const reviewRating = getReviewRating(review.rating);

                  return (
                    <div
                      key={review._id || `${reviewName}-${index}`}
                      className="rounded-2xl border border-[#F0E7E6] bg-[#FFFCFB] p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">{reviewName}</h3>
                          <p className="mt-1 text-sm text-gray-500">{formatDisplayDate(review.createdAt)}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {renderStars(reviewRating)}
                        </div>
                      </div>
                      <p className="mt-4 leading-7 text-gray-600">
                        {review.comment?.trim() || 'Customer feedback will appear here soon.'}
                      </p>
                    </div>
                  );
                }) : reviewsError ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-sm text-gray-500">
                    {reviewsError}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-sm text-gray-500">
                    No customer reviews have been published for this event planner yet.
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
