"use client";

import React, { useState } from "react";
import {
  ArrowRight,
  BriefcaseBusinessIcon,
  ChevronDown,
  MapPin,
  NotebookPen,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/store/useAuthStore";

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
  const submitEventPlannerOnboarding = useAuthStore(
    (state) => state.submitEventPlannerOnboarding
  );

  const [formData, setFormData] = useState({
    plannerName: "",
    description: "",
    coverageArea: "",
    address: "",
    hourlyRate: "",
    currency: "GBP",
    businessType: "individual",
    companyName: "",
    nidNumber: "",
  });
  const [documentPhoto, setDocumentPhoto] = useState<File | null>(null);
  const [validationError, setValidationError] = useState("");

  const formError = validationError || apiError;

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

  const handleDocumentPhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (validationError) {
      setValidationError("");
    }

    if (apiError) {
      clearError();
    }

    if (successMessage) {
      clearSuccessMessage();
    }

    setDocumentPhoto(event.target.files?.[0] ?? null);
  };

  const validateForm = () => {
    if (!user?.id || !user.email) {
      return "Please sign in again before submitting onboarding information.";
    }

    if (!formData.plannerName.trim()) {
      return "Planner name is required.";
    }

    if (!formData.description.trim()) {
      return "Description is required.";
    }

    if (!splitValues(formData.coverageArea).length) {
      return "Please add at least one coverage area.";
    }

    if (!formData.address.trim()) {
      return "Address is required.";
    }

    if (!formData.hourlyRate.trim() || Number(formData.hourlyRate) <= 0) {
      return "Hourly rate must be greater than zero.";
    }

    if (!formData.nidNumber.trim()) {
      return "National ID / trade license number is required.";
    }

    if (!documentPhoto) {
      return "National ID / trade license image is required.";
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
      const requestPayload = {
        _id: user.id,
        fullName: user.fullName,
        email: user.email,
        profileInfo: {
          nidOrTradeLicenseNumber: formData.nidNumber.trim(),
          name: formData.plannerName.trim(),
          description: formData.description.trim(),
          coverageArea: splitValues(formData.coverageArea),
          address: formData.address.trim(),
          hourlyRate: Number(formData.hourlyRate),
          currency: formData.currency.trim().toUpperCase(),
          verification: {
            businessType: normalizeBusinessType(formData.businessType),
            companyName: formData.companyName.trim(),
          },
        },
      };

      const multipartPayload = new FormData();
      multipartPayload.append("payload", JSON.stringify(requestPayload));

      if (documentPhoto) {
        multipartPayload.append(
          "nationalIdOrTradeLicenseFiles",
          documentPhoto,
          documentPhoto.name
        );
      }

      await submitEventPlannerOnboarding(multipartPayload);

      router.push("/eventPlanner/auth/subscription");
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
                Event Planner Profile Information
              </h1>
            </div>
            <p className="ml-[52px] text-sm text-gray-600">
              Tell us about your event planning business and submit your
              onboarding details.
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
                htmlFor="plannerName"
                className="mb-2 block text-sm font-medium text-gray-900"
              >
                Planner Name<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <NotebookPen className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  id="plannerName"
                  name="plannerName"
                  value={formData.plannerName}
                  onChange={handleInputChange}
                  placeholder="e.g., Star Events"
                  className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 text-sm placeholder-gray-400 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#B74140]"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-medium text-gray-900"
              >
                Description<span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Wedding and corporate event planning"
                rows={5}
                maxLength={500}
                className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm placeholder-gray-400 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#B74140]"
                required
              />
              <p className="mt-1 text-right text-xs text-gray-500">
                {formData.description.length}/500 characters
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
            </div>

            <div>
              <label
                htmlFor="address"
                className="mb-2 block text-sm font-medium text-gray-900"
              >
                Address<span className="text-red-500">*</span>
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Banani, Dhaka"
                rows={3}
                className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm placeholder-gray-400 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#B74140]"
                required
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="hourlyRate"
                  className="mb-2 block text-sm font-medium text-gray-900"
                >
                  Hourly Rate<span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="hourlyRate"
                  name="hourlyRate"
                  min="0"
                  value={formData.hourlyRate}
                  onChange={handleInputChange}
                  placeholder="5000"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm placeholder-gray-400 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#B74140]"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="currency"
                  className="mb-2 block text-sm font-medium text-gray-900"
                >
                  Currency<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  placeholder="GBP"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm uppercase placeholder-gray-400 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#B74140]"
                  required
                />
              </div>
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
                htmlFor="nidNumber"
                className="mb-2 block text-sm font-medium text-gray-900"
              >
                National ID / Trade License Number
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nidNumber"
                name="nidNumber"
                value={formData.nidNumber}
                onChange={handleInputChange}
                inputMode="numeric"
                placeholder="Enter your NID or trade license number"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm placeholder-gray-400 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#B74140]"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                This field now accepts a number instead of a document URL.
              </p>
            </div>

            <div>
              <label
                htmlFor="documentPhoto"
                className="mb-2 block text-sm font-medium text-gray-900"
              >
                Document Photo
                <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                id="documentPhoto"
                name="documentPhoto"
                accept="image/*"
                onChange={handleDocumentPhotoChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-[#B74140] file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-[#a33635]"
              />
              <p className="mt-1 text-xs text-gray-500">
                This image is uploaded as the multipart file field named{" "}
                <span className="font-medium">
                  nationalIdOrTradeLicenseFiles
                </span>
                .
              </p>
              {documentPhoto ? (
                <p className="mt-2 text-sm text-gray-700">{documentPhoto.name}</p>
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
