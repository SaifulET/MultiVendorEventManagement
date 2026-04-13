export const formatRoleLabel = (role?: string | null) => {
  const normalized = role?.trim();

  if (!normalized) {
    return "Customer";
  }

  return normalized
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

export const getFirstName = (fullName?: string | null) => {
  const normalized = fullName?.trim();

  if (!normalized) {
    return "there";
  }

  return normalized.split(/\s+/)[0];
};
