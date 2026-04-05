"use client";

import React, { useEffect, useState } from "react";

import { fetchAuthMeProfile } from "@/lib/auth-me";
import { getApiErrorMessage } from "@/lib/api";
import EditProfile from "./EditProfile";

interface ProfileData {
  fullName: string;
  email: string;
  phone: string;
  profileImage: string;
}

export default function ProfileSettings() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: "",
    email: "",
    phone: "",
    profileImage:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        setError("");

        const data = await fetchAuthMeProfile();

        setProfileData((current) => ({
          ...current,
          fullName: data.fullName,
          email: data.email,
        }));
      } catch (fetchError) {
        setError(getApiErrorMessage(fetchError));
      } finally {
        setIsLoading(false);
      }
    };

    void loadProfile();
  }, []);

  const handleSaveChanges = (updatedData: {
    fullName: string;
    email: string;
    phone: string;
    profileImage: string;
  }) => {
    setProfileData((prev) => ({
      ...prev,
      fullName: updatedData.fullName,
      email: updatedData.email,
      phone: updatedData.phone,
      profileImage: updatedData.profileImage,
    }));

    setIsEditMode(false);
  };

  if (isEditMode) {
    return (
      <EditProfile
        onSave={handleSaveChanges}
        onCancel={() => setIsEditMode(false)}
        initialData={{
          fullName: profileData.fullName,
          email: profileData.email,
          phone: profileData.phone,
          profileImage: profileData.profileImage,
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {error ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">
          <p className="font-semibold text-red-700">Could not load your profile.</p>
          <p className="mt-1 text-sm text-red-600">{error}</p>
        </div>
      ) : null}

      <div className="mb-[25px] rounded-2xl border border-[#E5E7EB] bg-white p-[18px] sm:p-[24px]">
        <h2 className="mb-6 font-inter text-[18px] font-semibold leading-[100%] tracking-[0] text-slate-900">
          Profile Information
        </h2>

        <div className="flex flex-col gap-[24px] sm:flex-row sm:gap-[18px]">
          <div className="mt-[24px] flex-shrink-0">
            <div className="h-20 w-20 overflow-hidden rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 ring-4 ring-blue-100 sm:h-24 sm:w-24">
              <img
                src={profileData.profileImage}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Full Name
              </label>
              <input
                type="text"
                value={profileData.fullName}
                onChange={(event) =>
                  setProfileData({ ...profileData, fullName: event.target.value })
                }
                className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2.5 text-slate-900 transition-all duration-200"
                placeholder={isLoading ? "Loading..." : "Full name"}
                readOnly
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Email Address
              </label>
              <input
                type="email"
                value={profileData.email}
                onChange={(event) =>
                  setProfileData({ ...profileData, email: event.target.value })
                }
                className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2.5 text-slate-900 transition-all duration-200"
                placeholder={isLoading ? "Loading..." : "Email address"}
                readOnly
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Mobile Number
              </label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(event) =>
                  setProfileData({ ...profileData, phone: event.target.value })
                }
                className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2.5 text-slate-900 transition-all duration-200"
                placeholder="Not returned by /api/v1/auth/me"
                readOnly
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setIsEditMode(true)}
                disabled={isLoading}
                className="w-full rounded-lg border border-[#E5E7EB] bg-[#B74140] px-8 py-2.5 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 sm:w-auto"
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
