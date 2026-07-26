import { getAccessToken } from "./TokenStorage";

// ─── Decode JWT (without library) ────────────────────────
const decodeToken = (token: string) => {
  try {
    const base64Payload = token.split(".")[1];
    const payload = atob(base64Payload);
    return JSON.parse(payload);
  } catch {
    return null;
  }
};

// ─── Get current user info ────────────────────────────────
export const getCurrentUser = () => {
  const token = getAccessToken();
  if (!token) return null;
  return decodeToken(token);
};

// ─── Get role ─────────────────────────────────────────────
export const getRole = (): "admin" | "cashier" | null => {
  const user = getCurrentUser();
  return user?.role ?? user?.Role ?? user?.user_role ?? null;
};

// ─── Role checks ─────────────────────────────────────────
export const isAdmin = () => getRole() === "admin";
export const isCashier = () => getRole() === "cashier";