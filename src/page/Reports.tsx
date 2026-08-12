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
import type {
  IDailySales,
  IOrderWithDetails,
} from "@/types/dashboard";
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

type Tab = "daily" | "monthly" | "top-products";

function getTabFromPath(pathname: string): Tab {
  if (pathname.includes("/daily"))   return "daily";
  if (pathname.includes("/monthly")) return "monthly";
  return "top-products";
}

export default function Reports() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const activeTab = getTabFromPath(location.pathname);

  const [monthlySales,  setMonthlySales]  = useState<any[]>([]);
  const [topProducts,   setTopProducts]   = useState<any[]>([]);
  const [dailySales,    setDailySales]    = useState<IDailySales | null>(null);
  const [selectedDate,  setSelectedDate]  = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [loading,       setLoading]       = useState(false);
  const [dailyLoading,  setDailyLoading]  = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  // ── New Daily Sales Report (TanStack Query) ─────────────
  const { data: reportData, isLoading: reportLoading } = useDailySalesReport(
    activeTab === "daily" ? selectedDate : ""
  );
  const { mutate: downloadPdf, isPending: pdfDownloading } =
    useDownloadDailySalesPdf();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [monthly, top] = await Promise.all([
          getMonthlySales(),
          getTopProducts(10),
        ]);
        setMonthlySales((monthly as any)?.data || []);
        setTopProducts((top   as any)?.data || []);
      } catch (error) {
        console.error("Reports error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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

  const TABS: { key: Tab; label: string }[] = [
    { key: "daily",        label: "Daily Report"  },
    { key: "monthly",      label: "Monthly Sales" },
    { key: "top-products", label: "Top Products"  },
  ];

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
  const orders: IOrderWithDetails[] = dailySales?.data ?? [];

  return (
    <div className="p-6 space-y-6">

      {/* Page Title */}
      <div className="flex items-center gap-2">
        <TrendingUp className="h-6 w-6 text-indigo-600" />
        <h1 className="text-2xl font-bold">Sales Reports</h1>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-2 border-b border-gray-200">
        {TABS.map((tab) => (
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
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <button
                onClick={() => downloadPdf(selectedDate)}
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

              {/* Transactions table */}
              {orders.length === 0 ? (
                <p className="text-gray-400 text-sm">No orders found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-gray-600 text-left">
                        {["#", "Order No.", "Total", "Discount", "Date", "Details"].map((h) => (
                          <th key={h} className="px-4 py-2 font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {orders.flatMap((order, idx) => {
                        const rows: ReactNode[] = [
                          <tr key={`order-${order.id}`} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-2 text-gray-400">{idx + 1}</td>
                            <td className="px-4 py-2 font-medium text-gray-700">{order.orderNumber}</td>
                            <td className="px-4 py-2 text-green-600 font-semibold">${Number(order.total).toFixed(2)}</td>
                            <td className="px-4 py-2 text-yellow-600">${Number(order.discount).toFixed(2)}</td>
                            <td className="px-4 py-2 text-gray-500">
                              {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </td>
                            <td className="px-4 py-2">
                              <button
                                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                                className="flex items-center gap-1 text-indigo-500 hover:text-indigo-700 text-xs"
                              >
                                {expandedOrder === order.id
                                  ? <><ChevronUp   className="h-3.5 w-3.5" />Hide</>
                                  : <><ChevronDown className="h-3.5 w-3.5" />View</>}
                              </button>
                            </td>
                          </tr>,
                        ];
                        if (expandedOrder === order.id) {
                          order.orderDetails.forEach((item) => {
                            rows.push(
                              <tr key={`detail-${item.id}`} className="bg-indigo-50 text-xs text-gray-600">
                                <td />
                                <td className="px-6 py-1.5 italic text-gray-500" colSpan={1}>↳ {item.productName}</td>
                                <td className="px-4 py-1.5">${Number(item.productPrice).toFixed(2)} × {item.qty}</td>
                                <td className="px-4 py-1.5 text-green-600 font-medium">${Number(item.amount).toFixed(2)}</td>
                                <td colSpan={2} />
                              </tr>,
                            );
                          });
                        }
                        return rows;
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
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingBag className="h-5 w-5 text-indigo-500" />
            <h2 className="text-lg font-semibold">Monthly Sales</h2>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={monthlySales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${Number(value ?? 0).toFixed(2)}`, "Sales"]} />
              <Legend />
              <Bar dataKey="totalSales"  fill="#6366f1" name="Sales ($)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="totalOrders" fill="#22c55e" name="Orders"    radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
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