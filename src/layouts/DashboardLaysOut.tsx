import { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";

import { Outlet, useLocation } from "react-router-dom";
import {
  ScanQrCode, LayoutDashboard, Package,
  BarChart2, Users, FolderOpen, PanelLeftClose, PanelLeftOpen,
} from "lucide-react";
import AppBreadcrumb from "@/components/ui/breadcrumb";

// ─── Route → Icon map ─────────────────────────────────────────
const ROUTE_ICONS: { path: string; icon: React.ElementType }[] = [
  { path: "/admin/pos",       icon: ScanQrCode      },
  { path: "/admin/dashboard", icon: LayoutDashboard },
  { path: "/admin/products",  icon: Package         },
  { path: "/admin/categories",icon: Package         },
  { path: "/admin/reports",   icon: BarChart2       },
  { path: "/admin/users",     icon: Users           },
];

function PageIcon() {
  const { pathname } = useLocation();
  const match = ROUTE_ICONS
    .filter(r => pathname.startsWith(r.path))
    .sort((a, b) => b.path.length - a.path.length)[0];
  const Icon = match?.icon ?? FolderOpen;
  return <Icon className="h-4 w-4" />;
}

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div
      style={{ fontFamily: "'Inter','Segoe UI',sans-serif" }}
      className="flex min-h-screen w-full bg-gray-50"
    >
      {/* ── Sidebar — slide in/out ─────────────────────── */}
      <div
        style={{
          width:      sidebarOpen ? 220 : 0,
          minWidth:   sidebarOpen ? 220 : 0,
          overflow:   "hidden",
          transition: "width 0.2s ease, min-width 0.2s ease",
          flexShrink: 0,
        }}
      >
        <AppSidebar />
      </div>

      {/* ── Main content ──────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">

        {/* Header */}
        <header className="flex h-14 items-center gap-3 px-4 bg-white border-b border-gray-100">

          {/* Toggle button */}
          <button
            onClick={() => setSidebarOpen(o => !o)}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 32, height: 32, borderRadius: 8,
              border: "1px solid #e5e7eb",
              background: "transparent", cursor: "pointer",
              color: "#6b7280", transition: "all 0.15s",
              flexShrink: 0,
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = "#f3f4f6";
              (e.currentTarget as HTMLButtonElement).style.color = "#111827";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              (e.currentTarget as HTMLButtonElement).style.color = "#6b7280";
            }}
            title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {sidebarOpen
              ? <PanelLeftClose className="h-4 w-4" />
              : <PanelLeftOpen  className="h-4 w-4" />
            }
          </button>

          {/* Page icon */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 28, height: 28, borderRadius: 7,
            background: "#eff6ff", color: "#3b82f6", flexShrink: 0,
          }}>
            <PageIcon />
          </div>

          {/* Breadcrumb */}
          <AppBreadcrumb />
        </header>

        {/* Page content */}
        <main className="flex flex-1 flex-col overflow-y-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;