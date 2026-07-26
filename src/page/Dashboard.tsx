import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "@/hooks/useDashboard";
import {
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis,
  CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  ShoppingCart, Package, BarChart3,
   Bell, ChevronDown, TrendingUp, TrendingDown,
  Sun, Moon, RefreshCw, AlertTriangle, Store,
} from "lucide-react";

// ─── Dark / Light hook ────────────────────────────────────────
function useDarkMode() {
  const [dark, setDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const stored = localStorage.getItem("dashboard-theme");
    if (stored) return stored === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  useEffect(() => {
    localStorage.setItem("dashboard-theme", dark ? "dark" : "light");
  }, [dark]);
  return { dark, toggle: () => setDark(d => !d) };
}

// ─── Theme tokens ─────────────────────────────────────────────
function useTheme(dark: boolean) {
  return {
    navBg:          dark ? "#161b27" : "#ffffff",
    navBorder:      dark ? "#1e2435" : "#e5e7eb",
    pageBg:         dark ? "#0f1623" : "#f3f4f8",
    cardBg:         dark ? "#161b27" : "#ffffff",
    cardBorder:     dark ? "#1e2435" : "#e5e7eb",
    cardShadow:     dark ? "none"    : "0 1px 4px rgba(0,0,0,0.06)",
    textPrimary:    dark ? "#f1f5f9" : "#111827",
    textSecondary:  dark ? "#94a3b8" : "#6b7280",
    textMuted:      dark ? "#4b5563" : "#9ca3af",
    gridColor:      dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)",
    tickColor:      dark ? "#374151" : "#9ca3af",
    tooltipBg:      dark ? "#1e2435" : "#ffffff",
    tooltipBorder:  dark ? "#2d3748" : "#e5e7eb",
    tooltipText:    dark ? "#f1f5f9" : "#111827",
    tableBorder:    dark ? "#1e2435" : "#f3f4f6",
    badgeGreen:     dark ? "rgba(34,197,94,0.15)"  : "rgba(34,197,94,0.1)",
    badgeGreenText: "#22c55e",
    badgeRed:       dark ? "rgba(239,68,68,0.15)"  : "rgba(239,68,68,0.1)",
    badgeRedText:   "#ef4444",
    btnBg:          dark ? "#1e2435" : "#f3f4f8",
    btnBorder:      dark ? "#2d3748" : "#e5e7eb",
    btnText:        dark ? "#94a3b8" : "#6b7280",
  };
}

const PIE_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#f43f5e"];
const BAR_COLORS = ["#3b82f6", "#22c55e", "#8b5cf6", "#f59e0b", "#f43f5e"];

// ─── Custom Tooltip ───────────────────────────────────────────
const ChartTooltip = ({ active, payload, label, t }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: t.tooltipBg, border: `1px solid ${t.tooltipBorder}`,
      borderRadius: 8, padding: "8px 12px", fontSize: 12, color: t.tooltipText,
      boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
    }}>
      {label && <p style={{ color: t.textSecondary, marginBottom: 4, fontWeight: 600 }}>{label}</p>}
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color ?? t.textPrimary, margin: "1px 0" }}>
          {p.name}: <strong>{typeof p.value === "number" && p.dataKey !== "totalQty"
            ? `$${Number(p.value).toLocaleString()}`
            : p.value}</strong>
        </p>
      ))}
    </div>
  );
};

const Empty = ({ label, t }: { label: string; t: any }) => (
  <div className="flex items-center justify-center h-full">
    <p className="text-xs" style={{ color: t.textMuted }}>{label}</p>
  </div>
);

// ─── Dashboard ────────────────────────────────────────────────
export default function Dashboard() {
  const { dark, toggle } = useDarkMode();
  const t = useTheme(dark);
  const [period, setPeriod] = useState<"Today"|"Week"|"Month"|"Year">("Week");

  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!notifOpen) return;
    const onClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [notifOpen]);

  const {
    summary,
    periodSales,
    topProducts,
    categoryData,
    dailySales,
    totalProducts,
    lowStock,
    loading,
    error,
    refetch,
  } = useDashboard(period);

  // ── Monthly target ───────────────────────────────────────────
  const MONTHLY_TARGET = 5000;
  const monthlyActual  = summary?.monthly?.totalSales ?? 0;
  const targetPct      = Math.min(100, Math.round((monthlyActual / MONTHLY_TARGET) * 100));

  // ── Format date/time from Order.createdAt ───────────────────
  const fmtTime = (iso: string) => {
    try { return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); }
    catch { return "—"; }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen" style={{ background: t.pageBg }}>
      <div className="flex flex-col items-center gap-3">
        <RefreshCw className="h-7 w-7 animate-spin" style={{ color: "#3b82f6" }} />
        <p className="text-sm tracking-widest uppercase" style={{ color: t.textMuted }}>Loading…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-screen gap-4" style={{ background: t.pageBg }}>
      <AlertTriangle className="h-10 w-10 text-red-400" />
      <p className="text-red-400 text-sm">{error}</p>
      <button onClick={refetch} className="flex items-center gap-2 text-white px-4 py-2 rounded-lg text-sm" style={{ background: "#3b82f6" }}>
        <RefreshCw className="h-4 w-4" /> Try Again
      </button>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: t.pageBg, fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ── TOP NAVBAR ─────────────────────────────────── */}
        <header className="flex items-center justify-between px-6 py-3 flex-shrink-0 border-b"
          style={{ background: t.navBg, borderColor: t.navBorder }}>
          <div>
            <h1 className="text-lg font-bold" style={{ color: t.textPrimary }}>Dashboard</h1>
            <p className="text-xs" style={{ color: t.textSecondary }}>Overview of your store performance</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Period */}
            <div className="flex items-center gap-1 rounded-lg p-1" style={{ background: t.btnBg, border: `1px solid ${t.btnBorder}` }}>
              {(["Today","Week","Month","Year"] as const).map(p => (
                <button key={p} onClick={() => setPeriod(p)}
                  className="px-3 py-1 rounded-md text-xs font-medium transition-all"
                  style={{ background: period === p ? "#3b82f6" : "transparent", color: period === p ? "#fff" : t.textSecondary }}>
                  {p}
                </button>
              ))}
            </div>
            {/* Search */}
            {/* Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(o => !o)}
                className="relative p-2 rounded-lg"
                style={{ background: t.btnBg, border: `1px solid ${t.btnBorder}` }}
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" style={{ color: t.textSecondary }} />
                {lowStock.length > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold">
                    {lowStock.length}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div
                  className="absolute right-0 mt-2 w-80 rounded-xl z-50 overflow-hidden"
                  style={{
                    background: t.cardBg,
                    border: `1px solid ${t.cardBorder}`,
                    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                  }}
                >
                  <div
                    className="flex items-center justify-between px-4 py-3 border-b"
                    style={{ borderColor: t.cardBorder }}
                  >
                    <h3 className="text-sm font-semibold" style={{ color: t.textPrimary }}>
                      Low Stock Alert
                    </h3>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: t.badgeRed, color: t.badgeRedText }}
                    >
                      {lowStock.length}
                    </span>
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {lowStock.length > 0 ? (
                      lowStock.map((p: any) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between px-4 py-2.5 border-b"
                          style={{ borderColor: t.tableBorder }}
                        >
                          <div className="min-w-0 flex-1">
                            <p
                              className="text-xs font-medium truncate"
                              style={{ color: t.textPrimary }}
                            >
                              {p.name}
                            </p>
                            <p className="text-[10px]" style={{ color: t.textMuted }}>
                              ${Number(p.price ?? 0).toFixed(2)} each
                            </p>
                          </div>
                          <div className="flex items-center gap-2 ml-3">
                            <span
                              className="text-xs font-semibold"
                              style={{ color: t.textSecondary }}
                            >
                              {p.qty} left
                            </span>
                            <span
                              className="px-2 py-0.5 rounded text-[10px] font-semibold"
                              style={{
                                background:
                                  p.qty === 0
                                    ? "rgba(239,68,68,0.15)"
                                    : t.badgeRed,
                                color: t.badgeRedText,
                              }}
                            >
                              {p.qty === 0 ? "Out" : "Low"}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center">
                        <p className="text-xs" style={{ color: t.textMuted }}>
                          All items well stocked
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            {/* Branch */}
           
            {/* Theme toggle */}
            <button onClick={toggle} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{ background: t.btnBg, border: `1px solid ${t.btnBorder}`, color: t.btnText }}>
              {dark ? <Sun className="h-3.5 w-3.5 text-yellow-400" /> : <Moon className="h-3.5 w-3.5 text-blue-500" />}
              {dark ? "Light" : "Dark"}
            </button>
          </div>
        </header>

        {/* ── SCROLLABLE CONTENT ───────────────────────── */}
        <main className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* ── METRIC CARDS ─────────────────────────── */}
          {/*
            Backend fields used:
              summary.today.totalSales   → Today's Sales
              summary.today.totalOrders  → Today's Orders
              totalProducts              → summary.totalProducts
              summary.monthly.totalSales → Monthly Sales
          */}
          <div className="grid grid-cols-4 gap-4">
            <MetricCard
              label="Today's Sales"
              value={`$${Number(summary?.today?.totalSales ?? 0).toFixed(2)}`}
              sub={`${summary?.today?.totalOrders ?? 0} orders today`}
              accent="#3b82f6"
              t={t}
              icon={<div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(59,130,246,0.2)" }}>
                <span style={{ color: "#3b82f6", fontWeight: 700, fontSize: 16 }}>$</span>
              </div>}
            />
            <MetricCard
              label="Total Orders Today"
              value={String(summary?.today?.totalOrders ?? 0)}
              sub={`$${Number(summary?.today?.totalSales ?? 0).toFixed(2)} revenue`}
              accent="#22c55e"
              t={t}
              icon={<div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(34,197,94,0.2)" }}>
                <ShoppingCart className="h-5 w-5" style={{ color: "#22c55e" }} />
              </div>}
            />
            <MetricCard
              label="Total Products"
              value={String(totalProducts)}
              sub={`${lowStock.length} items low stock`}
              accent="#8b5cf6"
              t={t}
              icon={<div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(139,92,246,0.2)" }}>
                <Package className="h-5 w-5" style={{ color: "#8b5cf6" }} />
              </div>}
            />
            <MetricCard
              label="Monthly Sales"
              value={`$${Number(summary?.monthly?.totalSales ?? 0).toFixed(2)}`}
              sub={`${summary?.monthly?.totalOrders ?? 0} orders this month`}
              accent="#f59e0b"
              t={t}
              icon={<div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(245,158,11,0.2)" }}>
                <BarChart3 className="h-5 w-5" style={{ color: "#f59e0b" }} />
              </div>}
            />
          </div>

          {/* ── CHARTS ROW ───────────────────────────── */}
          {/*
            periodSales[] → { label, totalSales, totalOrders } — grouped by selected `period`
            topProducts[]  → { productName, totalQty, totalAmount }
          */}
          <div className="grid grid-cols-5 gap-4">

            {/* Sales Area Chart */}
            <div className="col-span-3 rounded-xl p-4" style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold" style={{ color: t.textPrimary }}>
                  Sales Overview ({period})
                </h2>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                {periodSales.length > 0 ? (
                  <AreaChart data={periodSales} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
                    <defs>
                      <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}  />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke={t.gridColor} strokeDasharray="3 3" vertical={false} />
                    {/* label = date/hour/month string depending on selected period (from backend) */}
                    <XAxis dataKey="label" tick={{ fill: t.tickColor, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: t.tickColor, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                    <Tooltip content={<ChartTooltip t={t} />} />
                    <Area type="monotone" dataKey="totalSales" stroke="#3b82f6" strokeWidth={2.5}
                      fill="url(#salesGrad)" dot={{ r: 4, fill: "#3b82f6", strokeWidth: 2, stroke: t.cardBg }}
                      activeDot={{ r: 5 }} name="Sales ($)" />
                  </AreaChart>
                ) : (
                  <Empty label="No sales data for this period" t={t} />
                )}
              </ResponsiveContainer>
            </div>

            {/* Top Products Bar Chart */}
            <div className="col-span-2 rounded-xl p-4" style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold" style={{ color: t.textPrimary }}>Top Selling Products</h2>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                {topProducts.length > 0 ? (
                  <BarChart data={topProducts.slice(0, 5)} margin={{ top: 16, right: 4, bottom: 0, left: -20 }}>
                    <CartesianGrid stroke={t.gridColor} strokeDasharray="3 3" vertical={false} />
                    {/* productName from OrderDetail GROUP BY */}
                    <XAxis dataKey="productName" tick={{ fill: t.tickColor, fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: t.tickColor, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip t={t} />} />
                    <Bar dataKey="totalQty" name="Qty Sold" radius={[4,4,0,0]}
                      label={{ position: "top", fontSize: 10, fill: t.tickColor }}>
                      {topProducts.slice(0, 5).map((_: any, i: number) => (
                        <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                ) : (
                  <Empty label="No product data" t={t} />
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* ── BOTTOM ROW ───────────────────────────── */}
          <div className="grid grid-cols-4 gap-4">

            {/* Sales by Category Pie */}
            {/*
              categoryData[] → { category, categoryName, totalSales, totalOrders }
              Using `category` field for labels (both fields are identical from backend)
            */}
            <div className="rounded-xl p-4" style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow }}>
              <h2 className="text-sm font-semibold mb-3" style={{ color: t.textPrimary }}>Sales by Category</h2>
              {categoryData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={categoryData} dataKey="totalSales" nameKey="category"
                        cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2}>
                        {categoryData.map((_: any, i: number) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="transparent" />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: t.tooltipBg, border: `1px solid ${t.tooltipBorder}`, borderRadius: 8, fontSize: 11, color: t.tooltipText }}
                        formatter={(v: any) => [`$${Number(v).toFixed(2)}`, "Sales"]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Compute total for % */}
                  {(() => {
                    const total = categoryData.reduce((s: number, c: any) => s + (c.totalSales || 0), 0);
                    return (
                      <div className="space-y-1.5 mt-1">
                        {categoryData.map((c: any, i: number) => (
                          <div key={i} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                              <span style={{ color: t.textSecondary }}>{c.category}</span>
                            </div>
                            <span style={{ color: t.textMuted }}>
                              {total > 0 ? `${Math.round((c.totalSales / total) * 100)}%` : "0%"}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </>
              ) : (
                <div className="flex items-center justify-center h-40">
                  <p className="text-xs" style={{ color: t.textMuted }}>No category data</p>
                </div>
              )}
            </div>

            {/* Monthly Target */}
            {/*
              Calculated from summary.monthly.totalSales vs MONTHLY_TARGET constant
            */}
            <div className="rounded-xl p-4 flex flex-col items-center justify-center"
              style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow }}>
              <h2 className="text-sm font-semibold mb-4 self-start" style={{ color: t.textPrimary }}>Monthly Target</h2>
              <TargetRing pct={targetPct} color="#3b82f6" dark={dark} />
              <p className="text-xs mt-3" style={{ color: t.textMuted }}>
                ${monthlyActual.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / ${MONTHLY_TARGET.toLocaleString()}
              </p>
              <p className="text-xs mt-2 text-center" style={{ color: t.textSecondary }}>
                {targetPct >= 100 ? "🎉 Target reached!" : targetPct >= 75 ? "🎉 Almost there!" : targetPct >= 50 ? "💪 Halfway there!" : "📈 Keep pushing!"}
              </p>
            </div>

            {/* Recent Transactions */}
            {/*
              dailySales.data → Order[] from sequelize include orderDetails
              Fields: id, total, discount, createdAt (from Orders table)
              No `customer` field — Orders has no customer name in this schema
            */}
            <div className="rounded-xl p-4" style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow }}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold" style={{ color: t.textPrimary }}>Recent Transactions</h2>
                <button onClick={() => navigate("/admin/reports/daily")} className="text-xs cursor-pointer hover:underline" style={{ color: "#3b82f6" }}>View All</button>
              </div>
              {dailySales?.data?.length ? (
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${t.tableBorder}` }}>
                      {["Order #", "Items", "Total", "Time"].map(h => (
                        <th key={h} className="pb-2 text-left font-medium" style={{ color: t.textMuted }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dailySales.data.slice(0, 5).map((tx: any, i: number) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${t.tableBorder}` }}>
                        {/* id from Orders table */}
                        <td className="py-2" style={{ color: t.textMuted }}>#{tx.id}</td>
                        {/* orderDetails is included via Sequelize association */}
                        <td className="py-2" style={{ color: t.textSecondary }}>
                          {tx.orderDetails?.length ?? 0} item{tx.orderDetails?.length !== 1 ? "s" : ""}
                        </td>
                        {/* total from Orders.total */}
                        <td className="py-2 font-semibold" style={{ color: t.textPrimary }}>
                          ${Number(tx.total ?? 0).toFixed(2)}
                        </td>
                        {/* createdAt from Orders.createdAt */}
                        <td className="py-2" style={{ color: t.textMuted }}>{fmtTime(tx.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-xs text-center mt-6" style={{ color: t.textMuted }}>No transactions today</p>
              )}
            </div>

            {/* Low Stock Alert */}
            {/*
              lowStock[] → from summary.lowStock
              Fields: id, name, qty, price  (Product model)
            */}
            <div className="rounded-xl p-4" style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow }}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold" style={{ color: t.textPrimary }}>Low Stock Alert</h2>
                <button onClick={() => navigate("/admin/products")} className="text-xs cursor-pointer hover:underline" style={{ color: "#3b82f6" }}>View All</button>
              </div>
              {lowStock.length > 0 ? (
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${t.tableBorder}` }}>
                      {["Product", "Qty", "Price", "Status"].map(h => (
                        <th key={h} className="pb-2 text-left font-medium" style={{ color: t.textMuted }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {lowStock.map((p: any, i: number) => (
                      <tr key={p.id ?? i} style={{ borderBottom: `1px solid ${t.tableBorder}` }}>
                        {/* name, qty, price from Product model */}
                        <td className="py-2" style={{ color: t.textSecondary }}>{p.name}</td>
                        <td className="py-2 font-semibold" style={{ color: t.textPrimary }}>{p.qty}</td>
                        <td className="py-2" style={{ color: t.textMuted }}>${Number(p.price ?? 0).toFixed(2)}</td>
                        <td className="py-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold"
                            style={{ background: p.qty === 0 ? "rgba(239,68,68,0.15)" : t.badgeRed,
                                     color: t.badgeRedText }}>
                            {p.qty === 0 ? "Out of Stock" : "Low Stock"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-xs text-center mt-6" style={{ color: t.textMuted }}> All items well stocked</p>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

// ─── MetricCard ───────────────────────────────────────────────
function MetricCard({ label, value, sub, accent, t, icon }: any) {
  return (
    <div className="rounded-xl p-4 relative overflow-hidden"
      style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow }}>
      <div className="flex items-start justify-between mb-3">
        {icon}
        <div className="text-right">
          <p className="text-[11px] font-medium mb-0.5" style={{ color: t.textSecondary }}>{label}</p>
          <p className="text-xl font-bold" style={{ color: t.textPrimary }}>{value}</p>
        </div>
      </div>
      <p className="text-[11px]" style={{ color: t.textMuted }}>{sub}</p>
    </div>
  );
}

// ─── Target Ring ─────────────────────────────────────────────
function TargetRing({ pct, color, dark }: { pct: number; color: string; dark: boolean }) {
  const r = 54, cx = 70, cy = 70;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="relative flex items-center justify-center">
      <svg width={140} height={140} viewBox="0 0 140 140">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={dark ? "#1e2435" : "#e5e7eb"} strokeWidth={12} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={12}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`} />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold" style={{ color }}>{pct}%</span>
      </div>
    </div>
  );
}