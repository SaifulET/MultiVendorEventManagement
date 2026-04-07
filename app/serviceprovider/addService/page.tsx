"use client";

import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import {
  ArrowLeftIcon,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Layers,
  MapPin,
  Plus,
  Tag,
  Upload,
  Users,
  Video,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { api, getApiErrorMessage } from "@/lib/api";

type OverrideStatus = "available" | "pending" | "booked";
type AmenityKey = "deliveryIncluded" | "setupIncluded" | "staffIncluded";

interface AvailabilityOverride {
  date: string;
  slots: Array<{
    hour: number;
    status: OverrideStatus;
  }>;
}

interface SelectedImage {
  file: File;
  previewUrl: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface ServiceResponseData {
  _id: string;
  publishStatus?: string;
}

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

const pricingTypes = [
  { value: "package", label: "Package" },
  { value: "hourly", label: "Hourly" },
  { value: "custom", label: "Custom" },
];

const discountTypes = [
  { value: "percentage", label: "Percentage" },
  { value: "flat", label: "Flat amount" },
];

const amenityLabels: Array<{ id: AmenityKey; label: string }> = [
  { id: "deliveryIncluded", label: "Delivery Included" },
  { id: "setupIncluded", label: "Setup Included" },
  { id: "staffIncluded", label: "Staff Included" },
];

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const slotHours = Array.from({ length: 15 }, (_, index) => index + 8);

const splitValues = (value: string) =>
  value
    .split(/\r?\n|,/)
    .map((item) => item.trim().replace(/^['"]+|['"]+$/g, ""))
    .filter(Boolean);

const formatDateKey = (year: number, month: number, day: number) =>
  `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

const formatDisplayDate = (date: string) => {
  const [year, month, day] = date.split("-").map(Number);
  return `${day} ${monthNames[month - 1]} ${year}`;
};

const createEmptySlotDraft = () =>
  Object.fromEntries(slotHours.map((hour) => [hour, null])) as Record<
    number,
    OverrideStatus | null
  >;

const cycleSlotStatus = (status: OverrideStatus | null) => {
  if (!status) {
    return "available" as OverrideStatus;
  }

  if (status === "available") {
    return "pending" as OverrideStatus;
  }

  return status === "pending" ? ("booked" as OverrideStatus) : null;
};

const getCalendarStatus = (override?: AvailabilityOverride) => {
  if (!override?.slots.length) {
    return null;
  }

  if (override.slots.some((slot) => slot.status === "booked")) {
    return "booked";
  }

  if (override.slots.some((slot) => slot.status === "pending")) {
    return "pending";
  }

  return "available";
};

const getCalendarStatusClassName = (status: OverrideStatus) => {
  if (status === "available") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "pending") {
    return "border-yellow-200 bg-yellow-50 text-yellow-700";
  }

  return "border-red-200 bg-red-50 text-red-700";
};

const getSlotButtonClassName = (status: OverrideStatus | null) => {
  if (status === "available") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "pending") {
    return "border-yellow-200 bg-yellow-50 text-yellow-700";
  }

  if (status === "booked") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  return "border-gray-200 bg-white text-gray-600 hover:border-gray-300";
};

const formatHour = (hour: number) => {
  const suffix = hour >= 12 ? "PM" : "AM";
  const normalizedHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${normalizedHour}:00 ${suffix}`;
};

export default function AddServicePage() {
  const router = useRouter();
  const today = new Date();
  const previewUrlsRef = useRef<string[]>([]);

  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [slotDraft, setSlotDraft] = useState<Record<number, OverrideStatus | null>>(
    createEmptySlotDraft()
  );
  const [availabilityOverrides, setAvailabilityOverrides] = useState<
    AvailabilityOverride[]
  >([]);
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [amenities, setAmenities] = useState<Record<AmenityKey, boolean>>({
    deliveryIncluded: true,
    setupIncluded: true,
    staffIncluded: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [formData, setFormData] = useState({
    serviceName: "",
    category: "",
    description: "",
    serviceArea: "",
    tags: "",
    amount: "",
    pricingType: "package",
    currency: "BDT",
    discountType: "percentage",
    discountValue: "",
    capacity: "",
    videoUrl: "",
  });

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const selectedDateKey =
    selectedDay === null ? null : formatDateKey(currentYear, currentMonth, selectedDay);

  const draftSlots = slotHours
    .map((hour) => {
      const status = slotDraft[hour];
      return status ? { hour, status } : null;
    })
    .filter(
      (
        slot
      ): slot is {
        hour: number;
        status: OverrideStatus;
      } => Boolean(slot)
    );

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((previewUrl) => {
        URL.revokeObjectURL(previewUrl);
      });
    };
  }, []);

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;

    if (error) {
      setError("");
    }

    if (successMessage) {
      setSuccessMessage("");
    }

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;

    if (!files?.length) {
      return;
    }

    if (error) {
      setError("");
    }

    if (successMessage) {
      setSuccessMessage("");
    }

    const nextImages = Array.from(files).map((file) => {
      const previewUrl = URL.createObjectURL(file);
      previewUrlsRef.current.push(previewUrl);

      return {
        file,
        previewUrl,
      };
    });

    setSelectedImages((current) => [...current, ...nextImages]);
    event.target.value = "";
  };

  const removeImage = (index: number) => {
    setSelectedImages((current) => {
      const imageToRemove = current[index];

      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.previewUrl);
        previewUrlsRef.current = previewUrlsRef.current.filter(
          (previewUrl) => previewUrl !== imageToRemove.previewUrl
        );
      }

      return current.filter((_, imageIndex) => imageIndex !== index);
    });
  };

  const toggleAmenity = (amenityKey: AmenityKey) => {
    if (error) {
      setError("");
    }

    setAmenities((current) => ({
      ...current,
      [amenityKey]: !current[amenityKey],
    }));
  };

  const handlePrevMonth = () => {
    setSelectedDay(null);
    setSlotDraft(createEmptySlotDraft());

    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((year) => year - 1);
      return;
    }

    setCurrentMonth((month) => month - 1);
  };

  const handleNextMonth = () => {
    setSelectedDay(null);
    setSlotDraft(createEmptySlotDraft());

    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((year) => year + 1);
      return;
    }

    setCurrentMonth((month) => month + 1);
  };

  const handleDayClick = (day: number) => {
    const nextDate = formatDateKey(currentYear, currentMonth, day);
    const existingOverride = availabilityOverrides.find(
      (override) => override.date === nextDate
    );

    setSelectedDay(day);
    setError("");

    if (!existingOverride) {
      setSlotDraft(createEmptySlotDraft());
      return;
    }

    const nextDraft = createEmptySlotDraft();
    existingOverride.slots.forEach((slot) => {
      nextDraft[slot.hour] = slot.status;
    });
    setSlotDraft(nextDraft);
  };

  const handleSlotClick = (hour: number) => {
    setSlotDraft((current) => ({
      ...current,
      [hour]: cycleSlotStatus(current[hour]),
    }));
  };

  const handleSaveOverride = () => {
    if (!selectedDateKey) {
      setError("Select a date before saving an availability override.");
      return;
    }

    if (!draftSlots.length) {
      setError("Select at least one hourly slot before saving the override.");
      return;
    }

    setAvailabilityOverrides((current) => {
      const nextOverride = {
        date: selectedDateKey,
        slots: draftSlots,
      };

      const existingIndex = current.findIndex(
        (override) => override.date === selectedDateKey
      );

      if (existingIndex === -1) {
        return [...current, nextOverride].sort((left, right) =>
          left.date.localeCompare(right.date)
        );
      }

      const nextOverrides = [...current];
      nextOverrides[existingIndex] = nextOverride;
      return nextOverrides;
    });

    setError("");
    setSuccessMessage(`Availability override saved for ${formatDisplayDate(selectedDateKey)}.`);
  };

  const handleRemoveOverride = (date: string) => {
    setAvailabilityOverrides((current) =>
      current.filter((override) => override.date !== date)
    );

    if (selectedDateKey === date) {
      setSelectedDay(null);
      setSlotDraft(createEmptySlotDraft());
    }

    setSuccessMessage("Availability override removed.");
  };

  const validateForm = () => {
    if (!formData.serviceName.trim()) {
      return "Service name is required.";
    }

    if (!formData.category.trim()) {
      return "Category is required.";
    }

    if (!formData.description.trim()) {
      return "Description is required.";
    }

    if (!splitValues(formData.serviceArea).length) {
      return "Add at least one service area.";
    }

    if (!formData.amount.trim() || Number(formData.amount) <= 0) {
      return "Amount must be greater than zero.";
    }

    if (!formData.capacity.trim() || Number(formData.capacity) <= 0) {
      return "Capacity must be greater than zero.";
    }

    return "";
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      const multipartPayload = new FormData();
      const requestPayload = {
        information: {
          serviceName: formData.serviceName.trim(),
          category: formData.category.trim(),
          description: formData.description.trim(),
          serviceArea: splitValues(formData.serviceArea),
          tags: splitValues(formData.tags),
        },
        pricing: {
          amount: Number(formData.amount),
          pricingType: formData.pricingType,
          currency: formData.currency.trim() || "BDT",
          discount: {
            type: formData.discountType,
            value: Number(formData.discountValue || 0),
          },
        },
        settings: {
          amenities,
          capacity: Number(formData.capacity),
        },
        media: {
          galleryImages: [],
          videoUrl: formData.videoUrl.trim(),
        },
        availabilityOverrides,
      };

      multipartPayload.append("payload", JSON.stringify(requestPayload));

      selectedImages.forEach((image) => {
        multipartPayload.append("images", image.file, image.file.name);
      });

      const response = await api.post<ApiResponse<ServiceResponseData>>(
        "/api/v1/service-provider/services",
        multipartPayload
      );

      setSuccessMessage(response.data.message || "Service created successfully.");
      router.push("/serviceprovider/dashboard/myServices");
    } catch (submissionError) {
      setError(getApiErrorMessage(submissionError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCalendar = () => {
    const days: React.ReactElement[] = [];

    for (let index = 0; index < firstDayOfMonth; index += 1) {
      days.push(<div key={`empty-${index}`} className="aspect-square" />);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const dateKey = formatDateKey(currentYear, currentMonth, day);
      const existingOverride = availabilityOverrides.find(
        (override) => override.date === dateKey
      );
      const calendarStatus = getCalendarStatus(existingOverride);
      const isSelected = selectedDay === day;

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => handleDayClick(day)}
          className={`aspect-square rounded-lg border text-sm font-medium transition-colors ${
            isSelected
              ? "border-[#B74140] bg-[#B74140] text-white"
              : calendarStatus
                ? getCalendarStatusClassName(calendarStatus)
                : "border-gray-200 text-gray-700 hover:bg-gray-50"
          }`}
        >
          {day}
        </button>
      );
    }

    return [
      ...dayLabels.map((label) => (
        <div key={label} className="py-2 text-center text-sm font-medium text-gray-600">
          {label}
        </div>
      )),
      ...days,
    ];
  };

  return (
    <div className="min-h-screen p-8 md:px-20 xl:px-40">
      <form onSubmit={handleSubmit}>
        <button
          type="button"
          className="mb-4 flex items-center gap-2"
          onClick={() => {
            router.push("/serviceprovider/dashboard/myServices");
          }}
        >
          <ArrowLeftIcon className="h-7 w-7" />
          <h1 className="text-[30px] font-bold leading-[36px] text-gray-900">
            Add Your Service
          </h1>
        </button>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
              <h2 className="mb-6 text-xl font-bold text-gray-900">
                Service Information
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900">
                    Service Name
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="serviceName"
                      value={formData.serviceName}
                      onChange={handleInputChange}
                      placeholder="Enter service name"
                      className="w-full rounded-lg border border-[#E5E7EB] py-2.5 pl-10 pr-4 outline-none transition-colors focus:border-gray-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900">
                    Category
                  </label>
                  <div className="relative">
                    <Layers className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full appearance-none rounded-lg border border-[#E5E7EB] bg-white py-2.5 pl-10 pr-4 outline-none transition-colors focus:border-gray-400"
                    >
                      <option value="">Select category</option>
                      {serviceCategories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={5}
                    placeholder="Describe your service in detail"
                    className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2.5 outline-none transition-colors focus:border-gray-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900">
                    Service Area
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <textarea
                      name="serviceArea"
                      value={formData.serviceArea}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Dhaka, Gazipur"
                      className="w-full rounded-lg border border-[#E5E7EB] py-2.5 pl-10 pr-4 outline-none transition-colors focus:border-gray-400"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Separate multiple areas with commas or new lines.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900">
                    Tags
                  </label>
                  <textarea
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="wedding, corporate"
                    className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2.5 outline-none transition-colors focus:border-gray-400"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
              <h2 className="mb-6 text-xl font-bold text-gray-900">Pricing</h2>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900">
                    Amount
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      min="0"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      placeholder="50000"
                      className="w-full rounded-lg border border-[#E5E7EB] py-2.5 pl-10 pr-4 outline-none transition-colors focus:border-gray-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900">
                    Pricing Type
                  </label>
                  <select
                    name="pricingType"
                    value={formData.pricingType}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5 outline-none transition-colors focus:border-gray-400"
                  >
                    {pricingTypes.map((pricingType) => (
                      <option key={pricingType.value} value={pricingType.value}>
                        {pricingType.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900">
                    Currency
                  </label>
                  <input
                    type="text"
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    placeholder="BDT"
                    className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2.5 outline-none transition-colors focus:border-gray-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900">
                    Capacity
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      min="0"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleInputChange}
                      placeholder="300"
                      className="w-full rounded-lg border border-[#E5E7EB] py-2.5 pl-10 pr-4 outline-none transition-colors focus:border-gray-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900">
                    Discount Type
                  </label>
                  <select
                    name="discountType"
                    value={formData.discountType}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5 outline-none transition-colors focus:border-gray-400"
                  >
                    {discountTypes.map((discountType) => (
                      <option key={discountType.value} value={discountType.value}>
                        {discountType.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900">
                    Discount Value
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="discountValue"
                    value={formData.discountValue}
                    onChange={handleInputChange}
                    placeholder="10"
                    className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2.5 outline-none transition-colors focus:border-gray-400"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
              <h2 className="mb-6 text-xl font-bold text-gray-900">
                Service Settings
              </h2>

              <div className="grid gap-4 sm:grid-cols-3">
                {amenityLabels.map((amenity) => (
                  <button
                    key={amenity.id}
                    type="button"
                    onClick={() => toggleAmenity(amenity.id)}
                    className={`rounded-lg border px-4 py-4 text-sm font-medium transition-colors ${
                      amenities[amenity.id]
                        ? "border-[#B74140] bg-[#B74140]/10 text-[#8C2D2C]"
                        : "border-[#E5E7EB] bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {amenity.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
              <h2 className="mb-6 text-xl font-bold text-gray-900">Gallery</h2>

              <div className="mb-6 rounded-xl border-2 border-dashed border-gray-300 p-8 text-center">
                <Upload className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                <p className="mb-1 font-medium text-gray-700">
                  Upload service images
                </p>
                <p className="mb-4 text-sm text-gray-500">
                  These files are sent as multipart `images`.
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="service-file-upload"
                />
                <label
                  htmlFor="service-file-upload"
                  className="inline-block cursor-pointer rounded-lg bg-[#B74140] px-6 py-2.5 text-white transition-colors hover:bg-[#862c2a]"
                >
                  Choose Files
                </label>
              </div>

              {selectedImages.length ? (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {selectedImages.map((image, index) => (
                    <div
                      key={`${image.file.name}-${index}`}
                      className="group relative aspect-video overflow-hidden rounded-lg bg-gray-100"
                    >
                      <Image
                        src={image.previewUrl}
                        alt={`Service image ${index + 1}`}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute right-2 top-2 rounded-full bg-[#B74140] p-1 text-white opacity-0 transition-opacity hover:bg-[#702120] group-hover:opacity-100"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <label
                    htmlFor="service-file-upload"
                    className="flex aspect-video cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 transition-colors hover:border-gray-400"
                  >
                    <Plus className="h-8 w-8 text-gray-400" />
                  </label>
                </div>
              ) : (
                <div className="rounded-lg bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
                  No images selected yet.
                </div>
              )}
            </div>

            <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
              <h2 className="mb-6 text-xl font-bold text-gray-900">Video</h2>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  YouTube Video URL
                </label>
                <div className="relative">
                  <Video className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="videoUrl"
                    value={formData.videoUrl}
                    onChange={handleInputChange}
                    placeholder="https://youtube.com/watch?v=abc123"
                    className="w-full rounded-lg border border-[#E5E7EB] py-2.5 pl-10 pr-4 outline-none transition-colors focus:border-gray-400"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
              <h2 className="mb-6 text-xl font-bold text-gray-900">
                Availability Calendar
              </h2>

              <div className="mb-4">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">
                    {monthNames[currentMonth]} {currentYear}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      className="rounded p-1 transition-colors hover:bg-gray-100"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      className="rounded p-1 transition-colors hover:bg-gray-100"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
              </div>

              <div className="flex flex-wrap gap-4 border-t pt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-emerald-400" />
                  <span className="text-gray-700">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-yellow-400" />
                  <span className="text-gray-700">Pending</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-red-400" />
                  <span className="text-gray-700">Booked</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
              <h2 className="mb-4 text-xl font-bold text-gray-900">
                Daily Slots
              </h2>

              <p className="mb-4 text-sm text-gray-500">
                {selectedDateKey
                  ? `Editing ${formatDisplayDate(selectedDateKey)}`
                  : "Choose a date from the calendar to set override slots."}
              </p>

              <div className="grid grid-cols-2 gap-2">
                {slotHours.map((hour) => (
                  <button
                    key={hour}
                    type="button"
                    disabled={!selectedDateKey}
                    onClick={() => handleSlotClick(hour)}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${getSlotButtonClassName(
                      slotDraft[hour]
                    )}`}
                  >
                    {formatHour(hour)}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleSaveOverride}
                className="mt-4 w-full rounded-lg bg-[#B74140] px-4 py-3 font-semibold text-white transition-colors hover:bg-[#862c2a]"
              >
                Save Availability Override
              </button>
            </div>

            <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
              <h2 className="mb-4 text-xl font-bold text-gray-900">
                Saved Overrides
              </h2>

              {availabilityOverrides.length ? (
                <div className="space-y-3">
                  {availabilityOverrides.map((override) => {
                    const overrideStatus = getCalendarStatus(override) ?? "available";

                    return (
                      <div
                        key={override.date}
                        className="rounded-lg border border-[#E5E7EB] p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-gray-900">
                              {formatDisplayDate(override.date)}
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                              {override.slots.length} slot
                              {override.slots.length === 1 ? "" : "s"} updated
                            </p>
                          </div>
                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-medium ${getCalendarStatusClassName(
                              overrideStatus
                            )}`}
                          >
                            {overrideStatus}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveOverride(override.date)}
                          className="mt-3 text-sm font-medium text-[#B74140] hover:text-[#862c2a]"
                        >
                          Remove override
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-lg bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
                  No availability overrides added yet.
                </div>
              )}
            </div>

            <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
              <h2 className="mb-4 text-xl font-bold text-gray-900">
                Publish Settings
              </h2>

              {error ? (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              {successMessage ? (
                <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {successMessage}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-[#B74140] px-4 py-3 font-semibold text-white transition-colors hover:bg-[#862c2a] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Creating Service..." : "Create Service"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
