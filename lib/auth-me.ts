import { api } from "@/lib/api";

export interface AuthMeResponse {
  success: boolean;
  data: {
    userId: string;
    email: string;
    fullName: string;
    role: string;
    serviceCategories?: string[];
    onboarding?: Record<string, unknown>;
  };
}

export interface ProfileSettingsData {
  userId: string;
  email: string;
  fullName: string;
  role: string;
  serviceCategories: string[];
  onboarding: Record<string, unknown>;
}

export const emptyProfileSettingsData: ProfileSettingsData = {
  userId: "",
  email: "",
  fullName: "",
  role: "",
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

  return {
    userId: user.userId ?? "",
    email: user.email ?? "",
    fullName: user.fullName ?? "",
    role: user.role ?? "",
    serviceCategories: Array.isArray(user.serviceCategories)
      ? user.serviceCategories
      : [],
    onboarding: user.onboarding ?? {},
  };
};
