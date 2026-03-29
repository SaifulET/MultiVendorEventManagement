const AUTH_TOKEN_STORAGE_KEY = "evenit_auth_token";

const canUseStorage = () => typeof window !== "undefined";

export const getStoredToken = () => {
  if (!canUseStorage()) {
    return null;
  }

  return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
};

export const setStoredToken = (token: string) => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
};

export const clearStoredToken = () => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
};

export { AUTH_TOKEN_STORAGE_KEY };
