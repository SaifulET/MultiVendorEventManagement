import { api } from "@/lib/api";

export const PROFILE_DETAILS_UPDATED_EVENT = "evenit:profile-details-updated";

export interface AuthMeResponse {
  success: boolean;
  data: {
    userId: string;
    email: string;
    fullName: string;
    role: string;
    coverImage?: string | { url?: string | null } | null;
    coverPhoto?: string | null;
    bannerImage?: string | null;
    profileImage?: string | { url?: string | null } | null;
    avatar?: string | null;
    imageUrl?: string | null;
    phoneNumber?: string | null;
    phone?: string | null;
    mobileNumber?: string | null;
    media?: {
      coverImage?: string | { url?: string | null } | null;
      coverPhoto?: string | null;
      bannerImage?: string | null;
      profileImage?: string | { url?: string | null } | null;
      avatar?: string | null;
      imageUrl?: string | null;
    };
    serviceCategories?: string[];
    onboarding?: Record<string, unknown>;
  };
}

export interface ProfileSettingsData {
  userId: string;
  email: string;
  fullName: string;
  role: string;
  coverImage: string;
  profileImage: string;
  phone: string;
  serviceCategories: string[];
  onboarding: Record<string, unknown>;
}

interface UpdateBasicProfilePayload {
  fullName: string;
  phoneNumber: string;
}

export const emptyProfileSettingsData: ProfileSettingsData = {
  userId: "",
  email: "",
  fullName: "",
  role: "",
  coverImage: "",
  profileImage: "",
  phone: "",
  serviceCategories: [],
  onboarding: {},
};

export const formatRole = (role: string) =>
  role
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const extractProfileImageUrl = (value: unknown): string => {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value !== "object") {
    return "";
  }

  const record = value as Record<string, unknown>;
  const candidateKeys = [
    "url",
    "secure_url",
    "imageUrl",
    "coverImage",
    "coverPhoto",
    "bannerImage",
    "profileImage",
    "avatar",
  ];

  for (const key of candidateKeys) {
    const nestedValue = record[key];
    const extracted = extractProfileImageUrl(nestedValue);

    if (extracted) {
      return extracted;
    }
  }

  return "";
};

const extractPhoneNumber = (value: unknown): string => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
};

export const fetchAuthMeProfile = async (): Promise<ProfileSettingsData> => {
  const response = await api.get<AuthMeResponse>("/api/v1/auth/me");
  const user = response.data.data;

  return {
    userId: user.userId ?? "",
    email: user.email ?? "",
    fullName: user.fullName ?? "",
    role: user.role ?? "",
    coverImage:
      extractProfileImageUrl(user.coverImage) ||
      extractProfileImageUrl(user.coverPhoto) ||
      extractProfileImageUrl(user.bannerImage) ||
      extractProfileImageUrl(user.media?.coverImage) ||
      extractProfileImageUrl(user.media?.coverPhoto) ||
      extractProfileImageUrl(user.media?.bannerImage) ||
      "",
    profileImage:
      extractProfileImageUrl(user.profileImage) ||
      extractProfileImageUrl(user.avatar) ||
      extractProfileImageUrl(user.imageUrl) ||
      extractProfileImageUrl(user.media?.profileImage) ||
      extractProfileImageUrl(user.media?.avatar) ||
      extractProfileImageUrl(user.media?.imageUrl) ||
      "",
    phone:
      extractPhoneNumber(user.phoneNumber) ||
      extractPhoneNumber(user.phone) ||
      extractPhoneNumber(user.mobileNumber) ||
      "",
    serviceCategories: Array.isArray(user.serviceCategories)
      ? user.serviceCategories
      : [],
    onboarding: user.onboarding ?? {},
  };
};

export const updateVenueProviderProfile = async ({
  fullName,
  phoneNumber,
}: UpdateBasicProfilePayload) => {
  await api.patch("/api/v1/auth/profile/venue-provider", {
    fullName: fullName.trim(),
    phoneNumber: phoneNumber.trim(),
  });
};

export const updateServiceProviderProfile = async ({
  fullName,
  phoneNumber,
}: UpdateBasicProfilePayload) => {
  const response = await api.patch("/api/v1/auth/profile/service-provider", {
    fullName: fullName.trim(),
    phoneNumber: phoneNumber.trim(),
  });

  return response.data;
};

export const updateEventPlannerProfile = async ({
  fullName,
  phoneNumber,
}: UpdateBasicProfilePayload) => {
  const response = await api.patch("/api/v1/auth/profile/event-planner", {
    fullName: fullName.trim(),
    phoneNumber: phoneNumber.trim(),
  });

  return response.data;
};

export const updateCustomerProfile = async ({
  fullName,
  phoneNumber,
}: UpdateBasicProfilePayload) => {
  const response = await api.patch("/api/v1/auth/profile/customer", {
    fullName: fullName.trim(),
    phoneNumber: phoneNumber.trim(),
  });

  return response.data;
};
