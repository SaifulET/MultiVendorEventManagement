"use client";

import React, { useMemo, useState } from "react";
import {
  ArrowRight,
  BriefcaseBusinessIcon,
  ChevronDown,
  Layers,
  MapPin,
  Tag,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/store/useAuthStore";

const serviceCategories = [
  "Catering",
  "Photography",
  "Videography",
  "Decoration",
  "Lighting",
  "Sound",
  "Entertainment",
  "Transport",
  "Makeup",
  "Other",
];

const splitValues = (value: string) =>
  value
    .split(/\r?\n|,/)
    .map((item) => item.trim().replace(/^['"]+|['"]+$/g, ""))
    .filter(Boolean);

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
  const submitServiceProviderOnboarding = useAuthStore(
    (state) => state.submitServiceProviderOnboarding
  );

  const [formData, setFormData] = useState({
    serviceName: "",
    serviceCategory: "",
    serviceDescription: "",
    coverageArea: "",
    businessType: "individual",
    companyName: "",
    documentUrls: "",
  });
  const [validationError, setValidationError] = useState("");

  const formError = validationError || apiError;

  const documentPreview = useMemo(
    () => splitValues(formData.documentUrls),
    [formData.documentUrls]
  );

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
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

    if (!formData.serviceName.trim()) {
      return "Service name is required.";
    }

    if (!formData.serviceCategory.trim()) {
      return "Service category is required.";
    }

    if (!formData.serviceDescription.trim()) {
      return "Service description is required.";
    }

    if (!splitValues(formData.coverageArea).length) {
      return "Please add at least one coverage area.";
    }

    if (!formData.businessType.trim()) {
      return "Business type is required.";
    }

    if (!documentPreview.length) {
      return "Please add at least one document URL.";
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
      await submitServiceProviderOnboarding({
        _id: user.id,
        name: user.fullName,
        email: user.email,
        profileInfo: {
          serviceName: formData.serviceName.trim(),
          serviceCategory: formData.serviceCategory.trim(),
          serviceDescription: formData.serviceDescription.trim(),
          coverageArea: splitValues(formData.coverageArea),
          verification: {
            businessType: normalizeBusinessType(formData.businessType),
            companyName: formData.companyName.trim(),
            nationalIdOrTradeLicenseFiles: documentPreview,
          },
        },
        services: [],
      });

      router.push("/serviceprovider/dashboard/dashboard");
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
                Business Profile Information
              </h1>
            </div>
            <p className="ml-[52px] text-sm text-gray-600">
              Tell us about the services you provide and submit your onboarding
              details.
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
                htmlFor="serviceName"
                className="mb-2 block text-sm font-medium text-gray-900"
              >
                Service Name<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  id="serviceName"
                  name="serviceName"
                  value={formData.serviceName}
                  onChange={handleInputChange}
                  placeholder="e.g., Premium Catering"
                  className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 text-sm placeholder-gray-400 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#B74140]"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="serviceCategory"
                className="mb-2 block text-sm font-medium text-gray-900"
              >
                Service Category<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Layers className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <select
                  id="serviceCategory"
                  name="serviceCategory"
                  value={formData.serviceCategory}
                  onChange={handleInputChange}
                  className="w-full cursor-pointer appearance-none rounded-lg border border-gray-300 py-3 pl-10 pr-10 text-sm text-gray-900 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#B74140]"
                  required
                >
                  <option value="">Select a category</option>
                  {serviceCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-700" />
              </div>
            </div>

            <div>
              <label
                htmlFor="serviceDescription"
                className="mb-2 block text-sm font-medium text-gray-900"
              >
                Service Description<span className="text-red-500">*</span>
              </label>
              <textarea
                id="serviceDescription"
                name="serviceDescription"
                value={formData.serviceDescription}
                onChange={handleInputChange}
                placeholder="Describe your service in detail."
                rows={5}
                maxLength={500}
                className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm placeholder-gray-400 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#B74140]"
                required
              />
              <p className="mt-1 text-right text-xs text-gray-500">
                {formData.serviceDescription.length}/500 characters
              </p>
            </div>

            <div>
              <label
                htmlFor="coverageArea"
                className="mb-2 block text-sm font-medium text-gray-900"
              >
                Coverage Area<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <textarea
                  id="coverageArea"
                  name="coverageArea"
                  value={formData.coverageArea}
                  onChange={handleInputChange}
                  placeholder="Enter cities or areas separated by commas or new lines."
                  rows={3}
                  className="w-full resize-none rounded-lg border border-gray-300 py-3 pl-10 pr-4 text-sm placeholder-gray-400 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#B74140]"
                  required
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Example: Dhaka, Gazipur
              </p>
            </div>

            <div className="pt-4">
              <h2 className="mb-6 text-lg font-semibold text-gray-900">
                Verification
              </h2>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
                    >
                      <option value="individual">Individual</option>
                      <option value="company">Company</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-700" />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="companyName"
                    className="mb-2 block text-sm font-medium text-gray-900"
                  >
                    Company Name
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    placeholder="Evenit Ltd"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm placeholder-gray-400 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#B74140]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="documentUrls"
                className="mb-2 block text-sm font-medium text-gray-900"
              >
                National ID / Trade License URLs
                <span className="text-red-500">*</span>
              </label>
              <textarea
                id="documentUrls"
                name="documentUrls"
                value={formData.documentUrls}
                onChange={handleInputChange}
                placeholder="Paste one file URL per line, or separate them with commas."
                rows={4}
                className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm placeholder-gray-400 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#B74140]"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                The onboarding API you shared expects document URLs, so this form
                submits links instead of raw file uploads.
              </p>
              {documentPreview.length ? (
                <div className="mt-3 rounded-lg bg-gray-50 p-3">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                    Documents to submit
                  </p>
                  <div className="space-y-1 text-sm text-gray-700">
                    {documentPreview.map((url) => (
                      <div key={url} className="truncate">
                        {url}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
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
