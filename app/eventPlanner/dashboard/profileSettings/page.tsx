'use client'
import React, { useState, ChangeEvent } from 'react';
import { X, CreditCard, Trash2, Lock, Plus, Check, MapPin, DollarSign, Phone, Mail, User, Calendar } from 'lucide-react';
import cover from "@/public/bg.svg"
import profileimg from "@/public/profile.jpg"
interface Profile {
  fullName: string;
  email: string;
  phone: string;
  currency: string;
  location: string;
}

interface Passwords {
  current: string;
  new: string;
  confirm: string;
}

interface PaymentCard {
  id: number;
  last4: string;
  type: 'visa' | 'mastercard';
  expires: string;
  isDefault: boolean;
}

interface NewCard {
  number: string;
  name: string;
  expiry: string;
  cvv: string;
}

const ProfilePage: React.FC = () => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showChangePassword, setShowChangePassword] = useState<boolean>(false);
  const [showAddCard, setShowAddCard] = useState<boolean>(false);
  
  // Photo states
  const [coverPhoto, setCoverPhoto] = useState<string>(cover.src);
  const [profilePhoto, setProfilePhoto] = useState<string>(profileimg.src);
  
  // Profile state
  const [profile, setProfile] = useState<Profile>({
    fullName: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 123-4567',
    currency: 'USD ($)',
    location: 'San Francisco, CA'
  });

  // Password state
  const [passwords, setPasswords] = useState<Passwords>({
    current: '',
    new: '',
    confirm: ''
  });

  // Payment cards state
  const [cards, setCards] = useState<PaymentCard[]>([
    { id: 1, last4: '4242', type: 'visa', expires: '04/26', isDefault: false },
    { id: 2, last4: '8888', type: 'mastercard', expires: '08/26', isDefault: true }
  ]);

  // New card state
  const [newCard, setNewCard] = useState<NewCard>({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });

  const handleProfileChange = (field: keyof Profile, value: string): void => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = (): void => {
    setIsEditing(false);
    // Add save logic here
  };

  const handlePasswordChange = (): void => {
    if (passwords.new === passwords.confirm && passwords.current) {
      console.log('Password updated');
      setShowChangePassword(false);
      setPasswords({ current: '', new: '', confirm: '' });
    }
  };

  const handleAddCard = (): void => {
    if (newCard.number && newCard.name && newCard.expiry && newCard.cvv) {
      const cardType: 'visa' | 'mastercard' = newCard.number.startsWith('4') ? 'visa' : 'mastercard';
      const last4 = newCard.number.slice(-4);
      
      setCards(prev => [...prev, {
        id: Date.now(),
        last4,
        type: cardType,
        expires: newCard.expiry,
        isDefault: cards.length === 0
      }]);
      
      setNewCard({ number: '', name: '', expiry: '', cvv: '' });
      setShowAddCard(false);
    }
  };

  const handleDeleteCard = (id: number): void => {
    setCards(prev => prev.filter(card => card.id !== id));
  };

  const handleSetDefault = (id: number): void => {
    setCards(prev => prev.map(card => ({
      ...card,
      isDefault: card.id === id
    })));
  };

  const handleDeleteAccount = (): void => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      console.log('Account deleted');
    }
  };

  const handleCoverPhotoChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfilePhotoChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen  font-sans">
      {/* Header Banner */}
      <div className="h-[404px] overflow-hidden">
  <div className="flex justify-end z-30 pb-[28px]">
    {isEditing ? (
      <div className="flex gap-[28px]">
        <button
          onClick={() => setIsEditing(false)}
          className="px-[24px] py-[16px] bg-white text-slate-700 rounded-lg font-medium hover:bg-slate-100 transition-all border border-[#E5E7EB]"
        >
          Cancel
        </button>
        <button
          onClick={handleSaveChanges}
          className="px-[24px] py-[16px] bg-[#B74140] text-white rounded-lg font-medium hover:bg-[#812321] transition-all border border-[#E5E7EB] flex items-center gap-2"
        >
          <Check className="w-4 h-4" />
          Save Changes
        </button>
      </div>
    ) : (
      <button
        onClick={() => setIsEditing(true)}
        className="px-[24px] py-[16px] bg-[#B74140] text-white rounded-lg font-medium hover:bg-[#B74140] transition-all shadow-lg"
      >
        Edit profile
      </button>
    )}
  </div>

  {/* Cover Photo */}
  <div className="relative rounded-lg overflow-hidden">
    <img 
      src={coverPhoto}
      alt="Cover" 
      className="w-full h-[332px] object-cover rounded-lg"
    />
    
    {/* Camera Icon Overlay - Shows when editing */}
    {isEditing && (
      <label className="absolute top-4 right-4 cursor-pointer bg-white/80 backdrop-blur-sm p-3 rounded-full border border-[#E5E7EB] hover:bg-white transition-all duration-300 z-20">
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleCoverPhotoChange}
          className="hidden" 
        />
        <Camera className="w-5 h-5 text-[#B74140]" />
      </label>
    )}
  </div>
</div>

      {/* Profile Photo Container - Fixed Position */}
     <div className="relative">
  <div className="px-8">
    <div className="relative -top-16 mb-8">
      <div className="relative group/avatar">
        <div className="w-32 h-32 rounded-full border-4 bg-gradient-to-br from-amber-400 to-orange-500  border-[#E5E7EB] overflow-hidden">
          <img 
            src={profilePhoto}
            alt="Profile" 
            className="w-full h-full object-cover rounded-full"
          />
        </div>
        
        {/* Profile Photo Edit Button - ALWAYS VISIBLE when editing */}
        {isEditing && (
          <label className="absolute left-10 top-[-45] w-32 h-32 inset-0 cursor-pointer rounded-full  transition-all duration-300 flex items-center justify-center z-10">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleProfilePhotoChange}
              className="hidden" 
            />
            <div className="transition-all duration-300">
              <div className="w-12 h-12  hover:bg-white rounded-full flex items-center justify-center ">
                <Camera className="w-6 h-6 text-[#B74140]" />
              </div>
            </div>
          </label>
        )}
      </div>
    </div>
  </div>
</div>

      {/* Main Content */}
      <div className=" px-8 -mt-8 pb-12">
        {/* Business Name & Rating */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Smiths Home Services</h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {'★★★★★'.split('').map((star, i) => (
                <span key={i} className="text-yellow-400 text-lg">★</span>
              ))}
            </div>
            <span className="text-slate-600 font-medium">4.9 (127 reviews)</span>
          </div>
        </div>

        {/* Profile Information */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8 mb-6 ">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Profile Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={(e) => handleProfileChange('fullName', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full pl-11 pr-4 py-3 rounded-lg border ${
                    isEditing 
                      ? ' border-[#E5E7EB] bg-white focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                      : ' border-[#E5E7EB] bg-slate-50 text-slate-600'
                  } transition-all outline-none`}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleProfileChange('email', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full pl-11 pr-4 py-3 rounded-lg border ${
                    isEditing 
                      ? 'border-slate-300 bg-white focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                      : 'border-slate-200 bg-slate-50 text-slate-600'
                  } transition-all outline-none`}
                />
              </div>
            </div>

            {/* Phone */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => handleProfileChange('phone', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full pl-11 pr-4 py-3 rounded-lg border ${
                    isEditing 
                      ? 'border-slate-300 bg-white focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                      : 'border-slate-200 bg-slate-50 text-slate-600'
                  } transition-all outline-none`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="bg-white rounded-2xl  p-8 mb-6 border border-[#E5E7EB]">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Account Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Currency */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Currency</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <select
                  value={profile.currency}
                  onChange={(e) => handleProfileChange('currency', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full pl-11 pr-4 py-3 rounded-lg border ${
                    isEditing 
                      ? 'border-slate-300 bg-white focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                      : 'border-slate-200 bg-slate-50 text-slate-600'
                  } transition-all outline-none appearance-none cursor-pointer`}
                >
                  <option>USD ($)</option>
                  <option>EUR (€)</option>
                  <option>GBP (£)</option>
                  <option>JPY (¥)</option>
                </select>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => handleProfileChange('location', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full pl-11 pr-4 py-3 rounded-lg border ${
                    isEditing 
                      ? 'border-slate-300 bg-white focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                      : 'border-slate-200 bg-slate-50 text-slate-600'
                  } transition-all outline-none`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        {isEditing && (
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8 mb-6 ">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Payment Methods</h2>
              <button
                onClick={() => setShowAddCard(true)}
                className="px-4 py-2 bg-[#B74140] text-white rounded-lg font-medium hover:bg-[#701d1c] transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Card
              </button>
            </div>

            <div className="space-y-3">
              {cards.map(card => (
                <div key={card.id} className="flex items-center justify-between p-4 border border-[#E5E7EB] rounded-lg hover:border-slate-300 transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-8 rounded ${card.type === 'visa' ? 'bg-blue-600' : 'bg-orange-500'} flex items-center justify-center`}>
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">•••• •••• •••• {card.last4}</div>
                      <div className="text-sm text-slate-500">Expires {card.expires}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {card.isDefault ? (
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded">Default</span>
                    ) : (
                      <button
                        onClick={() => handleSetDefault(card.id)}
                        className="px-3 py-1 text-slate-600 text-sm font-medium hover:bg-slate-100 rounded transition-all"
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteCard(card.id)}
                      className="px-3 py-1 text-[#B74140] text-sm font-medium hover:bg-red-50 rounded transition-all"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Account Actions */}
        {isEditing && (
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Account Actions</h2>
            
            <div className="space-y-4">
              {/* Change Password */}
              <div className="flex items-center justify-between p-4 border border-[#E5E7EB] rounded-lg hover:border-slate-300 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <Lock className="w-5 h-5 text-[#B74140]" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Password</div>
                    <div className="text-sm text-slate-500">••••••••••</div>
                  </div>
                </div>
                <button
                  onClick={() => setShowChangePassword(true)}
                  className="px-4 py-2 text-[#B74140] font-medium hover:bg-red-50 rounded-lg transition-all"
                >
                  Change Password
                </button>
              </div>

              {/* Delete Account */}
              <div className="p-4 border-2 border-red-200 rounded-lg bg-red-50">
                <div className="flex items-start gap-3">
                  <Trash2 className="w-5 h-5 text-[#B74140] mt-0.5" />
                  <div className="flex-1">
                    <div className="font-semibold text-red-900 mb-1">Delete Account</div>
                    <div className="text-sm text-red-700 mb-3">Permanently delete your account and all data</div>
                    <button
                      onClick={handleDeleteAccount}
                      className="px-4 py-2 bg-[#B74140] text-white font-medium hover:bg-red-700 rounded-lg transition-all"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-md my-8">
            <button
              onClick={() => setShowChangePassword(false)}
              className="absolute -top-4 -right-4 w-10 h-10 bg-white rounded-full border border-[#E5E7EB] flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-gray-100 transition-all duration-200 z-10"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <Lock className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Change Password</h3>
                  <p className="text-sm text-slate-500">Update your account password</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Current Password</label>
                  <input
                    type="password"
                    value={passwords.current}
                    onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border border-[#E5E7EB] focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all outline-none"
                    placeholder="Enter current password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">New Password</label>
                  <input
                    type="password"
                    value={passwords.new}
                    onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border border-[#E5E7EB] focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all outline-none"
                    placeholder="Enter new password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border border-[#E5E7EB] focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all outline-none"
                    placeholder="Confirm new password"
                  />
                </div>

                {passwords.new && passwords.confirm && passwords.new !== passwords.confirm && (
                  <p className="text-sm text-red-600">Passwords do not match</p>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowChangePassword(false)}
                  className="flex-1 px-4 py-3 border border-[#E5E7EB] text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordChange}
                  disabled={!passwords.current || !passwords.new || passwords.new !== passwords.confirm}
                  className="flex-1 px-4 py-3 bg-[#B74140] text-white rounded-lg font-medium hover:bg-[#6e1615] disabled:bg-slate-300 disabled:cursor-not-allowed transition-all"
                >
                  Update Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Card Modal */}
      {showAddCard && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-md my-8">
            <button
              onClick={() => setShowAddCard(false)}
              className="absolute -top-4 -right-4 w-10 h-10 bg-white rounded-full border border-[#E5E7EB] flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-gray-100 transition-all duration-200 z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Add Payment Card</h3>
                  <p className="text-sm text-slate-500">Enter your card details</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Card Number</label>
                  <input
                    type="text"
                    value={newCard.number}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 16);
                      setNewCard(prev => ({ ...prev, number: value }));
                    }}
                    className="w-full px-4 py-3 rounded-lg border border-[#E5E7EB] focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Cardholder Name</label>
                  <input
                    type="text"
                    value={newCard.name}
                    onChange={(e) => setNewCard(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border border-[#E5E7EB] focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                    placeholder="JOHN DOE"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Expiry Date</label>
                    <input
                      type="text"
                      value={newCard.expiry}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '');
                        if (value.length >= 2) {
                          value = value.slice(0, 2) + '/' + value.slice(2, 4);
                        }
                        setNewCard(prev => ({ ...prev, expiry: value }));
                      }}
                      className="w-full px-4 py-3 rounded-lg border border-[#E5E7EB] focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                      placeholder="MM/YY"
                      maxLength={5}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">CVV</label>
                    <input
                      type="text"
                      value={newCard.cvv}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 3);
                        setNewCard(prev => ({ ...prev, cvv: value }));
                      }}
                      className="w-full px-4 py-3 rounded-lg border border-[#E5E7EB] focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                      placeholder="123"
                      maxLength={3}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddCard(false)}
                  className="flex-1 px-4 py-3 border border-[#E5E7EB] text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCard}
                  disabled={!newCard.number || !newCard.name || !newCard.expiry || !newCard.cvv}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all"
                >
                  Add Card
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Missing Camera icon
interface CameraProps {
  className?: string;
}

const Camera: React.FC<CameraProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

export default ProfilePage;