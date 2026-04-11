import axios, { AxiosHeaders } from "axios";

import { getStoredToken } from "@/lib/auth-storage";

const FALLBACK_API_BASE_URL =
  "https://evenit-backend.onrender.com";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? FALLBACK_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  const headers = new AxiosHeaders(config.headers);
  const requestUrl = config.url ?? "";
  const isSubscriptionRequest =
    requestUrl.includes("/api/v1/subscriptions/payment-intent") ||
    requestUrl.includes("/api/v1/subscriptions/verify-payment");

  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    headers.delete("Content-Type");
  }

  if (!token) {
    config.headers = headers;
    return config;
  }

  headers.set("Authorization", `Bearer ${token}`);
  config.headers = headers;

  if (isSubscriptionRequest) {
    console.info("[api] subscription request", {
      baseURL: config.baseURL,
      url: config.url,
      hasToken: Boolean(token),
      authorizationHeaderSet: true,
    });
  }

  return config;
});

export const getApiErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const responseMessage = error.response?.data?.message;

    if (typeof responseMessage === "string" && responseMessage.trim()) {
      return responseMessage;
    }

    if (typeof error.message === "string" && error.message.trim()) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
};
