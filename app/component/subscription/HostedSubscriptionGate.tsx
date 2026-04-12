"use client";

import axios from "axios";
import { Check, LoaderCircle, Lock, TrendingUp, WalletCards } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

import { api, getApiErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

type SubscriptionStatus = "subscribed" | "not_subscribed" | "active" | "trialing" | string;

interface SubscriptionStatusPayload {
  userId?: string;
  role?: string;
  subscriptionStatus?: SubscriptionStatus;
  isSubscribed?: boolean;
  paymentLink?: string;
}

interface SubscriptionStatusResponse {
  success: boolean;
  message?: string;
  data?: SubscriptionStatusPayload;
}

type HostedSubscriptionGateProps = {
  variant?: "welcome" | "dashboard";
};

const ACTIVE_STATUSES = new Set(["active", "subscribed", "trialing"]);
const PENDING_CHECKOUT_STORAGE_KEY = "evenit_subscription_checkout_pending";
const POLLING_INTERVAL_MS = 2500;
const POLLING_TIMEOUT_MS = 60000;

const getDashboardRoute = (role?: string | null) => {
  switch (role) {
    case "venue_provider":
      return "/venueprovider/dashboard/dashboard";
    case "event_planner":
      return "/eventPlanner/dashboard/dashboard";
    case "service_provider":
      return "/serviceprovider/dashboard/dashboard";
    case "customer":
    default:
      return "/home/dashboard/dashboard";
  }
};

const getSubscriptionErrorMessage = (error: unknown) => {
  const message = getApiErrorMessage(error);

  if (message.trim().toLowerCase().includes("already active")) {
    return "Subscription is already active.";
  }

  return message;
};

const isAlreadyActiveError = (error: unknown) => {
  if (!axios.isAxiosError(error)) {
    return false;
  }

  const responseStatus = error.response?.status;
  const responseMessage =
    typeof error.response?.data?.message === "string" ? error.response.data.message : "";

  return responseStatus === 400 && responseMessage.toLowerCase().includes("already active");
};

const readPendingCheckoutFlag = () => {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(PENDING_CHECKOUT_STORAGE_KEY) === "true";
};

const setPendingCheckoutFlag = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(PENDING_CHECKOUT_STORAGE_KEY, "true");
};

const clearPendingCheckoutFlag = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(PENDING_CHECKOUT_STORAGE_KEY);
};

const getNormalizedStatus = (status?: string) => status?.trim().toLowerCase() ?? "";

export default function HostedSubscriptionGate({
  variant = "dashboard",
}: HostedSubscriptionGateProps) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isStartingCheckout, setIsStartingCheckout] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] =
    useState<SubscriptionStatus>("not_subscribed");
  const [resolvedRole, setResolvedRole] = useState<string | null>(user?.role ?? null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [shouldPollAfterReturn, setShouldPollAfterReturn] = useState(false);

  const isBusy = isInitialLoading || isStartingCheckout || isPolling;

  const syncSubscriptionStatus = async ({
    announceActive = false,
  }: {
    announceActive?: boolean;
  } = {}) => {
    const response = await api.get<SubscriptionStatusResponse>(
      "/api/v1/subscriptions/status"
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to load subscription status.");
    }

    const nextData = response.data.data;
    const nextRole = nextData?.role ?? user?.role ?? null;
    const normalizedStatus = getNormalizedStatus(nextData?.subscriptionStatus);
    const nextIsSubscribed =
      Boolean(nextData?.isSubscribed) || ACTIVE_STATUSES.has(normalizedStatus);
    const nextStatus =
      nextData?.subscriptionStatus ?? (nextIsSubscribed ? "subscribed" : "not_subscribed");

    setResolvedRole(nextRole);
    setSubscriptionStatus(nextStatus);
    setIsSubscribed(nextIsSubscribed);

    if (nextIsSubscribed) {
      clearPendingCheckoutFlag();

      if (announceActive) {
        setMessage(
          variant === "welcome"
            ? "Subscription confirmed. Your account is ready to use."
            : "Subscription confirmed. Your access is unlocked."
        );
      }
    }

    return {
      isSubscribed: nextIsSubscribed,
      role: nextRole,
      paymentLink: nextData?.paymentLink ?? "",
    };
  };

  useEffect(() => {
    let ignore = false;

    const initializeStatus = async () => {
      try {
        setIsInitialLoading(true);
        setError("");

        const result = await syncSubscriptionStatus();
        const hasPendingCheckout = readPendingCheckoutFlag();

        if (!ignore && !result.isSubscribed && hasPendingCheckout) {
          setMessage("Checking your subscription after Stripe checkout...");
          setShouldPollAfterReturn(true);
        }
      } catch (statusError) {
        if (!ignore) {
          setError(getSubscriptionErrorMessage(statusError));
        }
      } finally {
        if (!ignore) {
          setIsInitialLoading(false);
        }
      }
    };

    void initializeStatus();

    return () => {
      ignore = true;
    };
  }, [user?.role]);

  useEffect(() => {
    if (!shouldPollAfterReturn) {
      return;
    }

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const startedAt = Date.now();

    const pollStatus = async () => {
      try {
        setIsPolling(true);
        setError("");

        const result = await syncSubscriptionStatus({ announceActive: true });

        if (cancelled) {
          return;
        }

        if (result.isSubscribed) {
          setShouldPollAfterReturn(false);
          setIsPolling(false);
          return;
        }

        if (Date.now() - startedAt >= POLLING_TIMEOUT_MS) {
          clearPendingCheckoutFlag();
          setShouldPollAfterReturn(false);
          setIsPolling(false);
          setMessage(
            "Payment is still pending. If you left Stripe without paying, the subscription remains inactive."
          );
          return;
        }

        timeoutId = setTimeout(() => {
          void pollStatus();
        }, POLLING_INTERVAL_MS);
      } catch (pollError) {
        if (cancelled) {
          return;
        }

        clearPendingCheckoutFlag();
        setShouldPollAfterReturn(false);
        setIsPolling(false);
        setError(getSubscriptionErrorMessage(pollError));
      }
    };

    void pollStatus();

    return () => {
      cancelled = true;
      setIsPolling(false);

      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [shouldPollAfterReturn]);

  const handleSubscribe = async () => {
    try {
      setIsStartingCheckout(true);
      setError("");
      setMessage("");

      const statusResult = await syncSubscriptionStatus();

      if (statusResult.isSubscribed) {
        setMessage("Subscription is already active. You can continue.");
        return;
      }

      const response = await api.get<SubscriptionStatusResponse>(
        "/api/v1/subscriptions/payment-link"
      );

      if (!response.data.success || !response.data.data?.paymentLink) {
        throw new Error(response.data.message || "Failed to get Stripe checkout link.");
      }

      setPendingCheckoutFlag();
      window.location.href = response.data.data.paymentLink;
    } catch (checkoutError) {
      if (isAlreadyActiveError(checkoutError)) {
        clearPendingCheckoutFlag();
        setIsSubscribed(true);
        setSubscriptionStatus("subscribed");
        setMessage("Subscription is already active. You can continue.");
        setError("");
        return;
      }

      setError(getSubscriptionErrorMessage(checkoutError));
    } finally {
      setIsStartingCheckout(false);
    }
  };

  const handleContinue = () => {
    router.push(getDashboardRoute(resolvedRole ?? user?.role));
  };

  if (variant === "dashboard") {
    return (
      <div className="min-h-screen bg-white py-4 lg:py-6">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold text-slate-900">Subscription</h1>

          <div className="mt-6 rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
            <div className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
                    Status
                  </p>
                  <h2 className="mt-3 text-3xl font-bold text-slate-900">
                    {isInitialLoading
                      ? "Checking subscription..."
                      : isSubscribed
                        ? "Subscribed"
                        : "Not subscribed"}
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    {isPolling
                      ? "Waiting for Stripe webhook confirmation..."
                      : "Stripe hosted checkout activates the subscription through the backend webhook."}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  <p>Subscription: {subscriptionStatus.replace(/_/g, " ")}</p>
                  <p>Role: {(resolvedRole ?? user?.role ?? "customer").replace(/_/g, " ")}</p>
                </div>
              </div>

              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              {message ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {message}
                </div>
              ) : null}

              <div className="rounded-2xl border border-[#E5E7EB] bg-slate-50 px-4 py-4 text-sm text-slate-700">
                <p>No manual payment verification runs on the frontend anymore.</p>
                <p>The app unlocks only after `/api/v1/subscriptions/status` reports an active subscription.</p>
              </div>

              {isSubscribed ? (
                <button
                  type="button"
                  onClick={handleContinue}
                  className="inline-flex items-center justify-center rounded-2xl bg-[#B74140] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#9c3635]"
                >
                  Continue to dashboard
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubscribe}
                  disabled={isBusy}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#B74140] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#9c3635] disabled:cursor-not-allowed disabled:bg-[#d28a89]"
                >
                  {isBusy ? (
                    <>
                      <LoaderCircle className="h-5 w-5 animate-spin" />
                      {isPolling ? "Checking payment..." : "Preparing Stripe checkout..."}
                    </>
                  ) : (
                    "Subscribe"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(circle_at_bottom,#c24747_0%,#a31313_28%,#870a0a_60%,#6e0404_100%)] px-4 py-8 md:px-8 md:py-14">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center justify-center">
        <div className="w-full max-w-[680px] rounded-[28px] bg-white px-6 py-8 shadow-[0_28px_80px_rgba(74,8,8,0.32)] md:px-12 md:py-12">
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-[#BD4745] md:mb-10 md:h-24 md:w-24">
            <Check className="h-10 w-10 text-white md:h-12 md:w-12" strokeWidth={3} />
          </div>

          <div className="space-y-6 text-center">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold leading-tight text-[#0F172A] md:text-[52px] md:leading-[1.1]">
                Make Account Ready
              </h1>
              <p className="mx-auto max-w-2xl text-base leading-8 text-[#475569] md:text-[19px]">
                Your account has been created successfully. Subscribe once to unlock
                bookings, services, and everything inside your dashboard.
              </p>
            </div>

            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            {message ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {message}
              </div>
            ) : null}

            <div className="rounded-2xl bg-[#F8FAFC] px-5 py-4 text-left text-sm text-[#475569]">
              <p>
                Status:{" "}
                <span className="font-semibold text-[#0F172A]">
                  {isInitialLoading
                    ? "Checking subscription..."
                    : subscriptionStatus.replace(/_/g, " ")}
                </span>
              </p>
              <p className="mt-2">
                Access is activated by the Stripe webhook. The frontend only redirects to the hosted checkout page and keeps checking subscription status after you return.
              </p>
            </div>

            {isSubscribed ? (
              <button
                type="button"
                onClick={handleContinue}
                className="flex h-14 w-full items-center justify-center rounded-2xl bg-[#BD4745] text-base font-semibold text-white transition-colors hover:bg-[#a03735]"
              >
                Continue to Dashboard
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubscribe}
                disabled={isBusy}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#BD4745] text-base font-semibold text-white transition-colors hover:bg-[#a03735] disabled:cursor-not-allowed disabled:bg-[#d48a88]"
              >
                {isBusy ? (
                  <>
                    <LoaderCircle className="h-5 w-5 animate-spin" />
                    {isPolling ? "Checking payment..." : "Subscribe"}
                  </>
                ) : (
                  "Subscribe"
                )}
              </button>
            )}

            <p className="text-sm text-[#64748B]">
              You will be redirected to Stripe to complete the subscription securely.
            </p>
          </div>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 md:flex-row md:flex-wrap">
            <div className="flex min-h-14 items-center justify-center gap-3 rounded-full bg-[#EDF4FF] px-5 py-3 text-sm font-semibold text-[#1E293B] md:text-base">
              <WalletCards className="h-4 w-4 text-[#3B82F6]" />
              18,000+ Venues Listed
            </div>
            <div className="flex min-h-14 items-center justify-center gap-3 rounded-full bg-[#EFFBF2] px-5 py-3 text-sm font-semibold text-[#1E293B] md:text-base">
              <TrendingUp className="h-4 w-4 text-[#22C55E]" />
              3x Revenue Growth
            </div>
            <div className="flex min-h-14 items-center justify-center gap-3 rounded-full bg-[#FAF4FF] px-5 py-3 text-sm font-semibold text-[#1E293B] md:text-base">
              <Lock className="h-4 w-4 text-[#A855F7]" />
              20,000+ Venue Bookings
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
