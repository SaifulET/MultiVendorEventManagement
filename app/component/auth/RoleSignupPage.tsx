'use client'

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";

import AuthShell from "@/app/component/home/auth/AuthShell";
import type { RoleAuthConfig } from "@/app/component/auth/role-auth-config";
import { useAuthStore } from "@/store/useAuthStore";

interface RoleSignupPageProps {
  config: RoleAuthConfig;
}

export default function RoleSignupPage({ config }: RoleSignupPageProps) {
  const router = useRouter();
  const register = useAuthStore((state) => state.register);
  const apiError = useAuthStore((state) => state.error);
  const isLoading = useAuthStore((state) => state.isLoading);
  const clearError = useAuthStore((state) => state.clearError);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [validationError, setValidationError] = useState("");

  const formError = validationError || apiError;

  const isFormValid = useMemo(
    () =>
      fullName.trim() !== "" &&
      email.trim() !== "" &&
      password.trim() !== "" &&
      confirmPassword.trim() !== "" &&
      password === confirmPassword &&
      agreeToTerms,
    [agreeToTerms, confirmPassword, email, fullName, password]
  );

  const validateForm = () => {
    if (!fullName.trim()) {
      return "Full name is required.";
    }

    if (!email.trim()) {
      return "Email is required.";
    }

    if (!password.trim()) {
      return "Password is required.";
    }

    if (password.length < 6) {
      return "Password must be at least 6 characters.";
    }

    if (!confirmPassword.trim()) {
      return "Please confirm your password.";
    }

    if (password !== confirmPassword) {
      return "Passwords do not match.";
    }

    if (!agreeToTerms) {
      return "You must agree to the terms and conditions.";
    }

    return "";
  };

  const clearMessages = () => {
    if (validationError) {
      setValidationError("");
    }

    if (apiError) {
      clearError();
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextValidationError = validateForm();
    if (nextValidationError) {
      setValidationError(nextValidationError);
      return;
    }

    try {
      const result = await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        role: config.role,
      });

      router.push(
        `${config.basePath}/verify-email?email=${encodeURIComponent(result.user.email)}&source=signup`
      );
    } catch {
      // Store error is already handled for the UI.
    }
  };

  return (
    <AuthShell
      title="Create Your Account"
      subtitle={config.signupSubtitle}
      heroLines={config.heroLines}
      heroAccentLineIndex={config.heroAccentLineIndex}
      heroDescription={config.heroDescription}
    >
      <form onSubmit={handleSubmit}>
        <div className="mb-5 rounded-lg bg-[#00000080] px-1 py-1.5">
          <label
            htmlFor="fullName"
            className="mb-2 block px-3 text-sm font-semibold text-white md:text-base"
          >
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            className="w-full rounded-xl bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 md:py-3.5 md:text-base"
            placeholder="Enter your full name"
            value={fullName}
            onChange={(event) => {
              clearMessages();
              setFullName(event.target.value);
            }}
          />
        </div>

        <div className="mb-5 rounded-lg bg-[#00000080] px-1 py-1.5">
          <label
            htmlFor="email"
            className="mb-2 block px-3 text-sm font-semibold text-white md:text-base"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            className="w-full rounded-xl bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 md:py-3.5 md:text-base"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => {
              clearMessages();
              setEmail(event.target.value);
            }}
          />
        </div>

        <div className="mb-5 rounded-lg bg-[#00000080] px-1 py-1.5">
          <label
            htmlFor="password"
            className="mb-2 block px-3 text-sm font-semibold text-white md:text-base"
          >
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              className="w-full rounded-xl bg-white px-4 py-3 pr-12 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 md:py-3.5 md:text-base"
              placeholder="Create a strong password"
              value={password}
              onChange={(event) => {
                clearMessages();
                setPassword(event.target.value);
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 transition-colors hover:text-gray-700"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <div className="mb-5 rounded-lg bg-[#00000080] px-1 py-1.5">
          <label
            htmlFor="confirmPassword"
            className="mb-2 block px-3 text-sm font-semibold text-white md:text-base"
          >
            Confirm Password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            id="confirmPassword"
            className="w-full rounded-xl bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 md:py-3.5 md:text-base"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(event) => {
              clearMessages();
              setConfirmPassword(event.target.value);
            }}
          />
        </div>

        <div className="mb-5 flex items-start text-sm text-white md:text-base">
          <input
            type="checkbox"
            id="agree"
            checked={agreeToTerms}
            onChange={(event) => {
              clearMessages();
              setAgreeToTerms(event.target.checked);
            }}
            className="mt-1 h-4 w-4 cursor-pointer rounded border-gray-300 text-red-600 focus:ring-red-500"
          />
          <label htmlFor="agree" className="ml-3 cursor-pointer leading-6">
            I agree to the{" "}
            <Link
              href="/pages/termsAndConditions"
              className="font-semibold text-[#F5B7B6] transition-colors hover:text-white"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/pages/privacyPolicy"
              className="font-semibold text-[#F5B7B6] transition-colors hover:text-white"
            >
              Privacy Policy
            </Link>
            .
          </label>
        </div>

        {formError ? (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/20 p-3 text-center text-sm text-white">
            {formError}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={!isFormValid || isLoading}
          className={`w-full rounded-xl py-3 text-base font-semibold text-white transition-all duration-300 md:py-3.5 md:text-lg ${
            !isFormValid || isLoading
              ? "cursor-not-allowed bg-[#8a0808]/70"
              : "bg-[#8a0808] hover:bg-[#660202] hover:shadow-xl"
          }`}
        >
          {isLoading ? "Creating Account..." : "Sign Up"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-white md:text-base">
        <span>Already have an account? </span>
        <Link href={`${config.basePath}/signin`} className="font-semibold hover:underline">
          Log In
        </Link>
      </div>
    </AuthShell>
  );
}
