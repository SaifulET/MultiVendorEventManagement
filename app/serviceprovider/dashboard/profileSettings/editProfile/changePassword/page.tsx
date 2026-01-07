'use client';
import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface ChangePasswordProps {
  onClose?: () => void;
  onUpdate?: (passwords: { current: string; new: string; confirm: string }) => void;
}

export default function ChangePassword({ onClose, onUpdate }: ChangePasswordProps) {
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [errors, setErrors] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validatePasswords = () => {
    const newErrors = {
      current: '',
      new: '',
      confirm: ''
    };

    if (!passwords.current) {
      newErrors.current = 'Current password is required';
    }

    if (!passwords.new) {
      newErrors.new = 'New password is required';
    } else if (passwords.new.length < 8) {
      newErrors.new = 'Password must be at least 8 characters';
    }

    if (!passwords.confirm) {
      newErrors.confirm = 'Please confirm your password';
    } else if (passwords.new !== passwords.confirm) {
      newErrors.confirm = 'Passwords do not match';
    }

    setErrors(newErrors);
    return !newErrors.current && !newErrors.new && !newErrors.confirm;
  };

  const handleUpdatePassword = () => {
    if (validatePasswords()) {
      if (onUpdate) {
        onUpdate(passwords);
      }
      // Reset form
      setPasswords({ current: '', new: '', confirm: '' });
      console.log('Password updated successfully');
    }
  };

  const handleCancel = () => {
    setPasswords({ current: '', new: '', confirm: '' });
    setErrors({ current: '', new: '', confirm: '' });
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 ">
      <div className="">
        {/* Header */}
        <div className="bg-white rounded-t-2xl border border-gray-200 border-b-0 p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Change Password</h1>
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="px-6 py-2.5 rounded-lg text-slate-700 hover:bg-gray-100 font-semibold transition-all duration-200 border border-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdatePassword}
                className="px-6 py-2.5 bg-[#B74140] text-white rounded-lg font-semibold hover:bg-[#882826] transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-b-2xl shadow-sm border border-gray-200 p-6 sm:p-8 space-y-6">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showPassword.current ? 'text' : 'password'}
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                placeholder="Enter current password"
                className={`w-full px-4 py-3 pr-12 rounded-lg border ${
                  errors.current ? 'border-red-500' : 'border-gray-300'
                }  transition-all duration-200 text-slate-900 placeholder:text-gray-400`}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                {showPassword.current ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.current && (
              <p className="mt-1.5 text-sm text-red-600">{errors.current}</p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword.new ? 'text' : 'password'}
                value={passwords.new}
                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                placeholder="Enter new password"
                className={`w-full px-4 py-3 pr-12 rounded-lg border ${
                  errors.new ? 'border-red-500' : 'border-gray-300'
                }  transition-all duration-200 text-slate-900 placeholder:text-gray-400`}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                {showPassword.new ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.new && (
              <p className="mt-1.5 text-sm text-red-600">{errors.new}</p>
            )}
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showPassword.confirm ? 'text' : 'password'}
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                placeholder="Re-enter new password"
                className={`w-full px-4 py-3 pr-12 rounded-lg border ${
                  errors.confirm ? 'border-red-500' : 'border-gray-300'
                } transition-all duration-200 text-slate-900 placeholder:text-gray-400`}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                {showPassword.confirm ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.confirm && (
              <p className="mt-1.5 text-sm text-red-600">{errors.confirm}</p>
            )}
          </div>

          {/* Password Requirements */}
          <div className="pt-2">
            <p className="text-sm font-semibold text-slate-700 mb-2">Password requirements:</p>
            <ul className="space-y-1 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  passwords.new.length >= 8 ? 'bg-green-500' : 'bg-gray-300'
                }`}></span>
                At least 8 characters
              </li>
              <li className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  /[A-Z]/.test(passwords.new) ? 'bg-green-500' : 'bg-gray-300'
                }`}></span>
                At least one uppercase letter
              </li>
              <li className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  /[a-z]/.test(passwords.new) ? 'bg-green-500' : 'bg-gray-300'
                }`}></span>
                At least one lowercase letter
              </li>
              <li className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  /[0-9]/.test(passwords.new) ? 'bg-green-500' : 'bg-gray-300'
                }`}></span>
                At least one number
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}