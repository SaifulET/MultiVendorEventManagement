'use client'

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";

import type { RoleAuthConfig } from "@/app/component/auth/role-auth-config";
import AuthShell from "@/app/component/home/auth/AuthShell";
import { useAuthStore } from "@/store/useAuthStore";

interface RoleSigninPageProps {
  config: RoleAuthConfig;
}

export default function RoleSigninPage({ config }: RoleSigninPageProps) {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const apiError = useAuthStore((state) => state.error);
  const isLoading = useAuthStore((state) => state.isLoading);
  const clearError = useAuthStore((state) => state.clearError);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState("");

  const formError = validationError || apiError;
  const isFormValid = useMemo(
    () => email.trim() !== "" && password.trim() !== "",
    [email, password]
  );

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

    if (!email.trim() || !password.trim()) {
      setValidationError("Email and password are required.");
      return;
    }

    try {
      await login({
        email: email.trim(),
        password,
      });

      router.push(config.welcomePath);
    } catch {
      // Store error is already handled for the UI.
    }
  };

  return (
    <AuthShell
      title={config.loginTitle}
      subtitle={config.loginSubtitle}
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
              placeholder="Enter your password"
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

        <div className="mb-5 flex justify-end text-sm md:text-base">
          <Link
            href={`${config.basePath}/forgetpassword`}
            className="text-white transition-colors hover:text-white/80"
          >
            Forgot Password?
          </Link>
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
          {isLoading ? "Signing In..." : "Sign In"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-white md:text-base">
        <span>Don&apos;t have an account? </span>
        <Link href={`${config.basePath}/signup`} className="font-semibold hover:underline">
          Create New Account
        </Link>
      </div>
    </AuthShell>
  );
}
