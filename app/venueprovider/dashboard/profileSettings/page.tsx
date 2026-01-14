"use client";

import React, { useState, useEffect } from 'react';
import profileDataJson from './profileData.json';
import EditProfile from './EditProfile';

interface PaymentCard {
  id: string;
  last4: string;
  expiresMonth: string;
  expiresYear: string;
  isDefault: boolean;
  cardColor: string;
}

interface ProfileData {
  fullName: string;
  email: string;
  phone: string;
  profileImage: string;
}

interface AccountSettings {
  currency: string;
  location: string;
}

export default function ProfileSettings() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: '',
    email: '',
    phone: '',
    profileImage: ''
  });

  const [accountSettings, setAccountSettings] = useState<AccountSettings>({
    currency: '',
    location: ''
  });

  const [paymentCards, setPaymentCards] = useState<PaymentCard[]>([]);

  // Load data from JSON on component mount
  useEffect(() => {
    setProfileData(profileDataJson.profile);
    setAccountSettings(profileDataJson.accountSettings);
    setPaymentCards(profileDataJson.paymentCards);
  }, []);

  const handleSetDefault = (cardId: string) => {
    setPaymentCards(cards =>
      cards.map(card => ({
        ...card,
        isDefault: card.id === cardId
      }))
    );
  };

  const handleRemoveCard = (cardId: string) => {
    setPaymentCards(cards => cards.filter(card => card.id !== cardId));
  };

  const handleEditProfile = () => {
    setIsEditMode(true);
  };

  const handleSaveChanges = (updatedData: {
    fullName: string;
    email: string;
    currency: string;
    location: string;
  }) => {
    // Update profile data
    setProfileData(prev => ({
      ...prev,
      fullName: updatedData.fullName,
      email: updatedData.email
    }));

    // Update account settings
    setAccountSettings({
      currency: updatedData.currency,
      location: updatedData.location
    });

    setIsEditMode(false);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
  };

  // Show EditProfile component when in edit mode
  if (isEditMode) {
    return <EditProfile onSave={handleSaveChanges} onCancel={handleCancelEdit} initialData={{
      fullName: profileData.fullName,
      email: profileData.email,
      currency: accountSettings.currency,
      location: accountSettings.location
    }} />;
  }

  return (
    <div className="min-h-screen bg-white ">
      <div className="">
        {/* Profile Information Card */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-[18px] sm:p-[24px] mb-[25px]">
          <h2 className="font-inter font-semibold text-[18px] leading-[100%] tracking-[0] text-slate-900 mb-6">Profile Information</h2>
          
          <div className="flex flex-col sm:flex-row gap-[24px] sm:gap-[18px]">
            {/* Profile Image */}
            <div className="flex-shrink-0 mt-[24px]">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-indigo-500 ring-4 ring-blue-100 ">
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
                  className="w-full px-4 py-2.5 rounded-lg border border-[#E5E7EB]  transition-all duration-200 text-slate-900"
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
                  className="w-full px-4 py-2.5 rounded-lg border border-[#E5E7EB]  transition-all duration-200 text-slate-900"
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
                  className="w-full px-4 py-2.5 rounded-lg border border-[#E5E7EB]  transition-all duration-200 text-slate-900"
                  readOnly
                />
              </div>

              {/* Edit Button */}
              <div className="flex items-end">
                <button
                  onClick={handleEditProfile}
                  className="w-full sm:w-auto px-8 py-2.5 bg-[#B74140] text-white rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300 border border-[#E5E7EB] transform hover:-translate-y-0.5"
                >
                  Edit profile
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Account Settings Card */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-[18px] sm:p-[24px] mb-[32px]">
          <h2 className="font-inter font-semibold text-[18px] leading-[100%] tracking-[0] text-slate-900 mb-6">Account Settings</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Currency */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Currency
              </label>
              <input
                type="text"
                value={accountSettings.currency}
                onChange={(e) => setAccountSettings({ ...accountSettings, currency: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300  transition-all duration-200 text-slate-900"
                readOnly
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={accountSettings.location}
                onChange={(e) => setAccountSettings({ ...accountSettings, location: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-[#E5E7EB]  transition-all duration-200 text-slate-900"
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Payment Methods Card */}
        <div className="bg-white rounded-2xl sborder border-[#E5E7EB] p-[18px] sm:p-[24px]">
          <h2 className="font-inter font-semibold text-[18px] leading-[100%] tracking-[0] text-slate-900 mb-6">Payment Methods</h2>
          
          <div className="space-y-4">
            {paymentCards.map((card) => (
              <div
                key={card.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-xl border border-[#E5E7EB] hover:border-[#E5E7EB] transition-all duration-200"
              >
                {/* Card Info */}
                <div className="flex items-center gap-4">
                  {/* Card Visual */}
                  <div className={`w-14 h-10 rounded-lg bg-gradient-to-br ${card.cardColor} shadow-md flex items-center justify-center`}>
                    <div className="w-8 h-6 rounded bg-white/20 backdrop-blur-sm"></div>
                  </div>
                  
                  {/* Card Details */}
                  <div>
                    <div className="font-semibold text-slate-900">
                      •••• •••• •••• {card.last4}
                    </div>
                    <div className="text-sm text-slate-500 mt-0.5">
                      Expires {card.expiresMonth}/{card.expiresYear}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {card.isDefault ? (
                    <span className="px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-md text-sm font-semibold">
                      Default
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSetDefault(card.id)}
                      className="px-4 py-1.5 text-blue-600 hover:text-blue-700 text-sm font-semibold hover:bg-blue-50 rounded-md transition-colors duration-200"
                    >
                      Set Default
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleRemoveCard(card.id)}
                    disabled={card.isDefault && paymentCards.length === 1}
                    className="px-4 py-1.5 text-red-600 hover:text-red-700 text-sm font-semibold hover:bg-red-50 rounded-md transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

          </div>
        </div>
      </div>
    </div>
  );
}