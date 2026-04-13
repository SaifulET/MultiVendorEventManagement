"use client";

import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe, type Stripe, type StripePaymentElementOptions } from "@stripe/stripe-js";
import axios from "axios";
import { Check, LoaderCircle, Lock, TrendingUp, WalletCards, X } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";

import { api, getApiErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

type SubscriptionStatus = "subscribed" | "not_subscribed" | "active" | "trialing" | string;

interface SubscriptionStatusPayload {
  userId?: string;
  role?: string;
  subscriptionStatus?: SubscriptionStatus;
  isSubscribed?: boolean;
  stripeSubscriptionStatus?: string | null;
  cancelAtPeriodEnd?: boolean;
  currentPeriodEnd?: string | null;
}

interface SubscriptionStatusResponse {
  success: boolean;
  message?: string;
  data?: SubscriptionStatusPayload;
}

interface CreateSubscriptionPayload {
  userId: string;
  role: string;
  subscriptionId: string;
  customerId: string;
  clientSecret: string;
  publishableKey: string;
}

interface CreateSubscriptionResponse {
  success: boolean;
  message?: string;
  data?: CreateSubscriptionPayload;
}

type HostedSubscriptionGateProps = {
  variant?: "welcome" | "dashboard" | "modal";
  allowSkip?: boolean;
  onRequestClose?: () => void;
};

type PaymentFormProps = {
  billingEmail?: string;
  billingName?: string;
  isBusy: boolean;
  onError: (message: string) => void;
  onFailure: (message: string) => void;
  onProcessingChange: (isProcessing: boolean) => void;
  onSuccess: () => void;
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
const formatDisplayLabel = (value?: string | null) =>
  value
    ?.split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ") ?? "";

function SubscriptionPaymentForm({
  billingEmail,
  billingName,
  isBusy,
  onError,
  onFailure,
  onProcessingChange,
  onSuccess,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [localError, setLocalError] = useState("");
  const paymentElementOptions: StripePaymentElementOptions = {
    defaultValues: {
      billingDetails: {
        name: billingName,
        email: billingEmail,
        address: {
          country: "GB",
        },
      },
    },
    wallets: {
      link: "never",
    },
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    try {
      setLocalError("");
      onError("");
      onProcessingChange(true);
      setPendingCheckoutFlag();

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.href,
          payment_method_data: {
            billing_details: {
              name: billingName,
              email: billingEmail,
            },
          },
        },
        redirect: "if_required",
      });

      if (error) {
        clearPendingCheckoutFlag();
        const nextMessage = error.message || "Payment confirmation failed.";
        setLocalError(nextMessage);
        onError(nextMessage);
        onFailure(nextMessage);
        return;
      }

      onSuccess();
    } finally {
      onProcessingChange(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4">
        <PaymentElement options={paymentElementOptions} />
      </div>

      {localError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {localError}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isBusy || !stripe || !elements}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#BD4745] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#a03735] disabled:cursor-not-allowed disabled:bg-[#d48a88]"
      >
        {isBusy ? (
          <>
            <LoaderCircle className="h-5 w-5 animate-spin" />
            Confirming payment...
          </>
        ) : (
          "Pay and activate subscription"
        )}
      </button>
    </form>
  );
}

export default function HostedSubscriptionGate({
  variant = "dashboard",
  allowSkip = false,
  onRequestClose,
}: HostedSubscriptionGateProps) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isCreatingSubscription, setIsCreatingSubscription] = useState(false);
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] =
    useState<SubscriptionStatus>("not_subscribed");
  const [resolvedRole, setResolvedRole] = useState<string | null>(user?.role ?? null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [shouldPollAfterReturn, setShouldPollAfterReturn] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(false);
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState<string | null>(null);
  const [stripeSubscriptionStatus, setStripeSubscriptionStatus] = useState<string | null>(null);
  const [isUpdatingRecurring, setIsUpdatingRecurring] = useState(false);
  const [failedPaymentRedirectPending, setFailedPaymentRedirectPending] = useState(false);

  const isBusy =
    isInitialLoading ||
    isCreatingSubscription ||
    isConfirmingPayment ||
    isPolling ||
    isUpdatingRecurring;

  const syncSubscriptionStatus = useCallback(
    async ({
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
      setStripeSubscriptionStatus(nextData?.stripeSubscriptionStatus ?? null);
      setCancelAtPeriodEnd(Boolean(nextData?.cancelAtPeriodEnd));
      setCurrentPeriodEnd(nextData?.currentPeriodEnd ?? null);

      if (nextIsSubscribed) {
        clearPendingCheckoutFlag();
        setClientSecret("");
        setStripePromise(null);

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
        cancelAtPeriodEnd: Boolean(nextData?.cancelAtPeriodEnd),
      };
    },
    [user?.role, variant]
  );

  useEffect(() => {
    let ignore = false;

    const initializeStatus = async () => {
      try {
        setIsInitialLoading(true);
        setError("");

        const result = await syncSubscriptionStatus();
        const hasPendingCheckout = readPendingCheckoutFlag();

        if (!ignore && !result.isSubscribed && hasPendingCheckout) {
          setMessage("Checking your subscription after payment confirmation...");
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
  }, [syncSubscriptionStatus]);

  const handleFailedPayment = useCallback(
    (failureMessage?: string) => {
      clearPendingCheckoutFlag();
      setShouldPollAfterReturn(false);
      setIsPolling(false);
      setIsSubscribed(false);
      setSubscriptionStatus("not_subscribed");
      setClientSecret("");
      setStripePromise(null);
      setError("");
      setMessage(
        `${failureMessage || "Payment failed."} Subscription is inactive. Redirecting to dashboard...`
      );
      setFailedPaymentRedirectPending(true);
    },
    []
  );

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
          handleFailedPayment("Payment failed or was not completed.");
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
  }, [handleFailedPayment, shouldPollAfterReturn, syncSubscriptionStatus]);

  const handleSubscribe = async () => {
    try {
      setIsCreatingSubscription(true);
      setError("");
      setMessage("");

      const statusResult = await syncSubscriptionStatus();

      if (statusResult.isSubscribed) {
        setMessage("Subscription is already active. You can continue.");
        return;
      }

      if (clientSecret && stripePromise) {
        return;
      }

      const response = await api.post<CreateSubscriptionResponse>(
        "/api/v1/subscriptions/create"
      );

      if (!response.data.success || !response.data.data?.clientSecret) {
        throw new Error(response.data.message || "Failed to initialize subscription payment.");
      }

      if (!response.data.data.publishableKey) {
        throw new Error("Stripe publishable key is not configured.");
      }

      setClientSecret(response.data.data.clientSecret);
      setStripePromise(loadStripe(response.data.data.publishableKey));
      setMessage("Enter your payment details below to activate the subscription.");
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
      setIsCreatingSubscription(false);
    }
  };

  const handlePaymentReadyForVerification = () => {
    setMessage("Payment confirmed. Waiting for the subscription to activate...");
    setShouldPollAfterReturn(true);
  };

  const handleContinue = () => {
    router.push(getDashboardRoute(resolvedRole ?? user?.role));
  };

  const handleSkip = () => {
    router.push(getDashboardRoute(resolvedRole ?? user?.role));
  };

  useEffect(() => {
    if (!failedPaymentRedirectPending) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      router.push(getDashboardRoute(resolvedRole ?? user?.role));
    }, 2500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [failedPaymentRedirectPending, resolvedRole, router, user?.role]);

  const handleStopRecurring = async () => {
    try {
      setIsUpdatingRecurring(true);
      setError("");

      const response = await api.post<SubscriptionStatusResponse>(
        "/api/v1/subscriptions/stop-recurring"
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to stop recurring subscription.");
      }

      setCancelAtPeriodEnd(Boolean(response.data.data?.cancelAtPeriodEnd));
      setCurrentPeriodEnd(response.data.data?.currentPeriodEnd ?? null);
      setMessage(
        response.data.message ||
          "Recurring subscription will stop at the end of the current billing period."
      );
    } catch (updateError) {
      setError(getSubscriptionErrorMessage(updateError));
    } finally {
      setIsUpdatingRecurring(false);
    }
  };

  const handleResumeRecurring = async () => {
    try {
      setIsUpdatingRecurring(true);
      setError("");

      const response = await api.post<SubscriptionStatusResponse>(
        "/api/v1/subscriptions/resume-recurring"
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to restart recurring subscription.");
      }

      setCancelAtPeriodEnd(Boolean(response.data.data?.cancelAtPeriodEnd));
      setCurrentPeriodEnd(response.data.data?.currentPeriodEnd ?? null);
      setMessage(
        response.data.message || "Recurring subscription has been restarted."
      );
    } catch (updateError) {
      setError(getSubscriptionErrorMessage(updateError));
    } finally {
      setIsUpdatingRecurring(false);
    }
  };

  const canResumeRecurring =
    isSubscribed &&
    cancelAtPeriodEnd &&
    (stripeSubscriptionStatus === "active" || stripeSubscriptionStatus === "trialing");

  const renderRecurringActionButton = () => {
    if (!isSubscribed) {
      return null;
    }

    if (canResumeRecurring) {
      return (
        <button
          type="button"
          onClick={handleResumeRecurring}
          disabled={isBusy}
          className="inline-flex h-12 w-full items-center justify-center rounded-2xl border border-[#E2E8F0] bg-white px-5 text-sm font-semibold text-[#334155] transition-colors hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:text-[#94A3B8]"
        >
          Restart recurring subscription
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={handleStopRecurring}
        disabled={isBusy}
        className="inline-flex h-12 w-full items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 px-5 text-sm font-semibold text-amber-800 transition-colors hover:bg-amber-100 disabled:cursor-not-allowed disabled:text-amber-400"
      >
        Stop recurring at period end
      </button>
    );
  };

  const renderPaymentSection = () => {
    if (isSubscribed) {
      if (variant === "dashboard") {
        return renderRecurringActionButton();
      }

      return (
        <button
          type="button"
          onClick={handleContinue}
          className="flex h-12 w-full items-center justify-center rounded-2xl bg-[#BD4745] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#a03735]"
        >
          Continue to Dashboard
        </button>
      );
    }

    if (clientSecret && stripePromise) {
      return (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <SubscriptionPaymentForm
            billingEmail={user?.email}
            billingName={user?.fullName}
            isBusy={isBusy}
            onError={(nextError) => {
              if (nextError) {
                setError(nextError);
              }
            }}
            onFailure={handleFailedPayment}
            onProcessingChange={setIsConfirmingPayment}
            onSuccess={handlePaymentReadyForVerification}
          />
        </Elements>
      );
    }

    return (
      <button
        type="button"
        onClick={handleSubscribe}
        disabled={isBusy}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#BD4745] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#a03735] disabled:cursor-not-allowed disabled:bg-[#d48a88]"
      >
        {isBusy ? (
          <>
            <LoaderCircle className="h-5 w-5 animate-spin" />
            Preparing payment form...
          </>
        ) : (
          "Subscribe"
        )}
      </button>
    );
  };

  if (variant === "modal") {
    return (
      <div className="max-h-[calc(100vh-3rem)] w-full max-w-2xl overflow-y-auto rounded-[28px] bg-white p-6 shadow-[0_30px_90px_rgba(15,23,42,0.28)] md:p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#B74140]">
              Subscription
            </p>
            <h2 className="mt-2 text-2xl font-bold text-[#0F172A] md:text-3xl">
              Activate your provider access
            </h2>
          </div>

          {onRequestClose ? (
            <button
              type="button"
              onClick={onRequestClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E2E8F0] text-[#475569] transition-colors hover:bg-[#F8FAFC]"
              aria-label="Close subscription modal"
            >
              <X className="h-5 w-5" />
            </button>
          ) : null}
        </div>

        <div className="space-y-5">
          <p className="text-sm leading-7 text-[#475569] md:text-base">
            Start the subscription below to activate bookings and paid access for your account
            without leaving your site.
          </p>

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

          <div className="rounded-2xl bg-[#F8FAFC] px-5 py-4 text-sm text-[#475569]">
            <p>
              Status:{" "}
              <span className="font-semibold text-[#0F172A]">
                {isInitialLoading
                  ? "Checking subscription..."
                  : subscriptionStatus.replace(/_/g, " ")}
              </span>
            </p>
            <p className="mt-2">
              The payment form is rendered with Stripe Elements and the backend activates access
              after webhook confirmation.
            </p>
          </div>

          {renderPaymentSection()}

          {!isSubscribed && allowSkip ? (
            <button
              type="button"
              onClick={handleSkip}
              disabled={isBusy}
              className="flex h-12 items-center justify-center rounded-2xl border border-[#E2E8F0] bg-white px-5 text-sm font-semibold text-[#334155] transition-colors hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:text-[#94A3B8]"
            >
              Skip for now
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  if (variant === "dashboard") {
    return (
      <div className="min-h-screen bg-white py-4 lg:py-6">
        <div className="max-w-3xl">
          <div className="rounded-[28px] border border-[#E5E7EB] bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] sm:p-8">
            <div className="space-y-6">
              <div className="rounded-[24px] bg-[linear-gradient(135deg,#fff7f7_0%,#ffffff_50%,#fff3f1_100%)] p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#9A6B6A]">
                      Access Status
                    </p>
                    {isPolling ? (
                      <p className="mt-3 text-sm text-slate-500">
                        Waiting for webhook confirmation...
                      </p>
                    ) : null}
                  </div>

                  <div className="inline-flex w-fit items-center rounded-full border border-[#F0D4D3] bg-white px-4 py-2 text-sm font-semibold text-[#9F2F2E] shadow-sm">
                    {formatDisplayLabel(subscriptionStatus) || "Not Subscribed"}
                  </div>
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

              {isSubscribed ? (
                <div className="rounded-[24px] border border-[#E8ECF2] bg-[#F8FAFC] px-5 py-5 text-sm text-slate-700">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Billing
                      </p>
                      <p className="mt-2 text-lg font-semibold text-slate-900">
                        {cancelAtPeriodEnd ? "Stops at period end" : "Recurring is active"}
                      </p>
                    </div>
                    {stripeSubscriptionStatus ? (
                      <div className="inline-flex w-fit rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700">
                        Stripe: {formatDisplayLabel(stripeSubscriptionStatus)}
                      </div>
                    ) : null}
                  </div>

                  {currentPeriodEnd ? (
                    <p className="mt-4 text-sm text-slate-600">
                      Current period ends on {new Date(currentPeriodEnd).toLocaleDateString()}.
                    </p>
                  ) : null}
                </div>
              ) : null}

              <div className="rounded-[24px] border border-[#EEF1F5] bg-white p-5">
                {renderPaymentSection()}
              </div>
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
                Your account has been created successfully. Subscribe once to unlock bookings,
                services, and everything inside your dashboard.
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
                Payment is collected directly on your site with Stripe Elements.
              </p>
            </div>

            {renderPaymentSection()}

            {!isSubscribed && allowSkip ? (
              <button
                type="button"
                onClick={handleSkip}
                disabled={isBusy}
                className="flex h-14 w-full items-center justify-center rounded-2xl border border-[#E2E8F0] bg-white text-base font-semibold text-[#334155] transition-colors hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:text-[#94A3B8]"
              >
                Skip for now
              </button>
            ) : null}
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
