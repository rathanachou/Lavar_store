import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getMonthlySalesReport,
  downloadMonthlySalesPdf,
} from "@/service/report.service";
import { toast } from "sonner";

/**
 * Fetch monthly sales report data.
 *
 * Mode A — single month: pass year and month.
 * Mode B — date range: pass dateFrom and dateTo (ISO strings).
 */
export const useMonthlySalesReport = ({
  year,
  month,
  dateFrom,
  dateTo,
}: {
  year?: number;
  month?: number;
  dateFrom?: string;
  dateTo?: string;
}) => {
  const hasRange = !!(dateFrom && dateTo);
  const hasMonth = !!(year && month);
  const enabled = hasRange || hasMonth;

  return useQuery({
    queryKey: hasRange
      ? ["monthly-sales-report", "range", dateFrom, dateTo]
      : ["monthly-sales-report", year, month],
    queryFn: () => getMonthlySalesReport({ year, month, dateFrom, dateTo }),
    enabled,
    staleTime: 60_000,
  });
};

/**
 * Download monthly sales report as PDF.
 *
 * Pass either year+month (single month) or dateFrom+dateTo (range).
 */
export const useDownloadMonthlySalesPdf = () => {
  return useMutation({
    mutationFn: (args: {
      year?: number;
      month?: number;
      dateFrom?: string;
      dateTo?: string;
    }) => downloadMonthlySalesPdf(args),
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
