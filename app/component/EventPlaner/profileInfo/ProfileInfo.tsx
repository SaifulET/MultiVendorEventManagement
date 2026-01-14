"use client";

import React, { useState } from 'react';
import { ChevronDown, ArrowRight, Briefcase, MapPin, Upload, BriefcaseBusinessIcon, Tag, Layers } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function BusinessProfileForm() {
  const [formData, setFormData] = useState({
    serviceName: '',
    serviceCategory: '',
    serviceDescription: '',
    coverageArea: '',
    businessType: '',
    nationalId: null as File | null,
    companyName: '',
    payoutMethod: 'stripe',
    address: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        nationalId: file
      }));
    }
  };
  const router = useRouter()

  // Fix: Prevent default form submission and add validation
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form submission
    
    // Validate required fields
    if (!formData.serviceName || !formData.serviceCategory || 
        !formData.serviceDescription || !formData.coverageArea) {
      alert('Please fill in all required fields');
      return;
    }
    
    // If everything is OK, redirect to signin page
    router.push("/eventPlanner/dashboard/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-3xl">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 lg:p-10">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#B74140] rounded-lg flex items-center justify-center">
                <BriefcaseBusinessIcon className="w-5 h-5 text-white"/>
              </div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Business Profile Information
              </h1>
            </div>
            <p className="text-sm text-gray-600 ml-[52px]">
              Tell us about the services you provide
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Service Name */}
            <div>
              <label htmlFor="serviceName" className="block text-sm font-medium text-gray-900 mb-2">
                Service Name<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"/>
                <input
                  type="text"
                  id="serviceName"
                  name="serviceName"
                  value={formData.serviceName}
                  onChange={handleInputChange}
                  placeholder="e.g., Professional Home Cleaning"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#B74140] focus:border-transparent transition-all"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Choose a clear, descriptive name for your service</p>
            </div>

            {/* Service Category */}
            <div>
              <label htmlFor="serviceCategory" className="block text-sm font-medium text-gray-900 mb-2">
                Service Category<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="relative">
                  <Layers className="absolute left-3 top-6 transform -translate-y-1/2 w-5 h-5 text-gray-400"/>
                </div>
                <select
                  id="serviceCategory"
                  name="serviceCategory"
                  value={formData.serviceCategory}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg text-sm text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-[#B74140] focus:border-transparent transition-all cursor-pointer"
                  required
                >
                  <option value="">Select a category</option>
                  <option value="cleaning">Cleaning Services</option>
                  <option value="plumbing">Plumbing</option>
                  <option value="electrical">Electrical Services</option>
                  <option value="carpentry">Carpentry</option>
                  <option value="painting">Painting</option>
                  <option value="landscaping">Landscaping</option>
                  <option value="other">Other</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-700 pointer-events-none" />
              </div>
            </div>

            {/* Service Description */}
            <div>
              <label htmlFor="serviceDescription" className="block text-sm font-medium text-gray-900 mb-2">
                Service Description<span className="text-red-500">*</span>
              </label>
              <textarea
                id="serviceDescription"
                name="serviceDescription"
                value={formData.serviceDescription}
                onChange={handleInputChange}
                placeholder="Describe your service in detail. Include what's included, your expertise, and what makes your service unique..."
                rows={5}
                maxLength={500}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#B74140] focus:border-transparent transition-all resize-none"
                required
              />
              <p className="text-xs text-gray-500 mt-1 text-right">{formData.serviceDescription.length}/500 characters</p>
              <p className="text-xs text-gray-500 mt-1">Provide a detailed description to help customers understand your service</p>
            </div>

            {/* Coverage Area */}
            <div>
              <label htmlFor="coverageArea" className="block text-sm font-medium text-gray-900 mb-2">
                Coverage Area<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <textarea
                  id="coverageArea"
                  name="coverageArea"
                  value={formData.coverageArea}
                  onChange={handleInputChange}
                  placeholder="List the areas, neighborhoods, or zip codes you serve (e.g., Downtown, Midtown, 10001, 10002)"
                  rows={3}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#B74140] focus:border-transparent transition-all resize-none"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Specify all locations where you can provide this service</p>
            </div>

            {/* Verification Section */}
            <div className="pt-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Verification</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Business Type */}
                <div>
                  <label htmlFor="businessType" className="block text-sm font-medium text-gray-900 mb-2">
                    Business Type
                  </label>
                  <div className="relative">
                    <select
                      id="businessType"
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-[#B74140] focus:border-transparent transition-all cursor-pointer"
                    >
                      <option value="company">Company</option>
                      <option value="individual">Individual</option>
                      <option value="llc">LLC</option>
                      <option value="corporation">Corporation</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-700 pointer-events-none" />
                  </div>
                </div>

                {/* National ID / Trade License */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    National ID / Trade License
                  </label>
                  <label className="w-full h-[46px] px-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-500 flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>{formData.nationalId ? formData.nationalId.name : 'Upload document'}</span>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Company Name */}
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-900 mb-2">
                Company Name
              </label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                placeholder="Company Name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#B74140] focus:border-transparent transition-all"
              />
            </div>

            {/* Payment Information Section */}
            <div className="pt-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Payment Information</h2>
              
              {/* Payout Method */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Payout Method
                </label>
                <div className="border border-gray-300 rounded-lg p-4 flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                      <rect width="32" height="32" rx="4" fill="#635BFF"/>
                      <path d="M13.8 13.5c0-.9.7-1.4 1.9-1.4 1.7 0 3.9.5 5.6 1.4V9.7c-1.9-.7-3.7-1-5.6-1-4.6 0-7.7 2.4-7.7 6.4 0 6.2 8.5 5.2 8.5 7.9 0 1-.9 1.5-2.2 1.5-1.9 0-4.3-.8-6.2-1.8v3.9c2.1.9 4.2 1.3 6.2 1.3 4.7 0 8-2.3 8-6.4 0-6.7-8.5-5.5-8.5-8z" fill="white"/>
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm">Stripe</div>
                    <div className="text-xs text-gray-500">Secure payments via Stripe</div>
                  </div>
                </div>
              </div>

              {/* Bank Account / Card Info */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Bank Account / Card Info
                </label>
                <div className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-400 bg-gray-50">
                  Account details will be collected via Stripe
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-900 mb-2">
                Address <span className="text-gray-500 font-normal">(optional but recommended)</span>
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Full business address"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#B74140] focus:border-transparent transition-all resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="bg-[#B74140] hover:bg-[#a33635] text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 text-sm"
              >
                Save & Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}