"use client";

import React, { useState } from "react";
import { ArrowRight, BriefcaseBusinessIcon, ChevronDown, Link2, Mail, Phone } from "lucide-react";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/store/useAuthStore";

const normalizeBusinessType = (value: string) =>
  value.trim() === "individual" ? "individual" : "company";

export default function BusinessProfileForm() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const apiError = useAuthStore((state) => state.error);
  const successMessage = useAuthStore((state) => state.successMessage);
  const clearError = useAuthStore((state) => state.clearError);
  const clearSuccessMessage = useAuthStore((state) => state.clearSuccessMessage);
  const submitVenueProviderOnboarding = useAuthStore(
    (state) => state.submitVenueProviderOnboarding
  );

  const [formData, setFormData] = useState({
    stripeAccountId: "",
    businessName: "",
    businessType: "individual",
    legalBusinessName: "",
    registrationNo: "",
    businessMail: "",
    businessPhoneNo: "",
  });
  const [validationError, setValidationError] = useState("");

  const formError = validationError || apiError;

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;

    if (validationError) {
      setValidationError("");
    }

    if (apiError) {
      clearError();
    }

    if (successMessage) {
      clearSuccessMessage();
    }

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!user?.id || !user.email) {
      return "Please sign in again before submitting onboarding information.";
    }

    if (!formData.stripeAccountId.trim()) {
      return "Stripe account ID is required.";
    }

    if (!formData.businessName.trim()) {
      return "Business name is required.";
    }

    if (!formData.businessType.trim()) {
      return "Business type is required.";
    }

    if (!formData.legalBusinessName.trim()) {
      return "Legal business name is required.";
    }

    if (!formData.registrationNo.trim()) {
      return "Registration number is required.";
    }

    if (!formData.businessMail.trim()) {
      return "Business email is required.";
    }

    if (!formData.businessPhoneNo.trim()) {
      return "Business phone number is required.";
    }

    return "";
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextValidationError = validateForm();
    if (nextValidationError) {
      setValidationError(nextValidationError);
      return;
    }

    if (!user) {
      setValidationError("Please sign in again before continuing.");
      return;
    }

    try {
      await submitVenueProviderOnboarding({
        _id: user.id,
        fullName: user.fullName,
        email: user.email,
        stripeAccountId: formData.stripeAccountId.trim(),
        businessName: formData.businessName.trim(),
        businessType: normalizeBusinessType(formData.businessType),
        legalBusinessName: formData.legalBusinessName.trim(),
        registrationNo: formData.registrationNo.trim(),
        businessMail: formData.businessMail.trim(),
        businessPhoneNo: formData.businessPhoneNo.trim(),
      });

      router.push("/venueprovider/dashboard/dashboard");
    } catch {
      // Store error is already handled for the UI.
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
          <div className="mb-8">
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#B74140]">
                <BriefcaseBusinessIcon className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Venue Business Profile
              </h1>
            </div>
            <p className="ml-[52px] text-sm text-gray-600">
              Submit your venue business details to complete onboarding and move
              into the dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  Account Name
                </label>
                <input
                  value={user?.fullName ?? ""}
                  readOnly
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-600"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  Account Email
                </label>
                <input
                  value={user?.email ?? ""}
                  readOnly
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-600"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="stripeAccountId"
                className="mb-2 block text-sm font-medium text-gray-900"
              >
                Stripe Account ID<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  id="stripeAccountId"
                  name="stripeAccountId"
                  value={formData.stripeAccountId}
                  onChange={handleInputChange}
                  placeholder="e.g., acct_1Example123456789"
                  className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 text-sm placeholder-gray-400 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#B74140]"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="businessName"
                className="mb-2 block text-sm font-medium text-gray-900"
              >
                Business Name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="businessName"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                placeholder="Enter your business name"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm placeholder-gray-400 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#B74140]"
                required
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="businessType"
                  className="mb-2 block text-sm font-medium text-gray-900"
                >
                  Business Type<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="businessType"
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleInputChange}
                    className="w-full cursor-pointer appearance-none rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#B74140]"
                    required
                  >
                    <option value="individual">Individual</option>
                    <option value="company">Company</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-700" />
                </div>
              </div>

              <div>
                <label
                  htmlFor="legalBusinessName"
                  className="mb-2 block text-sm font-medium text-gray-900"
                >
                  Legal Business Name<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="legalBusinessName"
                  name="legalBusinessName"
                  value={formData.legalBusinessName}
                  onChange={handleInputChange}
                  placeholder="Royal Hall Ltd"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm placeholder-gray-400 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#B74140]"
                  required
                />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="registrationNo"
                  className="mb-2 block text-sm font-medium text-gray-900"
                >
                  Registration Number<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="registrationNo"
                  name="registrationNo"
                  value={formData.registrationNo}
                  onChange={handleInputChange}
                  placeholder="TRD-123456"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm placeholder-gray-400 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#B74140]"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="businessMail"
                  className="mb-2 block text-sm font-medium text-gray-900"
                >
                  Business Email<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    id="businessMail"
                    name="businessMail"
                    value={formData.businessMail}
                    onChange={handleInputChange}
                    placeholder="info@royalhall.com"
                    className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 text-sm placeholder-gray-400 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#B74140]"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="businessPhoneNo"
                className="mb-2 block text-sm font-medium text-gray-900"
              >
                Business Phone Number<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  id="businessPhoneNo"
                  name="businessPhoneNo"
                  value={formData.businessPhoneNo}
                  onChange={handleInputChange}
                  placeholder="8801700000000"
                  className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 text-sm placeholder-gray-400 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#B74140]"
                  required
                />
              </div>
            </div>

            {formError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {formError}
              </div>
            ) : null}

            {successMessage ? (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {successMessage}
              </div>
            ) : null}

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className={`flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-medium text-white transition-colors duration-200 ${
                  isLoading
                    ? "cursor-not-allowed bg-[#B74140]/70"
                    : "bg-[#B74140] hover:bg-[#a33635]"
                }`}
              >
                {isLoading ? "Submitting..." : "Save & Continue"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
