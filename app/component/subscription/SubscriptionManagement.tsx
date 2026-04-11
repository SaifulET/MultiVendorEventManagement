"use client";

import React, { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";

import { api, getApiErrorMessage } from "@/lib/api";

interface SubscriptionDetails {
  status?: string;
  plan?: string;
  payment?: {
    amount?: number;
    currency?: string;
    billingCycle?: string;
    status?: string;
  };
}

interface AuthMeWithSubscriptionResponse {
  success: boolean;
  data: {
    role?: string;
    subscription?: SubscriptionDetails;
  };
}

interface PaymentIntentPayload {
  clientSecret?: string;
  paymentIntentId?: string;
  paymentStatus?: string;
  amount?: number;
  currency?: string;
  plan?: string;
  billingCycle?: string;
}

interface PaymentIntentResponse {
  success: boolean;
  message?: string;
  data?: PaymentIntentPayload;
}

interface VerifyPaymentResponse {
  success: boolean;
  message?: string;
  data?: {
    subscription?: SubscriptionDetails;
  };
}

const ACTIVE_SUBSCRIPTION_STATUSES = new Set(["active", "subscribed", "trialing"]);
const ACTIVE_PAYMENT_STATUSES = new Set(["active", "paid", "succeeded", "successful"]);

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
const stripePromise = stripePublishableKey
  ? loadStripe(stripePublishableKey)
  : null;

const isStripeConfigurationError = (message: string) => {
  const normalizedMessage = message.trim().toLowerCase();

  return (
    normalizedMessage.includes("stripe is not configured") ||
    normalizedMessage.includes("stripe not configured") ||
    normalizedMessage.includes("stripe configuration") ||
    normalizedMessage.includes("payment gateway is not configured")
  );
};

const getSubscriptionErrorMessage = (error: unknown) => {
  const message = getApiErrorMessage(error);

  if (isStripeConfigurationError(message)) {
    return "Stripe is not configured on the API server yet. Add the Stripe secret key and related backend Stripe environment variables, then try again.";
  }

  return message;
};

const formatCurrency = (amount?: number, currency?: string) => {
  if (typeof amount !== "number" || !currency) {
    return null;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
};

const toTitleCase = (value?: string) => {
  if (!value) {
    return "";
  }

  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const hasActiveSubscription = (subscription?: SubscriptionDetails) => {
  const subscriptionStatus = subscription?.status?.trim().toLowerCase() ?? "";
  const paymentStatus = subscription?.payment?.status?.trim().toLowerCase() ?? "";

  return (
    ACTIVE_SUBSCRIPTION_STATUSES.has(subscriptionStatus) ||
    ACTIVE_PAYMENT_STATUSES.has(paymentStatus)
  );
};

async function createPaymentIntent() {
  const response = await api.post<PaymentIntentResponse>(
    "/api/v1/subscriptions/payment-intent"
  );

  console.info("[subscription] payment-intent response", {
    status: response.status,
    success: response.data.success,
    message: response.data.message,
    hasClientSecret: Boolean(response.data.data?.clientSecret),
    paymentIntentId: response.data.data?.paymentIntentId ?? null,
  });

  if (!response.data.success || !response.data.data?.clientSecret) {
    throw new Error(response.data.message || "Failed to create payment intent");
  }

  return response.data.data;
}

async function verifyPayment(paymentIntentId: string) {
  const response = await api.post<VerifyPaymentResponse>(
    "/api/v1/subscriptions/verify-payment",
    { paymentIntentId }
  );

  console.info("[subscription] verify-payment response", {
    status: response.status,
    success: response.data.success,
    message: response.data.message,
    paymentIntentId,
    subscriptionStatus: response.data.data?.subscription?.status ?? null,
    paymentStatus: response.data.data?.subscription?.payment?.status ?? null,
  });

  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to verify payment");
  }

  return response.data.data;
}

function CheckoutForm({
  clientSecret,
  paymentIntentId,
  onVerified,
}: {
  clientSecret: string;
  paymentIntentId: string;
  onVerified: (
    message: string,
    verifiedSubscription?: SubscriptionDetails
  ) => Promise<void>;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const submitResult = await elements.submit();
      if (submitResult.error) {
        throw new Error(submitResult.error.message);
      }

      const result = await stripe.confirmPayment({
        elements,
        clientSecret,
        redirect: "if_required",
      });

      console.info("[subscription] stripe confirmPayment result", {
        hasError: Boolean(result.error),
        paymentIntentId: result.paymentIntent?.id ?? null,
        paymentIntentStatus: result.paymentIntent?.status ?? null,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      if (!result.paymentIntent) {
        throw new Error("No payment intent returned by Stripe.");
      }

      if (result.paymentIntent.status !== "succeeded") {
        throw new Error(`Payment status: ${result.paymentIntent.status}`);
      }

      const verifiedPayment = await verifyPayment(
        result.paymentIntent.id || paymentIntentId
      );

      await onVerified(
        "Payment verified and subscription activated.",
        verifiedPayment?.subscription
      );
    } catch (paymentError) {
      console.error("[subscription] checkout error", paymentError);
      setError(getSubscriptionErrorMessage(paymentError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-2xl border border-[#E5E7EB] p-4">
        <PaymentElement />
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={!stripe || !elements || isSubmitting}
        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#B74140] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#9c3635] disabled:cursor-not-allowed disabled:bg-[#d28a89]"
      >
        {isSubmitting ? (
          <>
            <LoaderCircle className="h-5 w-5 animate-spin" />
            Processing payment...
          </>
        ) : (
          "Pay and subscribe"
        )}
      </button>
    </form>
  );
}

export default function SubscriptionManagement() {
  const [isLoading, setIsLoading] = useState(true);
  const [isCallingPaymentApi, setIsCallingPaymentApi] = useState(false);
  const [isRefreshingProfile, setIsRefreshingProfile] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionDetails | undefined>();
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntentPayload | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadSubscription = async (showSpinner: boolean) => {
    try {
      if (showSpinner) {
        setIsLoading(true);
      } else {
        setIsRefreshingProfile(true);
      }

      setError("");

      const response = await api.get<AuthMeWithSubscriptionResponse>("/api/v1/auth/me");
      const nextSubscription = response.data.data.subscription;

      setSubscription(nextSubscription);
      setIsSubscribed(hasActiveSubscription(nextSubscription));
    } catch (loadError) {
      setError(getSubscriptionErrorMessage(loadError));
    } finally {
      if (showSpinner) {
        setIsLoading(false);
      } else {
        setIsRefreshingProfile(false);
      }
    }
  };

  useEffect(() => {
    void loadSubscription(true);
  }, []);

  const handleSubscribe = async () => {
    if (!stripePromise) {
      setError(
        "Stripe publishable key is missing on the frontend. Add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY and try again."
      );
      setMessage("");
      return;
    }

    try {
      setIsCallingPaymentApi(true);
      setError("");
      setMessage("");

      const nextPaymentIntent = await createPaymentIntent();

      setPaymentIntent(nextPaymentIntent);
      setMessage(
        nextPaymentIntent.plan
          ? `Payment started for ${toTitleCase(nextPaymentIntent.plan)}.`
          : "Payment started. Enter your card details to continue."
      );
    } catch (paymentError) {
      console.error("[subscription] payment-intent error", paymentError);
      setError(getSubscriptionErrorMessage(paymentError));
    } finally {
      setIsCallingPaymentApi(false);
    }
  };

  const handlePaymentVerified = async (
    successMessage: string,
    verifiedSubscription?: SubscriptionDetails
  ) => {
    setPaymentIntent(null);
    setSubscription(verifiedSubscription);
    setIsSubscribed(true);
    setMessage(successMessage);
    await loadSubscription(false);
  };

  const handleCancelClick = () => {
    setMessage("Cancel subscription is not connected yet.");
    setError("");
  };

  const formattedAmount = formatCurrency(
    paymentIntent?.amount ?? subscription?.payment?.amount,
    paymentIntent?.currency ?? subscription?.payment?.currency
  );

  return (
    <div className="min-h-screen bg-white py-4 lg:py-6">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold text-slate-900">Subscription</h1>

        <div className="mt-6 rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
          {isLoading ? (
            <div className="flex min-h-[180px] items-center justify-center gap-3 text-slate-600">
              <LoaderCircle className="h-5 w-5 animate-spin" />
              <span>Loading subscription...</span>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
                    Status
                  </p>
                  <h2 className="mt-3 text-3xl font-bold text-slate-900">
                    {isSubscribed ? "Subscribed" : "Not subscribed"}
                  </h2>
                  {isRefreshingProfile ? (
                    <p className="mt-2 text-sm text-slate-500">
                      Refreshing subscription from `/api/v1/auth/me`...
                    </p>
                  ) : null}
                </div>

                {(subscription?.status || subscription?.payment?.status) && isSubscribed ? (
                  <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                    <p>Subscription: {toTitleCase(subscription?.status) || "Active"}</p>
                    <p>Payment: {toTitleCase(subscription?.payment?.status) || "Succeeded"}</p>
                  </div>
                ) : null}
              </div>

              {(paymentIntent?.plan || paymentIntent?.billingCycle || formattedAmount) && !isSubscribed ? (
                <div className="rounded-2xl border border-[#E5E7EB] bg-slate-50 px-4 py-4 text-sm text-slate-700">
                  {paymentIntent?.plan ? <p>Plan: {toTitleCase(paymentIntent.plan)}</p> : null}
                  {paymentIntent?.billingCycle ? (
                    <p>Billing cycle: {toTitleCase(paymentIntent.billingCycle)}</p>
                  ) : null}
                  {formattedAmount ? <p>Amount: {formattedAmount}</p> : null}
                </div>
              ) : null}

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
                <button
                  type="button"
                  onClick={handleCancelClick}
                  className="inline-flex items-center justify-center rounded-2xl border border-[#E5E7EB] px-5 py-3 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50"
                >
                  Cancel Subscription
                </button>
              ) : paymentIntent?.clientSecret && paymentIntent.paymentIntentId ? (
                <div className="space-y-4">
                  <Elements
                    stripe={stripePromise}
                    options={{ clientSecret: paymentIntent.clientSecret }}
                  >
                    <CheckoutForm
                      clientSecret={paymentIntent.clientSecret}
                      paymentIntentId={paymentIntent.paymentIntentId}
                      onVerified={handlePaymentVerified}
                    />
                  </Elements>

                  <p className="text-xs text-slate-500">
                    Use Stripe Payment Element with a test card like 4242 4242 4242
                    4242, any future expiry, any CVC, and any ZIP.
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleSubscribe}
                  disabled={isCallingPaymentApi}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#B74140] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#9c3635] disabled:cursor-not-allowed disabled:bg-[#d28a89]"
                >
                  {isCallingPaymentApi ? (
                    <>
                      <LoaderCircle className="h-5 w-5 animate-spin" />
                      Preparing secure payment...
                    </>
                  ) : (
                    "Subscribe"
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
