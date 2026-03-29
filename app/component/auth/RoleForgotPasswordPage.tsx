'use client'

import Link from "next/link";
import React, { useState } from "react";

import type { RoleAuthConfig } from "@/app/component/auth/role-auth-config";
import AuthShell from "@/app/component/home/auth/AuthShell";
import { useAuthStore } from "@/store/useAuthStore";

interface RoleForgotPasswordPageProps {
  config: RoleAuthConfig;
}

export default function RoleForgotPasswordPage({
  config,
}: RoleForgotPasswordPageProps) {
  const forgotPassword = useAuthStore((state) => state.forgotPassword);
  const apiError = useAuthStore((state) => state.error);
  const successMessage = useAuthStore((state) => state.successMessage);
  const isLoading = useAuthStore((state) => state.isLoading);
  const clearError = useAuthStore((state) => state.clearError);
  const clearSuccessMessage = useAuthStore((state) => state.clearSuccessMessage);

  const [email, setEmail] = useState("");
  const [validationError, setValidationError] = useState("");

  const formError = validationError || apiError;

  const clearMessages = () => {
    if (validationError) {
      setValidationError("");
    }

    if (apiError) {
      clearError();
    }

    if (successMessage) {
      clearSuccessMessage();
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim()) {
      setValidationError("Email is required.");
      return;
    }

    try {
      await forgotPassword({
        email: email.trim(),
      });
    } catch {
      // Store error is already handled for the UI.
    }
  };

  return (
    <AuthShell
      title="Forgot Password"
      subtitle={config.forgotSubtitle}
      heroLines={config.heroLines}
      heroAccentLineIndex={config.heroAccentLineIndex}
      heroDescription={config.heroDescription}
    >
      <form onSubmit={handleSubmit}>
        <div className="mb-6 rounded-lg bg-[#00000080] px-1 py-1.5">
          <label
            htmlFor="email"
            className="mb-2 block px-3 text-sm font-semibold text-white md:text-base"
          >
            Email Address
          </label>
          <input
            type="email"
            id="email"
            className="w-full rounded-xl bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 md:py-3.5 md:text-base"
            placeholder="Enter your email address"
            value={email}
            onChange={(event) => {
              clearMessages();
              setEmail(event.target.value);
            }}
          />
        </div>

        {formError ? (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/20 p-3 text-center text-sm text-white">
            {formError}
          </div>
        ) : null}

        {successMessage ? (
          <div className="mb-4 rounded-xl border border-emerald-400/30 bg-emerald-500/20 p-3 text-center text-sm text-white">
            {successMessage}. Check your inbox for the OTP.
          </div>
        ) : null}

        <button
          type="submit"
          disabled={!email.trim() || isLoading}
          className={`mb-6 w-full rounded-xl py-3 text-base font-semibold text-white transition-all duration-300 md:py-3.5 md:text-lg ${
            !email.trim() || isLoading
              ? "cursor-not-allowed bg-[#8a0808]/70"
              : "bg-[#8a0808] hover:bg-[#660202] hover:shadow-xl"
          }`}
        >
          {isLoading ? "Sending OTP..." : "Send Code"}
        </button>
      </form>

      <div className="text-center text-sm text-white md:text-base">
        <Link href={`${config.basePath}/signin`} className="font-semibold hover:underline">
          Back to Sign In
        </Link>
      </div>
    </AuthShell>
  );
}
