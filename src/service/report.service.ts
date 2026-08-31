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
 * Fetch monthly sales report data (JSON summary + daily subtotals).
 *
 * Mode A — single month: pass year and month.
 *   getMonthlySalesReport(2026, 5)
 *
 * Mode B — date range: pass dateFrom and dateTo as ISO date strings.
 *   getMonthlySalesReport(undefined, undefined, "2026-01-01", "2026-05-31")
 */
export const getMonthlySalesReport = async ({
  year,
  month,
  dateFrom,
  dateTo,
}: {
  year?: number;
  month?: number;
  dateFrom?: string;
  dateTo?: string;
}): Promise<IMonthlySalesReport> => {
  const params: Record<string, string | number> = {};
  if (dateFrom && dateTo) {
    params.dateFrom = dateFrom;
    params.dateTo   = dateTo;
  } else if (year && month) {
    params.year  = year;
    params.month = month;
  }
  return api.get("/reports/monthly-sales", { params });
};

/**
 * Trigger a PDF download of the monthly sales report.
 *
 * Pass either year+month (single month) or dateFrom+dateTo (range).
 */
export const downloadMonthlySalesPdf = async ({
  year,
  month,
  dateFrom,
  dateTo,
}: {
  year?: number;
  month?: number;
  dateFrom?: string;
  dateTo?: string;
}): Promise<void> => {
  const params: Record<string, string | number> = {};
  let filename: string;
  if (dateFrom && dateTo) {
    params.dateFrom = dateFrom;
    params.dateTo   = dateTo;
    filename = `monthly-sales-report-${dateFrom}-to-${dateTo}.pdf`;
  } else if (year && month) {
    params.year  = year;
    params.month = month;
    const ds = `${year}-${String(month).padStart(2, "0")}`;
    filename = `monthly-sales-report-${ds}.pdf`;
  } else {
    throw new Error("Provide year+month or dateFrom+dateTo");
  }

  const response = await api.get(
    "/reports/monthly-sales/pdf",
    { params, responseType: "blob" }
  );
  const blob = response as unknown as Blob;
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};
