"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { api, getApiErrorMessage } from "@/lib/api";
import { clearStoredToken, setStoredToken } from "@/lib/auth-storage";
import type {
  ApiResponse,
  AuthSuccessData,
  AuthUser,
  EventPlannerOnboardingPayload,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  RegisterResponseData,
  ServiceProviderOnboardingPayload,
  UserOnlyResponseData,
  VerifyEmailPayload,
  VenueProviderOnboardingPayload,
} from "@/types/auth";

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  pendingEmail: string | null;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
  updateUser: (updates: Partial<AuthUser>) => void;
  register: (payload: RegisterPayload) => Promise<RegisterResponseData>;
  verifyEmail: (payload: VerifyEmailPayload) => Promise<AuthSuccessData>;
  login: (payload: LoginPayload) => Promise<AuthSuccessData>;
  forgotPassword: (payload: ForgotPasswordPayload) => Promise<string>;
  submitServiceProviderOnboarding: (
    payload: ServiceProviderOnboardingPayload | FormData
  ) => Promise<RegisterResponseData>;
  submitEventPlannerOnboarding: (
    payload: EventPlannerOnboardingPayload | FormData
  ) => Promise<RegisterResponseData>;
  submitVenueProviderOnboarding: (
    payload: VenueProviderOnboardingPayload
  ) => Promise<UserOnlyResponseData>;
  clearError: () => void;
  clearSuccessMessage: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      pendingEmail: null,
      isLoading: false,
      error: null,
      successMessage: null,

      updateUser: (updates) =>
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                ...updates,
              }
            : state.user,
        })),

      register: async (payload) => {
        try {
          set({ isLoading: true, error: null, successMessage: null });

          const response = await api.post<ApiResponse<RegisterResponseData>>(
            "/api/v1/auth/register",
            payload
          );

          set({
            pendingEmail: response.data.data.user.email,
            isLoading: false,
            successMessage: response.data.message,
          });

          return response.data.data;
        } catch (error) {
          const message = getApiErrorMessage(error);
          set({ isLoading: false, error: message });
          throw error;
        }
      },

      verifyEmail: async (payload) => {
        try {
          set({ isLoading: true, error: null, successMessage: null });

          const response = await api.post<ApiResponse<AuthSuccessData>>(
            "/api/v1/auth/verify-email",
            payload
          );

          setStoredToken(response.data.data.token);

          set({
            token: response.data.data.token,
            user: response.data.data.user,
            pendingEmail: null,
            isLoading: false,
            successMessage: response.data.message,
          });

          return response.data.data;
        } catch (error) {
          const message = getApiErrorMessage(error);
          set({ isLoading: false, error: message });
          throw error;
        }
      },

      login: async (payload) => {
        try {
          set({ isLoading: true, error: null, successMessage: null });

          const response = await api.post<ApiResponse<AuthSuccessData>>(
            "/api/v1/auth/login",
            payload
          );

          setStoredToken(response.data.data.token);

          set({
            token: response.data.data.token,
            user: response.data.data.user,
            pendingEmail: null,
            isLoading: false,
            successMessage: response.data.message,
          });

          return response.data.data;
        } catch (error) {
          const message = getApiErrorMessage(error);
          set({ isLoading: false, error: message });
          throw error;
        }
      },

      forgotPassword: async (payload) => {
        try {
          set({ isLoading: true, error: null, successMessage: null });

          const response = await api.post<ApiResponse<null>>(
            "/api/v1/auth/forgot-password",
            payload
          );

          set({
            pendingEmail: payload.email,
            isLoading: false,
            successMessage: response.data.message,
          });

          return response.data.message;
        } catch (error) {
          const message = getApiErrorMessage(error);
          set({ isLoading: false, error: message });
          throw error;
        }
      },

      submitServiceProviderOnboarding: async (payload) => {
        try {
          set({ isLoading: true, error: null, successMessage: null });

          const response = await api.post<ApiResponse<RegisterResponseData>>(
            "/api/v1/auth/onboarding/service-provider",
            payload
          );

          set({
            user: response.data.data.user,
            isLoading: false,
            successMessage: response.data.message,
          });

          return response.data.data;
        } catch (error) {
          const message = getApiErrorMessage(error);
          set({ isLoading: false, error: message });
          throw error;
        }
      },

      submitEventPlannerOnboarding: async (payload) => {
        try {
          set({ isLoading: true, error: null, successMessage: null });

          const response = await api.post<ApiResponse<RegisterResponseData>>(
            "/api/v1/auth/onboarding/event-planner",
            payload
          );
          set({
            user: response.data.data.user,
            isLoading: false,
            successMessage: response.data.message,
          });

          return response.data.data;
        } catch (error) {
          const message = getApiErrorMessage(error);
          set({ isLoading: false, error: message });
          throw error;
        }
      },

      submitVenueProviderOnboarding: async (payload) => {
        try {
          set({ isLoading: true, error: null, successMessage: null });

          const response = await api.post<ApiResponse<UserOnlyResponseData>>(
            "/api/v1/auth/onboarding/venue-provider",
            payload
          );

          set({
            user: response.data.data.user,
            isLoading: false,
            successMessage: response.data.message,
          });

          return response.data.data;
        } catch (error) {
          const message = getApiErrorMessage(error);
          set({ isLoading: false, error: message });
          throw error;
        }
      },

      clearError: () => set({ error: null }),

      clearSuccessMessage: () => set({ successMessage: null }),

      logout: () => {
        clearStoredToken();
        set({
          token: null,
          user: null,
          pendingEmail: null,
          error: null,
          successMessage: null,
        });
      },
    }),
    {
      name: "evenit-auth-store",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        pendingEmail: state.pendingEmail,
      }),
    }
  )
);
