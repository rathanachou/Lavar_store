import api from "./libs/axios";
import type { IDailySalesReport } from "@/types/report";
import type { IMonthlySalesReport } from "@/types/report";

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
 */
export const downloadDailySalesPdf = async (date: string): Promise<void> => {
  const response = await api.get(
    "/reports/daily-sales/pdf",
    { params: { date }, responseType: "blob" }
  );
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

/**
 * Fetch monthly sales report data (JSON summary + daily subtotals)
 */
export const getMonthlySalesReport = async (
  year: number,
  month: number
): Promise<IMonthlySalesReport> => {
  return api.get("/reports/monthly-sales", {
    params: { year, month },
  });
};

/**
 * Trigger a PDF download of the monthly sales report.
 */
export const downloadMonthlySalesPdf = async (
  year: number,
  month: number
): Promise<void> => {
  const response = await api.get(
    "/reports/monthly-sales/pdf",
    { params: { year, month }, responseType: "blob" }
  );
  const blob = response as unknown as Blob;
  const dateStr = `${year}-${String(month).padStart(2, "0")}`;
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `monthly-sales-report-${dateStr}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};
