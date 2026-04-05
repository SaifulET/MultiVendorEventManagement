'use client';

import React, { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import {
  Briefcase,
  Camera,
  Check,
  Mail,
  Phone,
  RefreshCcw,
  Tags,
  User,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import {
  emptyProfileSettingsData,
  fetchAuthMeProfile,
  formatRole,
  type ProfileSettingsData,
} from '@/lib/auth-me';
import { getApiErrorMessage } from '@/lib/api';
import profileImage from '@/public/profile.jpg';

interface EditableProfile extends ProfileSettingsData {
  mobileNumber: string;
}

const emptyEditableProfile: EditableProfile = {
  ...emptyProfileSettingsData,
  mobileNumber: '',
};

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<EditableProfile>(emptyEditableProfile);
  const [draftProfile, setDraftProfile] = useState<EditableProfile>(emptyEditableProfile);
  const [savedProfilePhoto, setSavedProfilePhoto] = useState(profileImage.src);
  const [draftProfilePhoto, setDraftProfilePhoto] = useState(profileImage.src);
  const [isEditing, setIsEditing] = useState(false);
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

      const data = await fetchAuthMeProfile();
      const nextProfile = {
        ...data,
        mobileNumber: '',
      };

      setProfile(nextProfile);
      setDraftProfile(nextProfile);
    } catch (fetchError) {
      setError(getApiErrorMessage(fetchError));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchProfile();
  }, []);

  const handleProfileChange = (
    field: keyof Pick<EditableProfile, 'fullName' | 'email' | 'mobileNumber'>,
    value: string
  ) => {
    setDraftProfile((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateDraftImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setDraftProfilePhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleStartEditing = () => {
    setDraftProfile(profile);
    setDraftProfilePhoto(savedProfilePhoto);
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    setDraftProfile(profile);
    setDraftProfilePhoto(savedProfilePhoto);
    setIsEditing(false);
  };

  const handleSaveChanges = () => {
    setProfile(draftProfile);
    setSavedProfilePhoto(draftProfilePhoto);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen pb-10">
      <div className="mb-8 rounded-3xl bg-gradient-to-r from-[#B74140] via-[#c65a58] to-[#f3c7c6] p-8 text-white">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
          Account Profile
        </p>
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative overflow-hidden rounded-full border-4 border-white/40">
              <img
                src={isEditing ? draftProfilePhoto : savedProfilePhoto}
                alt="Profile avatar"
                className="h-[88px] w-[88px] object-cover"
              />
              {isEditing ? (
                <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/30 transition-colors hover:bg-black/40">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={updateDraftImage}
                    className="hidden"
                  />
                  <Camera className="h-5 w-5 text-white" />
                </label>
              ) : null}
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

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={fetchProfile}
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/20"
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </button>

            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={handleCancelEditing}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveChanges}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                >
                  <Check className="h-4 w-4" />
                  Save Changes
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleStartEditing}
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#B74140] transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <User className="h-4 w-4" />
                Edit Profile
              </button>
            )}
          </div>
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
          <h2 className="mb-6 text-xl font-bold text-slate-900">Profile Information</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-500">
                <User className="h-4 w-4" />
                Full Name
              </label>
              <input
                type="text"
                value={isEditing ? draftProfile.fullName : profile.fullName}
                onChange={(event) => handleProfileChange('fullName', event.target.value)}
                disabled={!isEditing}
                className={`w-full rounded-lg border px-4 py-3 text-base font-semibold outline-none transition-all ${
                  isEditing
                    ? 'border-[#E5E7EB] bg-white text-slate-900 focus:border-[#B74140] focus:ring-2 focus:ring-[#B7414020]'
                    : 'border-transparent bg-transparent px-0 py-0 text-slate-900'
                }`}
                placeholder="Full name"
              />
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-500">
                <Mail className="h-4 w-4" />
                Email
              </label>
              <input
                type="email"
                value={isEditing ? draftProfile.email : profile.email}
                onChange={(event) => handleProfileChange('email', event.target.value)}
                disabled={!isEditing}
                className={`w-full rounded-lg border px-4 py-3 text-base font-semibold outline-none transition-all ${
                  isEditing
                    ? 'border-[#E5E7EB] bg-white text-slate-900 focus:border-[#B74140] focus:ring-2 focus:ring-[#B7414020]'
                    : 'border-transparent bg-transparent px-0 py-0 text-slate-900'
                }`}
                placeholder="Email address"
              />
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-500">
                <Phone className="h-4 w-4" />
                Mobile Number
              </label>
              <input
                type="tel"
                value={isEditing ? draftProfile.mobileNumber : profile.mobileNumber}
                onChange={(event) => handleProfileChange('mobileNumber', event.target.value)}
                disabled={!isEditing}
                className={`w-full rounded-lg border px-4 py-3 text-base font-semibold outline-none transition-all ${
                  isEditing
                    ? 'border-[#E5E7EB] bg-white text-slate-900 focus:border-[#B74140] focus:ring-2 focus:ring-[#B7414020]'
                    : 'border-transparent bg-transparent px-0 py-0 text-slate-900'
                }`}
                placeholder="Enter mobile number"
              />
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
