import { api } from "@/lib/api";
import { getStoredToken } from "@/lib/auth-storage";

export const PROFILE_IMAGE_UPDATED_EVENT = "evenit:profile-image-updated";

interface UploadProfileImageResponse {
  success?: boolean;
  message?: string;
  data?: unknown;
}

const tryExtractImageUrl = (value: unknown): string | null => {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    const normalized = value.trim();
    return normalized ? normalized : null;
  }

  if (typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const directKeys = [
    "imageUrl",
    "coverImage",
    "coverPhoto",
    "profileImage",
    "avatar",
    "url",
    "secure_url",
    "location",
  ];

  for (const key of directKeys) {
    const extracted = tryExtractImageUrl(record[key]);
    if (extracted) {
      return extracted;
    }
  }

  const nestedKeys = ["data", "image", "file", "media", "user", "result"];

  for (const key of nestedKeys) {
    const extracted = tryExtractImageUrl(record[key]);
    if (extracted) {
      return extracted;
    }
  }

  return null;
};

export const uploadProfileImage = async (imageFile: File) => {
  const formData = new FormData();
  formData.append("image", imageFile);
  const token = getStoredToken();
  const response = await api.post<UploadProfileImageResponse>(
    "/api/v1/uploads/profile-image",
    formData,
    token
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      : undefined
  );

  if (response.data?.success === false) {
    throw new Error(response.data.message || "Failed to upload profile image.");
  }

  const imageUrl = tryExtractImageUrl(response.data?.data);

  if (!imageUrl) {
    throw new Error("Profile image uploaded, but no image URL was returned.");
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(PROFILE_IMAGE_UPDATED_EVENT, {
        detail: { imageUrl },
      })
    );
  }

  return imageUrl;
};

export const uploadCoverImage = async (imageFile: File) => {
  const formData = new FormData();
  formData.append("image", imageFile);
  const token = getStoredToken();
  const response = await api.post<UploadProfileImageResponse>(
    "/api/v1/uploads/cover-image",
    formData,
    token
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      : undefined
  );

  if (response.data?.success === false) {
    throw new Error(response.data.message || "Failed to upload cover image.");
  }

  const imageUrl =
    tryExtractImageUrl(response.data?.data) ||
    tryExtractImageUrl(response.data);

  if (!imageUrl) {
    throw new Error("Cover image uploaded, but no image URL was returned.");
  }

  return imageUrl;
};
