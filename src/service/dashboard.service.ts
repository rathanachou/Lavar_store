import api from "./libs/axios";
import type { IDailySales } from "../types/dashboard";

// Paths are relative to baseURL, which already includes /api/v1

export const getDashboardSummary = async () => {
  return await api.get("/dashboard/summary");
};

export const getTopProducts = async (limit: number = 5) => {
  return await api.get("/dashboard/top-products", {
    params: { limit },
  });
};

export const getMonthlySales = async () => {
  return await api.get("/dashboard/sales/monthly");
};

export const getSalesByCategory = async () => {
  return await api.get("/dashboard/sales/by-category");
};

export const getDailySales = async (date?: string): Promise<IDailySales> => {
  return await api.get("/dashboard/sales/daily", {
    params: { date },
  });
};

export const getSalesByPeriod = async (period: string) => {
  return await api.get("/dashboard/sales/by-period", {
    params: { period },
  });
};