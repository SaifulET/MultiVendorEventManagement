"use client";

import React, { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";

import { api, getApiErrorMessage } from "@/lib/api";

interface SubscriptionDetails {
  status?: string;
  payment?: {
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
}

interface PaymentIntentResponse {
  success: boolean;
  message?: string;
  data?: PaymentIntentPayload;
}

const ACTIVE_SUBSCRIPTION_STATUSES = new Set(["active", "subscribed", "trialing"]);
const ACTIVE_PAYMENT_STATUSES = new Set(["active", "paid", "succeeded", "successful"]);

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

const hasActiveSubscription = (subscription?: SubscriptionDetails) => {
  const subscriptionStatus = subscription?.status?.trim().toLowerCase() ?? "";
  const paymentStatus = subscription?.payment?.status?.trim().toLowerCase() ?? "";

  return (
    ACTIVE_SUBSCRIPTION_STATUSES.has(subscriptionStatus) ||
    ACTIVE_PAYMENT_STATUSES.has(paymentStatus)
  );
};

export default function SubscriptionManagement() {
  const [isLoading, setIsLoading] = useState(true);
  const [isCallingPaymentApi, setIsCallingPaymentApi] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadSubscription = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await api.get<AuthMeWithSubscriptionResponse>("/api/v1/auth/me");
        setIsSubscribed(hasActiveSubscription(response.data.data.subscription));
      } catch (loadError) {
        setError(getSubscriptionErrorMessage(loadError));
      } finally {
        setIsLoading(false);
      }
    };

    void loadSubscription();
  }, []);

  const handleSubscribe = async () => {
    try {
      setIsCallingPaymentApi(true);
      setError("");
      setMessage("");

      const response = await api.post<PaymentIntentResponse>(
        "/api/v1/subscriptions/payment-intent"
      );

      console.log("Subscription payment-intent response:", response);
      setMessage(response.data.message ?? "Payment API called successfully.");
    } catch (paymentError) {
      console.error("Subscription payment-intent error:", paymentError);
      setError(getSubscriptionErrorMessage(paymentError));
    } finally {
      setIsCallingPaymentApi(false);
    }
  };

  const handleCancelClick = () => {
    setMessage("Cancel subscription is not connected yet.");
    setError("");
  };

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
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
                  Status
                </p>
                <h2 className="mt-3 text-3xl font-bold text-slate-900">
                  {isSubscribed ? "Subscribed" : "Not subscribed"}
                </h2>
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
                <button
                  type="button"
                  onClick={handleCancelClick}
                  className="inline-flex items-center justify-center rounded-2xl border border-[#E5E7EB] px-5 py-3 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50"
                >
                  Cancel Subscription
                </button>
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
                      Calling payment API...
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