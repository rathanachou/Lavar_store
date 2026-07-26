import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getDailySalesReport,
  downloadDailySalesPdf,
} from "@/service/report.service";
import { toast } from "sonner";

/**
 * Fetch daily sales report data for a given date.
 * Returns the JSON report (summary + transactions).
 */
export const useDailySalesReport = (date: string) => {
  return useQuery({
    queryKey: ["daily-sales-report", date],
    queryFn: () => getDailySalesReport(date),
    enabled: !!date,
    staleTime: 30_000, // 30s — user might change date frequently
  });
};

/**
 * Download daily sales report as PDF.
 * Shows toast feedback on success and error.
 */
export const useDownloadDailySalesPdf = () => {
  return useMutation({
    mutationFn: (date: string) => downloadDailySalesPdf(date),
    onSuccess: () => {
      toast.success("PDF report downloaded successfully", {
        description: "The daily sales report has been saved to your downloads.",
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to download PDF report", {
        description: error.message,
      });
    },
  });
};
