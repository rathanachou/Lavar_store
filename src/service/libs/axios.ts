import axios from "axios";
import { getAccessToken, removeAccessToken } from "../../utils/TokenStorage";
import { toast } from "sonner";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string,
  headers: {
    "Content-Type": "application/json",
  },
});

// Track whether we've already warned about a possible session expiry
// in this page session — prevents 6 toasts when 6 queries 401 at once.
let sessionExpiryWarned = false;

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      // Clean up the stale token so no subsequent request sends it.
      removeAccessToken();

      // Show a single non-blocking warning so the cashier knows to re-login,
      // but do NOT hard-redirect — background refetches from React Query
      // should not kick the user off the POS page mid-transaction.
      if (!sessionExpiryWarned) {
        sessionExpiryWarned = true;
        toast.warning("Session may have expired — please save your work and log in again.", {
          duration: 6000,
        });
      }
    }

    if (status === 403) console.error("❌ Forbidden: No permission");
    if (status === 404) console.error("❌ Not Found");
    if (status === 500) console.error("❌ Server Error");

    return Promise.reject(error);
  }
);

export default api;