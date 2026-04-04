'use client';

import React, { useState, type ChangeEvent } from 'react';
import { Camera, Check, Lock, Mail, Phone, Trash2, User, X } from 'lucide-react';

import cover from '@/public/bg.svg';
import profileimg from '@/public/profile.jpg';

interface Profile {
  fullName: string;
  email: string;
  phone: string;
}

interface Passwords {
  current: string;
  new: string;
  confirm: string;
}

const ProfilePage: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [coverPhoto, setCoverPhoto] = useState(cover.src);
  const [profilePhoto, setProfilePhoto] = useState(profileimg.src);
  const [profile, setProfile] = useState<Profile>({
    fullName: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 123-4567',
  });
  const [passwords, setPasswords] = useState<Passwords>({
    current: '',
    new: '',
    confirm: '',
  });

  const handleProfileChange = (field: keyof Profile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = () => {
    setIsEditing(false);
  };

  const handlePasswordChange = () => {
    if (passwords.current && passwords.new && passwords.new === passwords.confirm) {
      setShowChangePassword(false);
      setPasswords({ current: '', new: '', confirm: '' });
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      console.log('Account deleted');
    }
  };

  const updateImage = (
    event: ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setter(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen font-sans">
      <div className="h-[404px] overflow-hidden">
        <div className="flex justify-end pb-[28px]">
          {isEditing ? (
            <div className="flex gap-[28px]">
              <button
                onClick={() => setIsEditing(false)}
                className="rounded-lg border border-[#E5E7EB] bg-white px-[24px] py-[16px] font-medium text-slate-700 transition-all hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveChanges}
                className="flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-[#B74140] px-[24px] py-[16px] font-medium text-white transition-all hover:bg-[#812321]"
              >
                <Check className="h-4 w-4" />
                Save Changes
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="rounded-lg bg-[#B74140] px-[24px] py-[16px] font-medium text-white shadow-lg transition-all hover:bg-[#812321]"
            >
              Edit profile
            </button>
          )}
        </div>

        <div className="relative overflow-hidden rounded-lg">
          <img src={coverPhoto} alt="Cover" className="h-[332px] w-full rounded-lg object-cover" />

          {isEditing ? (
            <label className="absolute right-4 top-4 z-20 cursor-pointer rounded-full border border-[#E5E7EB] bg-white/80 p-3 backdrop-blur-sm transition-all hover:bg-white">
              <input
                type="file"
                accept="image/*"
                onChange={(event) => updateImage(event, setCoverPhoto)}
                className="hidden"
              />
              <Camera className="h-5 w-5 text-[#B74140]" />
            </label>
          ) : null}
        </div>
      </div>

      <div className="relative">
        <div className="px-8">
          <div className="relative -top-16 mb-8">
            <div className="relative">
              <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-[#E5E7EB] bg-gradient-to-br from-amber-400 to-orange-500">
                <img src={profilePhoto} alt="Profile" className="h-full w-full rounded-full object-cover" />
              </div>

              {isEditing ? (
                <label className="absolute inset-0 left-10 top-[-45] flex h-32 w-32 cursor-pointer items-center justify-center rounded-full transition-all duration-300">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => updateImage(event, setProfilePhoto)}
                    className="hidden"
                  />
                  <div className="flex h-12 w-12 items-center justify-center rounded-full hover:bg-white">
                    <Camera className="h-6 w-6 text-[#B74140]" />
                  </div>
                </label>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="-mt-8 px-8 pb-12">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-slate-900">Smiths Home Services</h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {'★★★★★'.split('').map((star, index) => (
                <span key={`${star}-${index}`} className="text-lg text-yellow-400">★</span>
              ))}
            </div>
            <span className="font-medium text-slate-600">4.9 (127 reviews)</span>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-[#E5E7EB] bg-white p-8">
          <h2 className="mb-6 text-xl font-bold text-slate-900">Profile Information</h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={(event) => handleProfileChange('fullName', event.target.value)}
                  disabled={!isEditing}
                  className={`w-full rounded-lg border py-3 pl-11 pr-4 outline-none transition-all ${
                    isEditing
                      ? 'border-[#E5E7EB] bg-white focus:border-red-500 focus:ring-2 focus:ring-red-200'
                      : 'border-[#E5E7EB] bg-slate-50 text-slate-600'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={profile.email}
                  onChange={(event) => handleProfileChange('email', event.target.value)}
                  disabled={!isEditing}
                  className={`w-full rounded-lg border py-3 pl-11 pr-4 outline-none transition-all ${
                    isEditing
                      ? 'border-[#E5E7EB] bg-white focus:border-red-500 focus:ring-2 focus:ring-red-200'
                      : 'border-[#E5E7EB] bg-slate-50 text-slate-600'
                  }`}
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(event) => handleProfileChange('phone', event.target.value)}
                  disabled={!isEditing}
                  className={`w-full rounded-lg border py-3 pl-11 pr-4 outline-none transition-all ${
                    isEditing
                      ? 'border-[#E5E7EB] bg-white focus:border-red-500 focus:ring-2 focus:ring-red-200'
                      : 'border-[#E5E7EB] bg-slate-50 text-slate-600'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {isEditing ? (
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-8">
            <h2 className="mb-6 text-xl font-bold text-slate-900">Account Actions</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-slate-50 p-5">
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
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-1 font-semibold text-red-900">Delete Account</h3>
                    <p className="mb-4 text-sm text-red-700">
                      Permanently delete your account and all data
                    </p>
                    <button
                      onClick={handleDeleteAccount}
                      className="rounded-lg px-5 py-2 font-semibold text-red-600 transition-all duration-200 hover:bg-red-100 hover:text-red-700"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {showChangePassword ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl bg-white p-8 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-slate-900">Change Password</h3>
              <button
                onClick={() => setShowChangePassword(false)}
                className="rounded-full p-2 text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Current Password</label>
                <input
                  type="password"
                  value={passwords.current}
                  onChange={(event) =>
                    setPasswords((prev) => ({ ...prev, current: event.target.value }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition-all focus:border-red-500 focus:ring-2 focus:ring-red-200"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">New Password</label>
                <input
                  type="password"
                  value={passwords.new}
                  onChange={(event) =>
                    setPasswords((prev) => ({ ...prev, new: event.target.value }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition-all focus:border-red-500 focus:ring-2 focus:ring-red-200"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Confirm New Password</label>
                <input
                  type="password"
                  value={passwords.confirm}
                  onChange={(event) =>
                    setPasswords((prev) => ({ ...prev, confirm: event.target.value }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition-all focus:border-red-500 focus:ring-2 focus:ring-red-200"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowChangePassword(false)}
                  className="rounded-lg border border-slate-300 px-6 py-3 font-medium text-slate-700 transition-all hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordChange}
                  className="rounded-lg bg-[#B74140] px-6 py-3 font-medium text-white transition-all hover:bg-[#812321]"
                >
                  Update Password
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ProfilePage;
