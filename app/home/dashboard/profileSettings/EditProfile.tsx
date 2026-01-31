'use client';

import React, { useState, useRef } from 'react';
import { Camera, Trash2, Lock, AlertTriangle, ChevronDown, X } from 'lucide-react';
import ChangePassword from './editProfile/changePassword/page';

interface PaymentCard {
  id: string;
  last4: string;
  expiresMonth: string;
  expiresYear: string;
  isDefault: boolean;
  cardColor: string;
}

interface EditProfileProps {
  onSave?: (data: {
    fullName: string;
    email: string;
    currency: string;
    location: string;
  }) => void;
  onCancel?: () => void;
  initialData?: {
    fullName: string;
    email: string;
    currency: string;
    location: string;
  };
}

export default function EditProfile({ onSave, onCancel, initialData }: EditProfileProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileImage, setProfileImage] = useState('https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop');
  
  const [formData, setFormData] = useState({
    fullName: initialData?.fullName || 'Michael Anderson',
    email: initialData?.email || 'sarah.johnson@email.com',
    currency: initialData?.currency || 'USD ($)',
    location: initialData?.location || 'San Francisco, CA'
  });

  const [paymentCards, setPaymentCards] = useState<PaymentCard[]>([
    {
      id: '1',
      last4: '4242',
      expiresMonth: '12',
      expiresYear: '25',
      isDefault: true,
      cardColor: 'from-blue-500 to-indigo-600'
    },
    {
      id: '2',
      last4: '8888',
      expiresMonth: '08',
      expiresYear: '26',
      isDefault: false,
      cardColor: 'from-orange-500 to-red-500'
    }
  ]);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setProfileImage('');
  };

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

  const handleSaveChanges = () => {
    if (onSave) {
      onSave(formData);
    }
    console.log('Saving changes:', formData);
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    console.log('Cancelled');
  };

  return (
    <div className="min-h-screen bg-white ">
      {/* Header with action buttons */}
      <div className="sticky top-0 z-10 bg-white ">
        <div className=" px-4 sm:px-6 lg:px-8 py-4 flex justify-end gap-3">
          <button
            onClick={handleCancel}
            className="px-6 py-2.5 rounded-lg text-slate-700 hover:bg-gray-100 font-semibold transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveChanges}
            className="px-6 py-2.5 bg-[#B74140] hover:bg-[#772322] text-white rounded-lg font-semibold  transition-all duration-300 "
          >
            Save Changes
          </button>
        </div>
      </div>

      <div className=" space-y-6">
        {/* Profile Photo Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-[18px] sm:p-[24px] ">
          <h2 className="font-inter font-semibold text-[18px] leading-[100%] tracking-[0] text-slate-900 mb-6">Profile Photo</h2>
          
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              {profileImage ? (
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-gradient-to-br from-blue-400 to-indigo-500 ring-2 ring-gray-200">
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-lg bg-gray-50 flex items-center justify-center">
                  <Camera className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>

            {/* Photo Actions */}
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
                className="flex items-center gap-2 px-5 py-2.5 bg-[#B74140] text-white rounded-lg font-semibold hover:bg-[#7a2b2a] transition-all duration-300 "
              >
                <Camera className="w-4 h-4" />
                Change Photo
              </button>
              
              <button
                onClick={handleRemovePhoto}
                className="flex items-center gap-2 px-5 py-2.5 text-[#B74140] hover:bg-gray-200 rounded-lg font-semibold transition-all duration-200"
              >
                <Trash2 className="w-4 h-4" />
                Remove Photo
              </button>
              
              <p className="text-sm text-slate-500 mt-2">JPG or PNG. Max size 5MB</p>
            </div>
          </div>
        </div>

        {/* Profile Information & Account Settings */}
        <div className="bg-white rounded-2xl  border border-gray-200 p-[18px] sm:p-[24px] ">
          <h2 className="font-inter font-semibold text-[18px] leading-[100%] tracking-[0] text-slate-900 mb-6">Profile Information & Account Settings</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 transition-all duration-200 text-slate-900"
                placeholder="Enter full name"
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300  transition-all duration-200 text-slate-900"
                placeholder="Enter email address"
              />
            </div>

            {/* Currency */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Currency
              </label>
              <div className="relative">
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 transition-all duration-200 text-slate-900 appearance-none bg-white"
                >
                  <option value="USD ($)">USD ($)</option>
                  <option value="EUR (€)">EUR (€)</option>
                  <option value="GBP (£)">GBP (£)</option>
                  <option value="JPY (¥)">JPY (¥)</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300  transition-all duration-200 text-slate-900"
                placeholder="Enter location"
              />
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-[18px] sm:p-[24px] ">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-inter font-semibold text-[18px] leading-[100%] tracking-[0] text-slate-900">Payment Methods</h2>
            <button className="px-5 py-2.5 bg-[#B74140] text-white rounded-lg font-semibold hover:bg-[#812b2a] transition-all duration-300 shadow-md hover:shadow-lg text-sm">
              Add Card
            </button>
          </div>
          
          <div className="space-y-4">
            {paymentCards.map((card) => (
              <div
                key={card.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-200"
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
                      className="px-4 py-1.5 text-[#B74140] hover:text-[#5e1918] text-sm font-semibold hover:bg-red-50 rounded-md transition-colors duration-200"
                    >
                      Set Default
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleRemoveCard(card.id)}
                    disabled={card.isDefault && paymentCards.length === 1}
                    className="px-4 py-1.5 text-[#B74140] hover:text-[#B74140] text-sm font-semibold hover:bg-red-50 rounded-md transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Account Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-[18px] sm:p-[24px]">
          <h2 className="font-inter font-semibold text-[18px] leading-[100%] tracking-[0] text-slate-900 mb-6">Account Actions</h2>
          
          <div className="space-y-4">
            {/* Password Change */}
            <div className="flex items-center justify-between p-5 rounded-xl bg-gray-50 border border-gray-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-[#B74140]" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Password</h3>
                  <p className="text-sm text-slate-500 mt-0.5">••••••••••</p>
                </div>
              </div>
              <button 
                onClick={() => setShowChangePassword(true)}
                className="px-5 py-2 text-[#B74140] hover:text-[#681d1c] font-semibold hover:bg-red-50 rounded-lg transition-all duration-200"
              >
                Change Password
              </button>
            </div>

            {/* Delete Account */}
            <div className="p-5 rounded-xl bg-red-50 border-2 border-red-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900 mb-1">Delete Account</h3>
                  <p className="text-sm text-red-700 mb-4">
                    Permanently delete your account and all data
                  </p>
                  {!showDeleteConfirm ? (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-5 py-2 text-red-600 hover:text-red-700 font-semibold hover:bg-red-100 rounded-lg transition-all duration-200"
                    >
                      Delete Account
                    </button>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          // Handle delete
                          console.log('Account deleted');
                          setShowDeleteConfirm(false);
                        }}
                        className="px-5 py-2 bg-[#B74140] text-white font-semibold rounded-lg hover:bg-[#6d1e1d] transition-all duration-200"
                      >
                        Confirm Delete
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-5 py-2 bg-white text-slate-700 font-semibold rounded-lg hover:bg-gray-100 border border-gray-300 transition-all duration-200"
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

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl my-8">
            <button
              onClick={() => setShowChangePassword(false)}
              className="absolute -top-4 -right-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-gray-100 transition-all duration-200 z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <ChangePassword 
              onClose={() => setShowChangePassword(false)}
              onUpdate={(passwords) => {
                console.log('Password update:', passwords);
                setShowChangePassword(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}