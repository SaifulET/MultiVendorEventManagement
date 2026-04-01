'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Briefcase,
  Mail,
  RefreshCcw,
  ShieldCheck,
  Tags,
  User,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { api, getApiErrorMessage } from '@/lib/api';
import profileImage from '@/public/profile.jpg';

interface MeResponse {
  success: boolean;
  data: {
    userId: string;
    email: string;
    fullName: string;
    role: string;
    serviceCategories?: string[];
    onboarding?: Record<string, unknown>;
  };
}

interface ProfileData {
  userId: string;
  email: string;
  fullName: string;
  role: string;
  serviceCategories: string[];
  onboarding: Record<string, unknown>;
}

const emptyProfile: ProfileData = {
  userId: '',
  email: '',
  fullName: '',
  role: '',
  serviceCategories: [],
  onboarding: {},
};

const formatRole = (role: string) =>
  role
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData>(emptyProfile);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const onboardingKeys = useMemo(
    () => Object.keys(profile.onboarding ?? {}).filter(Boolean),
    [profile.onboarding]
  );

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await api.get<MeResponse>('/api/v1/auth/me');
      const user = response.data.data;

      setProfile({
        userId: user.userId ?? '',
        email: user.email ?? '',
        fullName: user.fullName ?? '',
        role: user.role ?? '',
        serviceCategories: Array.isArray(user.serviceCategories) ? user.serviceCategories : [],
        onboarding: user.onboarding ?? {},
      });
    } catch (fetchError) {
      const message = getApiErrorMessage(fetchError);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <div className="min-h-screen pb-10">
      <div className="mb-8 rounded-3xl bg-gradient-to-r from-[#B74140] via-[#c65a58] to-[#f3c7c6] p-8 text-white">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
          Account Profile
        </p>
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="overflow-hidden rounded-full border-4 border-white/40">
              <Image
                src={profileImage}
                alt="Profile avatar"
                width={88}
                height={88}
                className="h-[88px] w-[88px] object-cover"
                priority
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                {isLoading ? 'Loading profile...' : profile.fullName || 'Your profile'}
              </h1>
              <p className="mt-1 text-sm text-white/85">
                {profile.email || 'Your account details are shown below.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchProfile}
            className="inline-flex items-center gap-2 self-start rounded-xl border border-white/30 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/20"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {error ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">
          <p className="font-semibold text-red-700">Could not load your profile.</p>
          <p className="mt-1 text-sm text-red-600">{error}</p>
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={fetchProfile}
              className="rounded-lg bg-[#B74140] px-4 py-2 text-sm font-semibold text-white"
            >
              Try Again
            </button>
            <button
              type="button"
              onClick={() => router.push('/home/auth/signin')}
              className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700"
            >
              Go to Sign In
            </button>
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
          <h2 className="mb-6 text-xl font-bold text-slate-900">Personal Information</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-500">
                <User className="h-4 w-4" />
                Full Name
              </div>
              <p className="text-base font-semibold text-slate-900">
                {isLoading ? 'Loading...' : profile.fullName || 'Not available'}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-500">
                <Mail className="h-4 w-4" />
                Email
              </div>
              <p className="text-base font-semibold text-slate-900">
                {isLoading ? 'Loading...' : profile.email || 'Not available'}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-500">
                <Briefcase className="h-4 w-4" />
                Role
              </div>
              <p className="text-base font-semibold text-slate-900">
                {isLoading ? 'Loading...' : formatRole(profile.role || 'user')}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-500">
                <ShieldCheck className="h-4 w-4" />
                User ID
              </div>
              <p className="break-all text-base font-semibold text-slate-900">
                {isLoading ? 'Loading...' : profile.userId || 'Not available'}
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
            <h2 className="mb-4 text-xl font-bold text-slate-900">Service Categories</h2>

            {isLoading ? (
              <p className="text-sm text-slate-500">Loading categories...</p>
            ) : profile.serviceCategories.length ? (
              <div className="flex flex-wrap gap-2">
                {profile.serviceCategories.map((category) => (
                  <span
                    key={category}
                    className="rounded-full bg-[#B7414014] px-3 py-1.5 text-sm font-semibold text-[#B74140]"
                  >
                    {category}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                No service categories are attached to this account yet.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
            <h2 className="mb-4 text-xl font-bold text-slate-900">Onboarding Status</h2>

            {isLoading ? (
              <p className="text-sm text-slate-500">Checking onboarding details...</p>
            ) : onboardingKeys.length ? (
              <div className="space-y-3">
                {onboardingKeys.map((key) => (
                  <div
                    key={key}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3"
                  >
                    <Tags className="h-4 w-4 text-[#B74140]" />
                    <span className="text-sm font-medium text-slate-700">
                      {key.replace(/([a-z])([A-Z])/g, '$1 $2')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                No onboarding details were returned from `/api/v1/auth/me`.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
