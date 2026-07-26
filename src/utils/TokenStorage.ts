const ACCESS_TOKEN_KEY = "token";

export const setAccessToken = (token: string): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
  console.log("[TokenStorage] setAccessToken:", token.slice(0, 30) + "...");
  console.log("[TokenStorage] verify saved:", localStorage.getItem(ACCESS_TOKEN_KEY)?.slice(0, 30) + "...");
};

export const getAccessToken = (): string | null => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  console.log("[TokenStorage] getAccessToken:", token ? token.slice(0, 30) + "..." : "NULL");
  return token;
};

export const removeAccessToken = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  console.log("[TokenStorage] removeAccessToken called");
};

export const isAuthenticated = (): boolean => {
  const result = !!localStorage.getItem(ACCESS_TOKEN_KEY);
  console.log("[TokenStorage] isAuthenticated:", result);
  return result;
};