import * as React from "react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  GalleryVerticalEnd, ScanQrCode, LayoutDashboard, Package,
  Users, BarChart2, ShoppingCart, LogOut, Tag, AlertTriangle,
} from "lucide-react";
import { isAdmin, getCurrentUser, getRole } from "@/utils/auth";
import { useAuth } from "@/hooks/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import RegisterForm from "./LoginForm/RegisterForm";

const T = {
  bg:           "#ffffff",
  border:       "#f1f5f9",
  borderMed:    "#e2e8f0",
  accent:       "#3b82f6",
  accentBg:     "#eff6ff",
  accentText:   "#1d4ed8",
  accentDot:    "#3b82f6",
  accentSub:    "rgba(59,130,246,0.08)",
  text:         "#6b7280",
  textPrimary:  "#111827",
  textMuted:    "#9ca3af",
  sectionLabel: "#d1d5db",
  divider:      "#f1f5f9",
  hoverBg:      "#f8faff",
  btnBg:        "#f8faff",
  btnBorder:    "#dbeafe",
  btnText:      "#6b7280",
  btnHoverBg:   "#eff6ff",
  btnHoverText: "#3b82f6",
  badgeBg:      "#eff6ff",
  badgeBorder:  "#bfdbfe",
  badgeText:    "#3b82f6",
  avatarBg:     "#eff6ff",
  avatarText:   "#3b82f6",
  subDotActive: "#3b82f6",
  subDotIdle:   "#e2e8f0",
};

interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
}

function SideNavItem({
  item,
  currentPath,
  navigate,
}: {
  item: NavItem;
  currentPath: string;
  navigate: ReturnType<typeof useNavigate>;
}) {
  const isActive = currentPath === item.url;
  const isMobile = useIsMobile();

  const padY = isMobile ? "12px" : "8px";
  const padX = isMobile ? "16px" : "12px";
  const iconSize = isMobile ? 20 : 16;
  const fontSize = isMobile ? 15 : 13;
  const dotSize = isMobile ? 6 : 5;
  const itemMargin = isMobile ? 4 : 2;

  const baseStyle: React.CSSProperties = {
    display: "flex", alignItems: "center", gap: isMobile ? 12 : 10,
    padding: `${padY} ${padX}`, borderRadius: 10, marginBottom: itemMargin,
    cursor: "pointer", transition: "all 0.15s",
    background: isActive ? T.accentBg : "transparent",
    color:      isActive ? T.accentText : T.text,
    fontWeight: isActive ? 600 : 400,
    border: "none", width: "100%", textAlign: "left",
  };

  return (
    <button
      onClick={() => navigate(item.url)}
      style={baseStyle}
      onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = T.hoverBg; (e.currentTarget as HTMLElement).style.color = T.textPrimary; } }}
      onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = T.text; } }}
    >
      <item.icon style={{ width: iconSize, height: iconSize, flexShrink: 0, color: isActive ? T.accent : T.textMuted }} />
      <span style={{ fontSize, flex: 1 }}>{item.title}</span>
      {isActive ? (
        <div style={{ width: dotSize, height: dotSize, borderRadius: "50%", background: T.accentDot, flexShrink: 0 }} />
      ) : null}
    </button>
  );
}

export function AppSidebar() {
  const navigate    = useNavigate();
  const location    = useLocation();
  const currentPath = location.pathname;
  const { logout }  = useAuth();  // ← get logout from AuthContext

  const [adminOnly,    setAdminOnly]    = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [currentUser,  setCurrentUser]  = useState<{ name?: string; email?: string } | null>(null);
  const [registerOpen, setRegisterOpen] = useState(false);

  useEffect(() => {
    setCurrentUser(getCurrentUser());
    setAdminOnly(isAdmin());
    setIsSuperAdmin(getRole() === "admin");
  }, []);

  // ── Logout handler ────────────────────────────────────────
  const handleLogout = () => {
    logout();               // clears token from state + localStorage
    navigate("/login");     // redirect to login page
  };

  // Items visible to both admin and cashier
  const sharedItems: NavItem[] = [
    { title: "Orders", url: "/admin/orders", icon: ShoppingCart },
    { title: "Reports", url: "/admin/reports", icon: BarChart2 },
  ];

  // Admin-only items
  const adminItems: NavItem[] = [
    { title: "Products", url: "/admin/products", icon: Package },
    { title: "Inventory", url: "/admin/inventory", icon: Package },
    { title: "Near Expiry", url: "/admin/products/near-expiry", icon: AlertTriangle },
    { title: "Categories", url: "/admin/categories", icon: Tag },
    { title: "Stock History", url: "/admin/stock-movements", icon: BarChart2 },
    { title: "Users", url: "/admin/users", icon: Users },
  ];

  const navItems: NavItem[] = [
    ...(adminOnly ? [{ title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard }] : []),
    { title: "POS", url: "/admin/pos", icon: ScanQrCode },
    ...sharedItems,
    ...(adminOnly ? adminItems : []),
  ];

  const initials = currentUser?.name
    ? currentUser.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  return (
    <>
      <aside style={{
        width: 220, height: "100vh", display: "flex", flexDirection: "column",
        background: T.bg, borderRight: `1px solid ${T.borderMed}`,
        boxShadow: "2px 0 12px rgba(0,0,0,0.04)",
        flexShrink: 0, fontFamily: "'Inter','Segoe UI',sans-serif",
      }}>

        {/* Logo */}
        <div
          onClick={() => navigate(adminOnly ? "/admin/dashboard" : "/admin/pos")}
          style={{
            padding: "18px 16px 14px", borderBottom: `1px solid ${T.border}`,
            display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
          }}
        >
          <div style={{
            width: 34, height: 34, borderRadius: 10, flexShrink: 0,
            background: T.accent, display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 10px rgba(59,130,246,0.3)",
          }}>
            <GalleryVerticalEnd style={{ width: 17, height: 17, color: "#fff" }} />
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary, lineHeight: 1, margin: 0 }}>LEVA STORE</p>
            <p style={{ fontSize: 10, color: T.accent, margin: "3px 0 0", letterSpacing: "0.05em" }}>POS System</p>
          </div>
        </div>

        {/* Section label */}
        <div style={{ padding: "14px 16px 6px" }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: T.sectionLabel, textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>Menu</p>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: "auto", padding: "0 8px" }}>
          {navItems.map((item) => (
            <SideNavItem key={item.url} item={item} currentPath={currentPath} navigate={navigate} />
          ))}
        </nav>

        <div style={{ height: 1, background: T.border, margin: "0 16px" }} />

        {/* Register User */}
        {isSuperAdmin && (
          <div style={{ padding: "10px 8px 4px" }}>      
          </div>
        )}

        {/* User footer + Logout */}
        <div style={{
          padding: "10px 12px 16px",
          borderTop: `1px solid ${T.border}`,
        }}>
          {/* User info row */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{
              width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
              background: T.avatarBg, border: `1px solid ${T.btnBorder}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700, color: T.avatarText,
            }}>
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: T.textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0 }}>
                {currentUser?.name ?? "User"}
              </p>
              <p style={{ fontSize: 10, color: T.textMuted, margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {currentUser?.email ?? ""}
              </p>
            </div>
            {isSuperAdmin && (
              <div style={{
                padding: "2px 7px", borderRadius: 20, flexShrink: 0,
                background: T.badgeBg, border: `1px solid ${T.badgeBorder}`,
                fontSize: 9, fontWeight: 700, color: T.badgeText,
                letterSpacing: "0.06em", textTransform: "uppercase",
              }}>
                Admin
              </div>
            )}
          </div>

          {/* ── Logout button ── */}
          <button
            onClick={handleLogout}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 10,
              padding: "8px 12px", borderRadius: 10,
              border: `1px solid #fee2e2`,
              background: "#fff5f5", color: "#ef4444",
              cursor: "pointer", fontSize: 12, fontWeight: 500, transition: "all 0.15s",
            }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.background = "#fef2f2"; el.style.borderColor = "#fca5a5"; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.background = "#fff5f5"; el.style.borderColor = "#fee2e2"; }}
          >
            <div style={{ width: 26, height: 26, borderRadius: 7, flexShrink: 0, background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <LogOut style={{ width: 13, height: 13, color: "#ef4444" }} />
            </div>
            Logout
          </button>
        </div>
      </aside>

      {/* Register Dialog */}
      {isSuperAdmin && (
        <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
          <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Account</DialogTitle>
              <DialogDescription>Fill in the details below to create a new account.</DialogDescription>
            </DialogHeader>
            <RegisterForm onSuccess={() => setRegisterOpen(false)} />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}