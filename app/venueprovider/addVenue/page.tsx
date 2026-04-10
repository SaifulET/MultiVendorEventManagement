"use client";

import React, { ChangeEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowLeftIcon,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Plus,
  Upload,
  Wifi,
  Car,
  Snowflake,
  Utensils,
  Shield,
  Accessibility,
  Music,
  Presentation,
  X,
} from "lucide-react";
import axios from "axios";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

import { api, getApiErrorMessage } from "@/lib/api";
import { formatDateDDMMYY } from "@/lib/date";

const MapContainer = dynamic(
  () => import("@/app/component/vanueProvider/StreetMap/MapContainer"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[140px] items-center justify-center bg-gray-100">
        <div className="text-gray-500">Loading map...</div>
      </div>
    ),
  }
);

const DynamicMapPreview = dynamic(() => import("./DynamicMapPreview"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full flex-col items-center justify-center text-gray-500">
      <MapPin className="mb-2 h-6 w-6" />
      <span className="text-sm">Loading map...</span>
    </div>
  ),
});

type OverrideStatus = "available" | "pending" | "booked";

interface AmenityDefinition {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface AvailabilityOverride {
  date: string;
  slots: Array<{
    hour: number;
    status: OverrideStatus;
  }>;
}

interface LocationData {
  lat: number;
  lng: number;
  address: string;
  city: string;
  area: string;
}

interface SelectedImage {
  file: File;
  previewUrl: string;
}

interface VenueResponseData {
  _id: string;
  publishStatus: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

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

const amenities: AmenityDefinition[] = [
  { id: "parking", label: "Parking", icon: <Car className="h-6 w-6" /> },
  {
    id: "airConditioned",
    label: "Air Conditioned",
    icon: <Snowflake className="h-6 w-6" />,
  },
  { id: "stage", label: "Stage", icon: <Presentation className="h-6 w-6" /> },
  { id: "wifi", label: "Wi-Fi", icon: <Wifi className="h-6 w-6" /> },
  { id: "catering", label: "Catering", icon: <Utensils className="h-6 w-6" /> },
  { id: "soundSystem", label: "Sound System", icon: <Music className="h-6 w-6" /> },
  { id: "security", label: "Security", icon: <Shield className="h-6 w-6" /> },
  { id: "accessible", label: "Accessible", icon: <Accessibility className="h-6 w-6" /> },
];

const formatDateKey = (year: number, month: number, day: number) =>
  `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

const formatDisplayDate = (date: string) => {
  return formatDateDDMMYY(date, date);
};

const getStatusStyles = (status: OverrideStatus) => {
  if (status === "available") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "pending") {
    return "border-yellow-200 bg-yellow-50 text-yellow-700";
  }

  return "border-red-200 bg-red-50 text-red-700";
};

const createEmptySlotDraft = () =>
  Object.fromEntries(slotHours.map((hour) => [hour, null])) as Record<
    number,
    OverrideStatus | null
  >;

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

const cycleSlotStatus = (status: OverrideStatus | null) => {
  if (!status) {
    return "available" as OverrideStatus;
  }

  if (status === "available") {
    return "pending" as OverrideStatus;
  }

  return status === "pending" ? ("booked" as OverrideStatus) : null;
};

const formatHour = (hour: number) => {
  const suffix = hour >= 12 ? "PM" : "AM";
  const normalizedHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${normalizedHour}:00 ${suffix}`;
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

const MapPreview = ({
  selectedLocation,
  clearSelectedLocation,
}: {
  selectedLocation: LocationData | null;
  clearSelectedLocation: () => void;
}) => {
  if (!selectedLocation) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-gray-500">
        <MapPin className="mb-2 h-6 w-6" />
        <span className="text-sm">Click to set location on map</span>
      </div>
    );
  }

  return (
    <DynamicMapPreview
      selectedLocation={selectedLocation}
      setSelectedLocation={() => clearSelectedLocation()}
    />
  );
};

export default function VenueManagement() {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState<number>(2);
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [slotDraft, setSlotDraft] = useState<Record<number, OverrideStatus | null>>(
    createEmptySlotDraft()
  );
  const [availabilityOverrides, setAvailabilityOverrides] = useState<
    AvailabilityOverride[]
  >([]);
  const [showMap, setShowMap] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(
    null
  );
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [formData, setFormData] = useState({
    venueName: "",
    venueType: "",
    description: "",
    addressLine: "",
    city: "",
    area: "",
    basePrice: "",
    currency: "BDT",
    discountType: "percentage",
    discountValue: "",
    maximumGuests: "",
    videoUrl: "",
  });

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const selectedDateKey =
    selectedDay === null ? null : formatDateKey(currentYear, currentMonth, selectedDay);

  const draftSlots = useMemo(
    () =>
      slotHours
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
        ),
    [slotDraft]
  );

  const amenitiesPayload = useMemo(
    () =>
      Object.fromEntries(
        amenities.map((amenity) => [
          amenity.id,
          selectedAmenities.includes(amenity.id),
        ])
      ),
    [selectedAmenities]
  );

  useEffect(() => {
    return () => {
      selectedImages.forEach((image) => {
        URL.revokeObjectURL(image.previewUrl);
      });
    };
  }, [selectedImages]);

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

  const openMap = () => {
    if (error) {
      setError("");
    }

    setShowMap(true);
  };

  const handleLocationSelect = (location: LocationData) => {
    setSelectedLocation(location);
    setFormData((current) => ({
      ...current,
      addressLine: location.address,
      city: location.city || current.city,
      area: location.area || current.area,
    }));
  };

  const clearSelectedLocation = () => {
    setSelectedLocation(null);
  };

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
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

    const nextImages = Array.from(files).map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setSelectedImages((current) => [...current, ...nextImages]);
    event.target.value = "";
  };

  const removeImage = (index: number) => {
    setSelectedImages((current) => {
      const imageToRemove = current[index];

      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.previewUrl);
      }

      return current.filter((_, imageIndex) => imageIndex !== index);
    });
  };

  const toggleAmenity = (id: string) => {
    if (error) {
      setError("");
    }

    setSelectedAmenities((current) =>
      current.includes(id)
        ? current.filter((amenityId) => amenityId !== id)
        : [...current, id]
    );
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
    if (!formData.venueName.trim()) {
      return "Venue name is required.";
    }

    if (!formData.venueType.trim()) {
      return "Venue type is required.";
    }

    if (!formData.description.trim()) {
      return "Description is required.";
    }

    if (!formData.addressLine.trim()) {
      return "Address line is required.";
    }

    if (!formData.city.trim()) {
      return "City is required.";
    }

    if (!formData.area.trim()) {
      return "Area is required.";
    }

    if (!formData.basePrice.trim() || Number(formData.basePrice) <= 0) {
      return "Base price must be greater than zero.";
    }

    if (!formData.maximumGuests.trim() || Number(formData.maximumGuests) <= 0) {
      return "Maximum guests must be greater than zero.";
    }

    if (!selectedImages.length) {
      return "Add at least one venue image.";
    }

    return "";
  };

  const handleSubmit = async () => {
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
          venueName: formData.venueName.trim(),
          venueType: formData.venueType.trim(),
          description: formData.description.trim(),
          addressLine: formData.addressLine.trim(),
          city: formData.city.trim(),
          area: formData.area.trim(),
        },
        pricing: {
          basePrice: Number(formData.basePrice),
          currency: formData.currency,
          discount: {
            type: formData.discountType,
            value: Number(formData.discountValue || 0),
          },
          amenities: amenitiesPayload,
        },
        capacity: {
          maximumGuests: Number(formData.maximumGuests),
        },
        media: {
          galleryImages: [],
          videoUrl: formData.videoUrl.trim(),
        },
        availabilityOverrides,
      };

      selectedImages.forEach((image) => {
        multipartPayload.append("images", image.file, image.file.name);
      });

      multipartPayload.append("payload", JSON.stringify(requestPayload));

      console.log("Add venue request body:", requestPayload);
      console.log(
        "Add venue image payload:",
        selectedImages.map((image) => ({
          name: image.file.name,
          size: image.file.size,
          type: image.file.type,
        }))
      );
      console.log("Add venue multipart field names:", Array.from(multipartPayload.keys()));

      const response = await api.post<ApiResponse<VenueResponseData>>(
        "/api/v1/venue-provider/venues",
        multipartPayload
      );

      console.log("Add venue response:", response.data);
      setSuccessMessage(response.data.message || "Venue created successfully.");
      router.push("/venueprovider/dashboard/myVanue");
    } catch (submissionError) {
      console.error("Add venue error:", submissionError);
      if (axios.isAxiosError(submissionError)) {
        console.error("Add venue error response:", submissionError.response?.data);
      }
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
          onClick={() => handleDayClick(day)}
          className={`aspect-square rounded-lg border text-sm font-medium transition-colors ${
            isSelected
              ? "border-[#B74140] bg-[#B74140] text-white"
              : calendarStatus
                ? getStatusStyles(calendarStatus)
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
      <div>
        <button
          className="mb-4 flex items-center gap-2"
          onClick={() => {
            router.push("/venueprovider/dashboard/myVanue");
          }}
        >
          <ArrowLeftIcon className="h-7 w-7" />
          <h1 className="text-[30px] font-bold leading-[36px] text-gray-900">
            Add Your Venue
          </h1>
        </button>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
              <h2 className="mb-6 text-xl font-bold text-gray-900">
                Venue Information
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900">
                    Venue Name
                  </label>
                  <input
                    type="text"
                    name="venueName"
                    value={formData.venueName}
                    onChange={handleInputChange}
                    placeholder="Enter venue name"
                    className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2.5 outline-none transition-colors focus:border-gray-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900">
                    Venue Type
                  </label>
                  <select
                    name="venueType"
                    value={formData.venueType}
                    onChange={handleInputChange}
                    className="w-full appearance-none rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5 outline-none transition-colors focus:border-gray-400"
                  >
                    <option value="">Select venue type</option>
                    <option value="Banquet">Banquet</option>
                    <option value="Wedding Hall">Wedding Hall</option>
                    <option value="Conference Room">Conference Room</option>
                    <option value="Rooftop">Rooftop</option>
                    <option value="Outdoor Garden">Outdoor Garden</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Premium event venue in central Dhaka."
                    rows={4}
                    className="w-full resize-none rounded-lg border border-[#E5E7EB] px-4 py-2.5 outline-none transition-colors focus:border-gray-400"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-900">
                      Address Line
                    </label>
                    <input
                      type="text"
                      name="addressLine"
                      value={formData.addressLine}
                      onChange={handleInputChange}
                      placeholder="123 Main Road"
                      className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2.5 outline-none transition-colors focus:border-gray-400"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-900">
                      Map Location
                    </label>
                    <div
                      onClick={openMap}
                      className="h-[140px] cursor-pointer overflow-hidden rounded-lg border-2 border-dashed border-[#E5E7EB] transition-colors hover:border-gray-400"
                    >
                      <MapPreview
                        selectedLocation={selectedLocation}
                        clearSelectedLocation={clearSelectedLocation}
                      />
                    </div>
                    {selectedLocation ? (
                      <div className="mt-2 text-xs text-gray-500">
                        Location selected from map. Click the preview to update it.
                      </div>
                    ) : (
                      <div className="mt-2 text-xs text-gray-500">
                        Click to select the venue location on the map.
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-900">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Collected from map or enter manually"
                      className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2.5 outline-none transition-colors focus:border-gray-400"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-900">
                      Area
                    </label>
                    <input
                      type="text"
                      name="area"
                      value={formData.area}
                      onChange={handleInputChange}
                      placeholder="Collected from map or enter manually"
                      className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2.5 outline-none transition-colors focus:border-gray-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
              <h2 className="mb-6 text-xl font-bold text-gray-900">Pricing</h2>

              <div className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-900">
                      Base Price
                    </label>
                    <input
                      type="number"
                      name="basePrice"
                      value={formData.basePrice}
                      onChange={handleInputChange}
                      placeholder="5000"
                      className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2.5 outline-none transition-colors focus:border-gray-400"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-900">
                      Currency
                    </label>
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleInputChange}
                      className="w-full appearance-none rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5 outline-none transition-colors focus:border-gray-400"
                    >
                      <option value="BDT">BDT</option>
                      <option value="GBP">GBP</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-900">
                      Discount Type
                    </label>
                    <select
                      name="discountType"
                      value={formData.discountType}
                      onChange={handleInputChange}
                      className="w-full appearance-none rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5 outline-none transition-colors focus:border-gray-400"
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-900">
                      Discount Value
                    </label>
                    <input
                      type="number"
                      name="discountValue"
                      value={formData.discountValue}
                      onChange={handleInputChange}
                      placeholder="10"
                      className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2.5 outline-none transition-colors focus:border-gray-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
              <h2 className="mb-6 text-xl font-bold text-gray-900">Amenities</h2>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {amenities.map((amenity) => (
                  <button
                    key={amenity.id}
                    type="button"
                    onClick={() => toggleAmenity(amenity.id)}
                    className={`rounded-xl border p-4 transition-all ${
                      selectedAmenities.includes(amenity.id)
                        ? "border-[#B74140] bg-[#B74140]/5"
                        : "border-[#E5E7EB]"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="text-gray-600">{amenity.icon}</div>
                      <span className="text-sm font-medium text-gray-700">
                        {amenity.label}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
              <h2 className="mb-6 text-xl font-bold text-gray-900">Capacity</h2>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  Maximum Guests
                </label>
                <input
                  type="number"
                  name="maximumGuests"
                  value={formData.maximumGuests}
                  onChange={handleInputChange}
                  placeholder="300"
                  className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2.5 outline-none transition-colors focus:border-gray-400"
                />
              </div>
            </div>

            <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
              <h2 className="mb-6 text-xl font-bold text-gray-900">Media</h2>

              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900">
                    Venue Images
                  </label>
                  <div className="rounded-xl border-2 border-dashed border-[#E5E7EB] p-8 text-center">
                    <Upload className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                    <p className="mb-1 font-medium text-gray-700">
                      Upload venue images
                    </p>
                    <p className="mb-4 text-sm text-gray-500">
                      Images are sent as multipart form data in the `image`
                      field.
                    </p>
                    <input
                      type="file"
                      id="venue-images-upload"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="venue-images-upload"
                      className="inline-block cursor-pointer rounded-lg bg-[#B74140] px-6 py-2.5 text-white transition-colors hover:bg-[#862c2a]"
                    >
                      Choose Images
                    </label>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    This add-venue request now sends the other venue fields as
                    JSON text and the selected images as files.
                  </p>
                  {selectedImages.length ? (
                    <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
                      {selectedImages.map((image, index) => (
                        <div
                          key={`${image.file.name}-${index}`}
                          className="group relative aspect-video overflow-hidden rounded-lg bg-gray-100"
                        >
                          <img
                            src={image.previewUrl}
                            alt={image.file.name}
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute right-2 top-2 rounded-full bg-[#B74140] p-1 text-white opacity-0 transition-opacity hover:bg-[#862c2a] group-hover:opacity-100"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900">
                    Video URL
                  </label>
                  <input
                    type="text"
                    name="videoUrl"
                    value={formData.videoUrl}
                    onChange={handleInputChange}
                    placeholder="https://www.youtube.com/watch?v=abc123"
                    className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2.5 outline-none transition-colors focus:border-gray-400"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
              <h2 className="mb-6 text-xl font-bold text-gray-900">
                Availability Overrides
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
                      className="rounded p-1 outline-none transition-colors hover:bg-gray-100"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      className="rounded p-1 outline-none transition-colors hover:bg-gray-100"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
              </div>

              <div className="border-t pt-4">
                <p className="mb-3 text-sm font-medium text-gray-900">
                  {selectedDateKey
                    ? `Hourly slots for ${formatDisplayDate(selectedDateKey)}`
                    : "Select a date to configure hourly slots"}
                </p>

                <div className="grid grid-cols-2 gap-2">
                  {slotHours.map((hour) => (
                    <button
                      key={hour}
                      type="button"
                      disabled={!selectedDateKey}
                      onClick={() => handleSlotClick(hour)}
                      className={`rounded-lg border px-3 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${getSlotButtonClassName(
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
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-[#B74140] px-4 py-2.5 font-medium text-[#B74140] transition-colors hover:bg-[#B74140]/5"
                >
                  <Plus className="h-4 w-4" />
                  Save Override Day
                </button>
              </div>

              {availabilityOverrides.length ? (
                <div className="mt-4 space-y-2 border-t pt-4">
                  <p className="text-sm font-medium text-gray-900">
                    Saved Overrides
                  </p>
                  {availabilityOverrides.map((override) => (
                    <div
                      key={override.date}
                      className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {formatDisplayDate(override.date)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {override.slots.length} slot
                          {override.slots.length === 1 ? "" : "s"} selected
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveOverride(override.date)}
                        className="text-sm font-medium text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            {error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            {successMessage ? (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {successMessage}
              </div>
            ) : null}

            <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
              <h2 className="mb-6 text-xl font-bold text-gray-900">
                Publish Settings
              </h2>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`w-full rounded-lg py-3 font-semibold text-white transition-colors outline-none ${
                  isSubmitting
                    ? "cursor-not-allowed bg-[#B74140]/70"
                    : "bg-[#B74140] hover:bg-[#802423]"
                }`}
              >
                {isSubmitting ? "Publishing..." : "Publish Venue"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showMap ? (
        <MapContainer
          onClose={() => setShowMap(false)}
          onLocationSelect={handleLocationSelect}
          initialPosition={
            selectedLocation
              ? {
                  lat: selectedLocation.lat,
                  lng: selectedLocation.lng,
                }
              : undefined
          }
          initialAddress={selectedLocation?.address}
          initialCity={selectedLocation?.city}
          initialArea={selectedLocation?.area}
        />
      ) : null}
    </div>
  );
}
