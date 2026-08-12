import api from "./libs/axios";
import type { IDailySalesReport } from "@/types/report";

// Paths are relative to baseURL, which already includes /api/v1

/**
 * Fetch daily sales report data (JSON summary + transactions)
 */
export const getDailySalesReport = async (
  date: string
): Promise<IDailySalesReport> => {
  return api.get("/reports/daily-sales", {
    params: { date },
  });
};

/**
 * Trigger a PDF download of the daily sales report.
 * Uses the axios instance (auto-attaches JWT via interceptor),
 * then creates a blob URL and programmatically triggers a download.
 */
export const downloadDailySalesPdf = async (date: string): Promise<void> => {
  const response = await api.get(
    "/reports/daily-sales/pdf",
    {
      params: { date },
      responseType: "blob",
    }
  );

  // axios response interceptor unwraps .data already,
  // but with responseType "blob", the blob IS the data
  const blob = response as unknown as Blob;
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `daily-sales-report-${date}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};
