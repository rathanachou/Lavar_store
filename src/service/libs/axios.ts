import axios from "axios";
import { getAccessToken, removeAccessToken } from "../../utils/TokenStorage";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string,
  headers: {
    "Content-Type": "application/json",
  },
});

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
      removeAccessToken();
      window.location.href = "/login";
    }

    if (status === 403) console.error("❌ Forbidden: No permission");
    if (status === 404) console.error("❌ Not Found");
    if (status === 500) console.error("❌ Server Error");

    return Promise.reject(error);
  }
);

export default api;