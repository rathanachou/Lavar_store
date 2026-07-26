import { useState, useEffect } from "react";
import {
  getDashboardSummary,
  getSalesByPeriod,
  getDailySales,
  getSalesByCategory,
} from "../service/dashboard.service";
import type {
  IDashboardSummary,
  IMonthlySale,
  ICategorySale,
  IDailySales,
} from "../types/dashboard";
import { toast } from "sonner";

export const useDashboard = (period: "Today" | "Week" | "Month" | "Year" = "Week") => {
  const [summary, setSummary]           = useState<IDashboardSummary | null>(null);
  const [periodSales, setPeriodSales]   = useState<IMonthlySale[]>([]);
  const [dailySales, setDailySales]     = useState<IDailySales | null>(null);
  const [categoryData, setCategoryData] = useState<ICategorySale[]>([]);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [refreshKey, setRefreshKey]     = useState(0);

  const refetch = () => setRefreshKey(k => k + 1);

  // ── Fetch all dashboard data ────────────────────────────────
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
       const [sum, periodData, daily, category] = await Promise.all([
          getDashboardSummary(),
          getSalesByPeriod(period),
          getDailySales(),
          getSalesByCategory(),
        ]);
        setSummary(sum.data);
-       setPeriodSales(periodData.data?.data ?? []);
+       setPeriodSales(periodData.data ?? []);
        setDailySales(daily);
        setCategoryData(category.data ?? []);
      } catch (err) {
        console.error("Dashboard error:", err);
        setError("data error");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [refreshKey, period]);

  useEffect(() => {
    let bc: BroadcastChannel;
    try {
      bc = new BroadcastChannel("pos_payment_confirmed");

      bc.onmessage = (event) => {
        if (event.data?.type !== "ORDER_CONFIRMED") return;

      
        refetch();

        // Show alert so the admin sees the new sale instantly
        toast.success("🛒 New order confirmed!", {
          description: "A POS payment was just completed. Stats are refreshing…",
          duration: 6000,
        });
      };
    } catch {
     
    }

    return () => {
      try { bc?.close(); } catch { /* ignore */ }
    };

  }, []); // mount once — refetch is stable (closure over setRefreshKey)

  return {
    // Raw API data
    summary,        
    periodSales,    
    dailySales,     
    categoryData,   

    // Convenience shortcuts from summary
    topProducts:   summary?.topProducts   ?? [],
    lowStock:      summary?.lowStock      ?? [],
    totalProducts: summary?.totalProducts ?? 0,
    totalCustomers: summary?.totalCustomers ?? 0,

    loading,
    error,
    refetch,
  };
};