"use client";

import React, { useState } from 'react';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function BusinessProfileForm() {
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: '',
    legalBusinessName: '',
    registrationNumber: '',
    businessEmail: '',
    businessPhone: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
const router = useRouter();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
   router.push("/venueprovider/auth/welcomevenueprovider")
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-4 lg:px[408px] lg:py-[22px]">
      <div className="">
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 sm:p-8 lg:p-[32px]">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="font-inter font-semibold text-[24px] leading-[32px] tracking-[0] text-gray-900 mb-2">
              Business Profile Information
            </h1>
            <p className="font-inter font-normal text-[14px] leading-[23px] tracking-[0] text-gray-600">
              This information will appear on your public venue listing and help customers learn about your business.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            {/* Business Name */}
            <div>
              <label htmlFor="businessName" className="block text-sm font-medium text-gray-900 mb-2">
                Business Name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="businessName"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                placeholder="Enter your business name"
                className="w-full px-4 py-2.5 sm:py-3 border border-[#E5E7EB] rounded-md text-sm sm:text-base placeholder-gray-400  transition-all"
                required
              />
            </div>

            {/* Business Type */}
            <div>
              <label htmlFor="businessType" className="block text-sm font-medium text-gray-900 mb-2">
                Business Type<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="businessType"
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 sm:py-3 border border-[#E5E7EB] rounded-md text-sm sm:text-base text-gray-900 appearance-none  transition-all cursor-pointer"
                  required
                >
                  <option value="">Select business type</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="cafe">Cafe</option>
                  <option value="bar">Bar</option>
                  <option value="hotel">Hotel</option>
                  <option value="retail">Retail Store</option>
                  <option value="other">Other</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#9CA3AF] pointer-events-none" />
              </div>
            </div>

            {/* Legal Business Name */}
            <div>
              <label htmlFor="legalBusinessName" className="block text-sm font-medium text-gray-900 mb-2">
                Legal Business Name
                <span className="text-gray-500 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                id="legalBusinessName"
                name="legalBusinessName"
                value={formData.legalBusinessName}
                onChange={handleInputChange}
                placeholder="Enter legal business name"
                className="w-full px-4 py-2.5 sm:py-3 border border-[#E5E7EB] rounded-md text-sm sm:text-base placeholder-gray-400  transition-all"
              />
            </div>

            {/* Business Registration Number */}
            <div>
              <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-900 mb-2">
                Business Registration Number
                <span className="text-gray-500 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                id="registrationNumber"
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleInputChange}
                placeholder="Enter registration number"
                className="w-full px-4 py-2.5 sm:py-3 border border-[#E5E7EB] rounded-md text-sm sm:text-base placeholder-gray-400  transition-all"
              />
            </div>

            {/* Business Email */}
            <div>
              <label htmlFor="businessEmail" className="block text-sm font-medium text-gray-900 mb-2">
                Business Email<span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="businessEmail"
                name="businessEmail"
                value={formData.businessEmail}
                onChange={handleInputChange}
                placeholder="Enter business email"
                className="w-full px-4 py-2.5 sm:py-3 border border-[#E5E7EB] rounded-md text-sm sm:text-base placeholder-gray-400  transition-all"
                required
              />
            </div>

            {/* Business Phone Number */}
            <div>
              <label htmlFor="businessPhone" className="block text-sm font-medium text-gray-900 mb-2">
                Business Phone Number<span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="businessPhone"
                name="businessPhone"
                value={formData.businessPhone}
                onChange={handleInputChange}
                placeholder="Enter business phone number"
                className="w-full px-4 py-2.5 sm:py-3 border border-[#E5E7EB] rounded-md text-sm sm:text-base placeholder-gray-400  transition-all"
                required
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4 sm:pt-6">
              <button
                type="submit"
                className="w-full sm:w-auto sm:ml-auto sm:flex bg-[#B74140] hover:bg-[#7a2322] text-white font-medium py-3 px-6 rounded-md transition-colors duration-200 flex items-center justify-center gap-2 text-sm sm:text-base "
              >
                Save & Continue
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}