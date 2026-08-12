import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getMonthlySalesReport,
  downloadMonthlySalesPdf,
} from "@/service/report.service";
import { toast } from "sonner";

/**
 * Fetch monthly sales report data for a given year/month.
 */
export const useMonthlySalesReport = (year: number, month: number) => {
  return useQuery({
    queryKey: ["monthly-sales-report", year, month],
    queryFn: () => getMonthlySalesReport(year, month),
    enabled: year > 0 && month > 0,
    staleTime: 60_000,
  });
};

/**
 * Download monthly sales report as PDF.
 */
export const useDownloadMonthlySalesPdf = () => {
  return useMutation({
    mutationFn: ({ year, month }: { year: number; month: number }) =>
      downloadMonthlySalesPdf(year, month),
    onSuccess: () => {
      toast.success("PDF report downloaded successfully", {
        description: "The monthly sales report has been saved to your downloads.",
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to download PDF report", {
        description: error.message,
      });
    },
  });
};
