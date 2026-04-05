'use client';

import React, { useRef, useState } from 'react';
import { AlertTriangle, Camera, Lock, Trash2, X } from 'lucide-react';

import ChangePassword from './editProfile/changePassword/page';

interface EditProfileProps {
  onSave?: (data: {
    fullName: string;
    email: string;
    phone: string;
    profileImage: string;
  }) => void;
  onCancel?: () => void;
  initialData?: {
    fullName: string;
    email: string;
    phone: string;
    profileImage: string;
  };
}

export default function EditProfile({ onSave, onCancel, initialData }: EditProfileProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileImage, setProfileImage] = useState(
    initialData?.profileImage ||
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop'
  );
  const [formData, setFormData] = useState({
    fullName: initialData?.fullName || 'Michael Anderson',
    email: initialData?.email || 'sarah.johnson@email.com',
    phone: initialData?.phone || '',
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-10 bg-white">
        <div className="flex justify-end gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <button
            onClick={onCancel}
            className="rounded-lg px-6 py-2.5 font-semibold text-slate-700 transition-all duration-200 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave?.({ ...formData, profileImage })}
            className="rounded-lg border border-[#E5E7EB] bg-[#B74140] px-6 py-2.5 font-semibold text-white transition-all duration-300 hover:bg-[#772322]"
          >
            Save Changes
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-[18px] sm:p-[24px]">
          <h2 className="mb-6 font-inter text-[18px] font-semibold leading-[100%] tracking-[0] text-slate-900">
            Profile Photo
          </h2>

          <div className="flex flex-col items-start gap-6 sm:flex-row">
            <div className="flex-shrink-0">
              {profileImage ? (
                <div className="h-24 w-24 overflow-hidden rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 ring-2 ring-gray-200">
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-gray-50">
                  <Camera className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>

            <div className="flex-1 space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleImageChange}
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-[#B74140] px-5 py-2.5 font-semibold text-white transition-all duration-300 hover:bg-[#7a2b2a]"
              >
                <Camera className="h-4 w-4" />
                Change Photo
              </button>

              <button
                onClick={() => setProfileImage('')}
                className="flex items-center gap-2 rounded-lg px-5 py-2.5 font-semibold text-[#B74140] transition-all duration-200 hover:bg-gray-200"
              >
                <Trash2 className="h-4 w-4" />
                Remove Photo
              </button>

              <p className="mt-2 text-sm text-slate-500">JPG or PNG. Max size 5MB</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-[18px] sm:p-[24px]">
          <h2 className="mb-6 font-inter text-[18px] font-semibold leading-[100%] tracking-[0] text-slate-900">
            Profile Information
          </h2>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Full Name
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(event) =>
                  setFormData({ ...formData, fullName: event.target.value })
                }
                className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2.5 text-slate-900 transition-all duration-200"
                placeholder="Enter full name"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(event) =>
                  setFormData({ ...formData, email: event.target.value })
                }
                className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2.5 text-slate-900 transition-all duration-200"
                placeholder="Enter email address"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Mobile Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(event) =>
                  setFormData({ ...formData, phone: event.target.value })
                }
                className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2.5 text-slate-900 transition-all duration-200"
                placeholder="Enter mobile number"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-[18px] sm:p-[24px]">
          <h2 className="mb-6 font-inter text-[18px] font-semibold leading-[100%] tracking-[0] text-slate-900">
            Account Actions
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-gray-50 p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100">
                  <Lock className="h-6 w-6 text-[#B74140]" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Password</h3>
                  <p className="mt-0.5 text-sm text-slate-500">••••••••••</p>
                </div>
              </div>
              <button
                onClick={() => setShowChangePassword(true)}
                className="rounded-lg px-5 py-2 font-semibold text-[#B74140] transition-all duration-200 hover:bg-red-50 hover:text-[#681d1c]"
              >
                Change Password
              </button>
            </div>

            <div className="rounded-xl border-2 border-red-200 bg-red-50 p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-red-100">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-1 font-semibold text-red-900">Delete Account</h3>
                  <p className="mb-4 text-sm text-red-700">
                    Permanently delete your account and all data
                  </p>
                  {!showDeleteConfirm ? (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="rounded-lg px-5 py-2 font-semibold text-red-600 transition-all duration-200 hover:bg-red-100 hover:text-red-700"
                    >
                      Delete Account
                    </button>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          console.log('Account deleted');
                          setShowDeleteConfirm(false);
                        }}
                        className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white transition-all hover:bg-red-700"
                      >
                        Confirm Delete
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="rounded-lg border border-red-200 px-4 py-2 font-semibold text-red-700 transition-all hover:bg-red-100"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showChangePassword ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <button
              onClick={() => setShowChangePassword(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-500 transition-all hover:bg-gray-100 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>
            <ChangePassword onClose={() => setShowChangePassword(false)} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
