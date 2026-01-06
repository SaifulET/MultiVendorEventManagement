'use client';

import React, { useState, useEffect } from 'react';
import profileDataJson from '@/app/serviceprovider/dashboard/profileSettings/profileData.json';

interface ProfileData {
  fullName: string;
  email: string;
  phone: string;
  profileImage: string;
}

export default function ProfileSettings() {
  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: '',
    email: '',
    phone: '',
    profileImage: ''
  });

  // Load data from JSON on component mount
  useEffect(() => {
    setProfileData(profileDataJson.profile);
  }, []);

  return (
    <div className="min-h-screen bg-white p-[18px] sm:p-[24px] lg:p-[32px] lg:px-[104px]">
      <div className="">
        {/* Profile Information Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-[18px] sm:p-[24px]">
          <h2 className="font-inter font-semibold text-[18px] leading-[100%] tracking-[0] text-slate-900 mb-6">
            Profile Information
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-[24px] sm:gap-[18px]">
            {/* Profile Image */}
            <div className="flex-shrink-0 mt-[24px]">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-indigo-500 ring-4 ring-blue-100">
                <img
                  src={profileData.profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Profile Form */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileData.fullName}
                  onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 transition-all duration-200 text-slate-900"
                  readOnly
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 transition-all duration-200 text-slate-900"
                  readOnly
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 transition-all duration-200 text-slate-900"
                  readOnly
                />
              </div>

              {/* Empty div to maintain grid layout */}
              <div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}