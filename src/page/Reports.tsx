import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  BarChart, Bar,
  XAxis, YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  getMonthlySales,
  getTopProducts,
  getDailySales,
} from "@/service/dashboard.service";
import {
  useDailySalesReport,
  useDownloadDailySalesPdf,
} from "@/hooks/useDailySalesReport";
import {
  useMonthlySalesReport,
  useDownloadMonthlySalesPdf,
} from "@/hooks/useMonthlySalesReport";
import type { IDailySales } from "@/types/dashboard";
import dayjs from "dayjs";
import {
  TrendingUp,
  ShoppingBag,
  Receipt,
  DollarSign,
  Tag,
  CheckCircle,
  CalendarDays,
  Trophy,
  ChevronDown,
  ChevronUp,
  Loader2,
  FileDown,
  CreditCard,
  Wallet,
  Smartphone,
} from "lucide-react";
import { isCashier } from "@/utils/auth";
import { useAuth } from "@/hooks/AuthContext";

type Tab = "daily" | "monthly" | "top-products";

function getTabFromPath(pathname: string): Tab {
  if (pathname.includes("/daily"))   return "daily";
  if (pathname.includes("/monthly")) return "monthly";
  return "top-products";
}

export default function Reports() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { role }  = useAuth();
  const activeTab = getTabFromPath(location.pathname);

  if (role !== "admin" && role !== "cashier") {
    navigate("/admin/pos", { replace: true });
    return null;
  }

  const [monthlySales,  setMonthlySales]  = useState<any[]>([]);
  const [topProducts,   setTopProducts]   = useState<any[]>([]);
  const [dailySales,    setDailySales]    = useState<IDailySales | null>(null);
  const [selectedDate,  setSelectedDate]  = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [loading,       setLoading]       = useState(false);
  const [dailyLoading,  setDailyLoading]  = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  // Date range picker for monthly report — defaults to current month
  const now = new Date();
  const [reportDateFrom, setReportDateFrom] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`
  );
  const [reportDateTo, setReportDateTo] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()).padStart(2, "0")}`
  );

  const cashierView = isCashier();

  // ── New Daily Sales Report (TanStack Query) ─────────────
  const effectiveDate = cashierView
    ? new Date().toISOString().split("T")[0]
    : selectedDate;

  const { data: reportData, isLoading: reportLoading } = useDailySalesReport(
    activeTab === "daily" ? effectiveDate : ""
  );
  const { mutate: downloadPdf, isPending: pdfDownloading } =
    useDownloadDailySalesPdf();

  const handleDailyPdfDownload = () => downloadPdf(effectiveDate);

  const { data: monthlyReport, isLoading: monthlyLoading } =
    useMonthlySalesReport(
      activeTab === "monthly"
        ? { dateFrom: reportDateFrom, dateTo: reportDateTo }
        : { dateFrom: undefined, dateTo: undefined }
    );
  const { mutate: downloadMonthlyPdf, isPending: monthlyPdfDownloading } =
    useDownloadMonthlySalesPdf();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const requests = cashierView
          ? [getTopProducts(10)]
          : [getMonthlySales(), getTopProducts(10)];
        const results = await Promise.all(requests);
        if (!cashierView) {
          setMonthlySales((results[0] as any)?.data || []);
          setTopProducts((results[1] as any)?.data || []);
        } else {
          setTopProducts((results[0] as any)?.data || []);
        }
      } catch (error) {
        console.error("Reports error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [cashierView]);

  useEffect(() => {
    const fetchDaily = async () => {
      setDailyLoading(true);
      try {
        const res = await getDailySales(selectedDate);
        setDailySales(res as any);
      } catch (error) {
        console.error("Daily sales error:", error);
        setDailySales(null);
      } finally {
        setDailyLoading(false);
      }
    };
    fetchDaily();
  }, [selectedDate]);

  const TAB_ROUTES: Record<Tab, string> = {
    "daily":        "/admin/reports/daily",
    "monthly":      "/admin/reports/monthly",
    "top-products": "/admin/reports",
  };

  const ADMIN_TABS: { key: Tab; label: string }[] = [
    { key: "daily",        label: "Daily Report"  },
    { key: "monthly",      label: "Monthly Sales" },
    { key: "top-products", label: "Top Products"  },
  ];
  const CASHIER_TABS: { key: Tab; label: string }[] = [
    { key: "daily",        label: "Daily Report"  },
    { key: "top-products", label: "Top Products"  },
  ];
  const visibleTabs = cashierView ? CASHIER_TABS : ADMIN_TABS;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <p className="text-sm">Loading Reports...</p>
        </div>
      </div>
    );
  }

  const summary = dailySales?.summary;

  return (
    <div className="p-6 space-y-6">

      {/* Page Title */}
      <div className="flex items-center gap-2">
        <TrendingUp className="h-6 w-6 text-indigo-600" />
        <h1 className="text-2xl font-bold">Sales Reports</h1>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-2 border-b border-gray-200">
        {visibleTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => navigate(TAB_ROUTES[tab.key])}
            className="px-4 py-2 text-sm font-medium transition-colors"
            style={{
              borderBottom: activeTab === tab.key
                ? "2px solid #6366f1"
                : "2px solid transparent",
              color: activeTab === tab.key ? "#6366f1" : "#6b7280",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── DAILY TAB ── */}
      {activeTab === "daily" && (
        <div className="bg-white rounded-xl shadow p-6 space-y-4">
          {/* Date picker + PDF download */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-indigo-500" />
              <h2 className="text-lg font-semibold">Daily Report</h2>
              {cashierView && (
                <span className="text-xs text-gray-400 font-normal">
                  — Today, {dayjs(effectiveDate).format("MMMM D, YYYY")}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!cashierView && (
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              )}
              <button
                onClick={handleDailyPdfDownload}
                disabled={pdfDownloading}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
              >
                <FileDown className="h-4 w-4" />
                {pdfDownloading ? "Downloading..." : "Download PDF"}
              </button>
            </div>
          </div>

          {dailyLoading || reportLoading ? (
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading daily data...</span>
            </div>
          ) : !dailySales ? (
            <p className="text-gray-400 text-sm">No data for this date.</p>
          ) : (
            <>
              {/* Legacy summary cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <SummaryCard label="Total Orders"  value={String(summary?.totalOrders ?? 0)}                          icon={<Receipt     className="h-5 w-5" />} color="bg-indigo-50 text-indigo-700" />
                <SummaryCard label="Total Sales"   value={`$${Number(summary?.totalSales    ?? 0).toFixed(2)}`}       icon={<DollarSign  className="h-5 w-5" />} color="bg-green-50 text-green-700"   />
                <SummaryCard label="Discount"      value={`$${Number(summary?.totalDiscount ?? 0).toFixed(2)}`}       icon={<Tag         className="h-5 w-5" />} color="bg-yellow-50 text-yellow-700" />
                <SummaryCard label="Net Sales"     value={`$${Number(summary?.netSales      ?? 0).toFixed(2)}`}       icon={<CheckCircle className="h-5 w-5" />} color="bg-blue-50 text-blue-700"     />
              </div>

              {/* Payment method breakdown */}
              {reportData?.summary?.paymentMethodBreakdown && (
                <div className="border border-gray-100 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-indigo-500" />
                    Payment Method Breakdown
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {Object.entries(reportData.summary.paymentMethodBreakdown).map(
                      ([method, amount]) => {
                        const labels: Record<string, string> = {
                          CASH: "Cash",
                          ABA_PAYWAY: "ABA PayWay",
                          KHQR: "KHQR",
                          OTHER: "Other",
                        };
                        const icons: Record<string, ReactNode> = {
                          CASH: <Wallet className="h-5 w-5" />,
                          ABA_PAYWAY: <Smartphone className="h-5 w-5" />,
                          KHQR: <Smartphone className="h-5 w-5" />,
                        };
                        const colors: Record<string, string> = {
                          CASH: "bg-emerald-50 text-emerald-700",
                          ABA_PAYWAY: "bg-blue-50 text-blue-700",
                          KHQR: "bg-amber-50 text-amber-700",
                          OTHER: "bg-gray-50 text-gray-700",
                        };
                        return (
                          <div
                            key={method}
                            className={`rounded-lg p-3 ${colors[method] || "bg-gray-50 text-gray-700"}`}
                          >
                            <div className="flex items-center gap-1.5 mb-1">
                              {icons[method] || <DollarSign className="h-4 w-4" />}
                              <span className="text-xs font-medium">
                                {labels[method] || method}
                              </span>
                            </div>
                            <p className="text-base font-bold">
                              ${Number(amount).toFixed(2)}
                            </p>
                          </div>
                        );
                      }
                    )}

                    {/* Riel (៛) — total KHR collected that day, with USD equivalent */}
                    {Number(reportData.summary.rielKhr ?? 0) > 0 && (
                      <div className="rounded-lg p-3 bg-teal-50 text-teal-700">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-xs font-medium">Riel (៛)</span>
                        </div>
                        <p className="text-base font-bold">
                          ៛{Number(reportData.summary.rielKhr).toLocaleString("en-US")}
                        </p>
                        <p className="text-xs mt-0.5 text-teal-600">
                          ≈ $
                          {(Number(reportData.summary.rielKhr) / Number(reportData.summary.usdToKhrRate || 4100)).toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Transactions table — mirrors the PDF layout */}
              {(reportData?.transactions?.length ?? 0) === 0 ? (
                <p className="text-gray-400 text-sm">No orders found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-indigo-800 text-white text-left">
                        {["#", "Order No.", "Items", "Amount", "Discount", "Method"].map((h) => (
                          <th key={h} className="px-4 py-2 font-medium text-xs uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(reportData?.transactions ?? []).map((tx: any, idx: number) => {
                        const methodColors: Record<string, string> = {
                          CASH: "text-emerald-700 bg-emerald-50",
                          ABA_PAYWAY: "text-blue-700 bg-blue-50",
                          KHQR: "text-amber-700 bg-amber-50",
                          OTHER: "text-gray-700 bg-gray-50",
                        };
                        const methodLabel = tx.paymentMethod === "ABA_PAYWAY"
                          ? "ABA PayWay"
                          : tx.paymentMethod?.charAt(0) + tx.paymentMethod?.slice(1).toLowerCase();

                        return (
                          <tr key={tx.id} className={`border-t border-gray-100 ${idx % 2 === 0 ? "bg-gray-50/50" : "bg-white"} hover:bg-gray-50 transition-colors`}>
                            <td className="px-4 py-2 text-gray-400 text-xs">{idx + 1}</td>
                            <td className="px-4 py-2 font-medium text-gray-700 text-xs">{tx.orderNumber}</td>
                            <td className="px-4 py-2 text-gray-600 text-xs text-center">{tx.itemsCount}</td>
                            <td className="px-4 py-2 text-green-600 font-semibold text-xs">${Number(tx.total).toFixed(2)}</td>
                            <td className="px-4 py-2 text-yellow-600 text-xs">${Number(tx.discount).toFixed(2)}</td>
                            <td className="px-4 py-2">
                              <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${methodColors[tx.paymentMethod] || "text-gray-700 bg-gray-50"}`}>
                                {methodLabel || tx.paymentMethod}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── MONTHLY TAB ── */}
      {activeTab === "monthly" && (
        <div className="bg-white rounded-xl shadow p-6 space-y-4">
          {/* Header + controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-indigo-500" />
              <h2 className="text-lg font-semibold">Monthly Sales</h2>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={reportDateFrom}
                onChange={(e) => setReportDateFrom(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <span className="text-gray-400 text-sm">to</span>
              <input
                type="date"
                value={reportDateTo}
                onChange={(e) => setReportDateTo(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <button
                onClick={() => downloadMonthlyPdf({ dateFrom: reportDateFrom, dateTo: reportDateTo })}
                disabled={monthlyPdfDownloading}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
              >
                <FileDown className="h-4 w-4" />
                {monthlyPdfDownloading ? "Downloading..." : "Download PDF"}
              </button>
            </div>
          </div>

          {monthlyLoading ? (
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading monthly data...</span>
            </div>
          ) : !monthlyReport ? (
            <p className="text-gray-400 text-sm">No data for this month.</p>
          ) : (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <SummaryCard label="Total Orders"  value={String(monthlyReport.summary.totalTransactions ?? 0)}                          icon={<Receipt     className="h-5 w-5" />} color="bg-indigo-50 text-indigo-700" />
                <SummaryCard label="Total Sales"   value={`$${Number(monthlyReport.summary.netSales    ?? 0).toFixed(2)}`}       icon={<DollarSign  className="h-5 w-5" />} color="bg-green-50 text-green-700"   />
                <SummaryCard label="Discount"      value={`$${Number(monthlyReport.summary.totalDiscount ?? 0).toFixed(2)}`}       icon={<Tag         className="h-5 w-5" />} color="bg-yellow-50 text-yellow-700" />
                <SummaryCard label="Net Sales"     value={`$${Number(monthlyReport.summary.netSales      ?? 0).toFixed(2)}`}       icon={<CheckCircle className="h-5 w-5" />} color="bg-blue-50 text-blue-700"     />
              </div>

              {/* Payment method breakdown */}
              {monthlyReport.summary.paymentMethodBreakdown && (
                <div className="border border-gray-100 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-indigo-500" />
                    Payment Method Breakdown
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {Object.entries(monthlyReport.summary.paymentMethodBreakdown).map(
                      ([method, amount]) => {
                        const labels: Record<string, string> = {
                          CASH: "Cash", ABA_PAYWAY: "ABA PayWay", KHQR: "KHQR", OTHER: "Other",
                        };
                        const colors: Record<string, string> = {
                          CASH: "bg-emerald-50 text-emerald-700",
                          ABA_PAYWAY: "bg-blue-50 text-blue-700",
                          KHQR: "bg-amber-50 text-amber-700",
                          OTHER: "bg-gray-50 text-gray-700",
                        };
                        return (
                          <div key={method} className={`rounded-lg p-3 ${colors[method] || "bg-gray-50 text-gray-700"}`}>
                            <p className="text-xs font-medium opacity-70">{labels[method] || method}</p>
                            <p className="text-base font-bold">${Number(amount).toFixed(2)}</p>
                          </div>
                        );
                      }
                    )}
                    {Number(monthlyReport.summary.rielKhr ?? 0) > 0 && (
                      <div className="rounded-lg p-3 bg-teal-50 text-teal-700">
                        <p className="text-xs font-medium">Riel (៛)</p>
                        <p className="text-base font-bold">៛{Number(monthlyReport.summary.rielKhr).toLocaleString("en-US")}</p>
                        <p className="text-xs mt-0.5 text-teal-600">
                          ≈ ${(Number(monthlyReport.summary.rielKhr) / Number(monthlyReport.summary.usdToKhrRate || 4100)).toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Daily subtotals table */}
              {monthlyReport.dailyBreakdown?.length === 0 ? (
                <p className="text-gray-400 text-sm">No orders found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-gray-600 text-left">
                        {["Date", "Orders", "Items", "Sales", "Discount", "Net"].map((h) => (
                          <th key={h} className="px-4 py-2 font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyReport.dailyBreakdown.map((d, idx) => (
                        <tr key={d.date} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-2 font-medium text-gray-700">
                            {new Date(d.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </td>
                          <td className="px-4 py-2 text-center">{d.orders}</td>
                          <td className="px-4 py-2 text-center">{d.totalItemsSold}</td>
                          <td className="px-4 py-2 text-green-600 font-semibold">${d.totalSales.toFixed(2)}</td>
                          <td className="px-4 py-2 text-yellow-600">${d.totalDiscount.toFixed(2)}</td>
                          <td className="px-4 py-2 text-blue-600 font-semibold">${(d.totalSales - d.totalDiscount).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── TOP PRODUCTS TAB ── */}
      {activeTab === "top-products" && (
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <h2 className="text-lg font-semibold">Top Products</h2>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={topProducts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="productName" />
              <YAxis />
              <Tooltip formatter={(value) => [Number(value ?? 0), "Qty"]} />
              <Legend />
              <Bar dataKey="totalQty"    fill="#f59e0b" name="Qty Sold"    radius={[4, 4, 0, 0]} />
              <Bar dataKey="totalAmount" fill="#3b82f6" name="Revenue ($)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

    </div>
  );
}

function SummaryCard({ label, value, icon, color }: {
  label: string; value: string; icon: ReactNode; color: string;
}) {
  return (
    <div className={`rounded-lg p-4 ${color} flex flex-col gap-1`}>
      {icon}
      <p className="text-xs font-medium opacity-70">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}