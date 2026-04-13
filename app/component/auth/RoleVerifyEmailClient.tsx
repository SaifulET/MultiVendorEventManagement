'use client'

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";

import type { RoleAuthConfig } from "@/app/component/auth/role-auth-config";
import AuthShell from "@/app/component/home/auth/AuthShell";
import { useAuthStore } from "@/store/useAuthStore";

const OTP_LENGTH = 6;

interface RoleVerifyEmailClientProps {
  config: RoleAuthConfig;
}

export default function RoleVerifyEmailClient({
  config,
}: RoleVerifyEmailClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verifyEmail = useAuthStore((state) => state.verifyEmail);
  const pendingEmail = useAuthStore((state) => state.pendingEmail);
  const apiError = useAuthStore((state) => state.error);
  const isLoading = useAuthStore((state) => state.isLoading);
  const clearError = useAuthStore((state) => state.clearError);

  const [email, setEmail] = useState(searchParams.get("email") ?? pendingEmail ?? "");
  const [otpValues, setOtpValues] = useState<string[]>(
    Array.from({ length: OTP_LENGTH }, () => "")
  );
  const [validationError, setValidationError] = useState("");

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const formError = validationError || apiError;
  const otp = useMemo(() => otpValues.join(""), [otpValues]);

  useEffect(() => {
    const requestedEmail = searchParams.get("email") ?? pendingEmail ?? "";
    if (requestedEmail && requestedEmail !== email) {
      setEmail(requestedEmail);
    }
  }, [email, pendingEmail, searchParams]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const clearMessages = () => {
    if (validationError) {
      setValidationError("");
    }

    if (apiError) {
      clearError();
    }
  };

  const updateOtpValue = (index: number, value: string) => {
    const nextCharacter = value.replace(/\D/g, "").slice(-1);

    setOtpValues((current) => {
      const nextValues = [...current];
      nextValues[index] = nextCharacter;
      return nextValues;
    });

    if (nextCharacter && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();

    const pastedDigits = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH)
      .split("");

    if (!pastedDigits.length) {
      return;
    }

    const nextValues = Array.from({ length: OTP_LENGTH }, (_, index) => {
      return pastedDigits[index] ?? "";
    });

    setOtpValues(nextValues);

    const focusIndex = Math.min(pastedDigits.length, OTP_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Backspace" && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim()) {
      setValidationError("Email is required.");
      return;
    }

    if (otp.length !== OTP_LENGTH) {
      setValidationError("Please enter the 6-digit OTP.");
      return;
    }

    try {
      await verifyEmail({
        email: email.trim(),
        otp,
      });

      const source = searchParams.get("source") ?? "verify";
      router.push(`${config.welcomePath}?source=${encodeURIComponent(source)}`);
    } catch {
      // Store error is already handled for the UI.
    }
  };

  return (
    <AuthShell
      title="Verify Your Email"
      subtitle={config.verifySubtitle}
      heroLines={config.heroLines}
      heroAccentLineIndex={config.heroAccentLineIndex}
      heroDescription={config.heroDescription}
    >
      <form onSubmit={handleSubmit}>
        <div className="mb-5 rounded-lg bg-[#00000080] px-1 py-1.5">
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

        <div className="mb-3">
          <p className="mb-4 text-sm text-white/80 md:text-base">
            We sent a verification code to{" "}
            <span className="font-semibold text-white">
              {email || "your email address"}
            </span>
            .
          </p>

          <div className="grid grid-cols-6 gap-3">
            {otpValues.map((value, index) => (
              <input
                key={index}
                ref={(element) => {
                  inputRefs.current[index] = element;
                }}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={1}
                value={value}
                onChange={(event) => {
                  clearMessages();
                  updateOtpValue(index, event.target.value);
                }}
                onKeyDown={(event) => handleKeyDown(index, event)}
                onPaste={handlePaste}
                className="h-14 rounded-2xl border border-white/30 bg-white/10 text-center text-xl font-semibold text-white outline-none transition focus:border-white focus:bg-white/15 md:h-16 md:text-2xl"
              />
            ))}
          </div>
        </div>

        {formError ? (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/20 p-3 text-center text-sm text-white">
            {formError}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={!email.trim() || otp.length !== OTP_LENGTH || isLoading}
          className={`w-full rounded-xl py-3 text-base font-semibold text-white transition-all duration-300 md:py-3.5 md:text-lg ${
            !email.trim() || otp.length !== OTP_LENGTH || isLoading
              ? "cursor-not-allowed bg-[#8a0808]/70"
              : "bg-[#8a0808] hover:bg-[#660202] hover:shadow-xl"
          }`}
        >
          {isLoading ? "Verifying..." : "Verify Email"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-white md:text-base">
        <span>Need another code? </span>
        <Link href={`${config.basePath}/signup`} className="font-semibold hover:underline">
          Register again
        </Link>
      </div>
    </AuthShell>
  );
}
