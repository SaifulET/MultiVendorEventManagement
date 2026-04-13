import { api } from "@/lib/api";

export interface AuthMeResponse {
  success: boolean;
  data: {
    userId: string;
    email: string;
    fullName: string;
    role: string;
    profileImage?: { url: string };
    avatar?: string;
    imageUrl?: string;
    media?: {
      profileImage?: string;
      avatar?: string;
      imageUrl?: string;
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
  profileImage: string;
  serviceCategories: string[];
  onboarding: Record<string, unknown>;
}

export const emptyProfileSettingsData: ProfileSettingsData = {
  userId: "",
  email: "",
  fullName: "",
  role: "",
  profileImage: "",
  serviceCategories: [],
  onboarding: {},
};

export const formatRole = (role: string) =>
  role
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export const fetchAuthMeProfile = async (): Promise<ProfileSettingsData> => {
  const response = await api.get<AuthMeResponse>("/api/v1/auth/me");
  const user = response.data.data;
console.log("Fetched auth me profile:", user);
  return {
    userId: user.userId ?? "",
    email: user.email ?? "",
    fullName: user.fullName ?? "",
    role: user.role ?? "",
    profileImage:
      user.profileImage?.url ??
      user.avatar ??
      user.imageUrl ??
      user.media?.profileImage ??
      user.media?.avatar ??
      user.media?.imageUrl ??
      "",
    serviceCategories: Array.isArray(user.serviceCategories)
      ? user.serviceCategories
      : [],
    onboarding: user.onboarding ?? {},
  };
};
