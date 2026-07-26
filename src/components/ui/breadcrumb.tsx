import { useNavigate, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";

// ─── Route label map — must match App.tsx routes ─────────────
const ROUTE_LABELS: Record<string, string> = {
  "/admin/pos":             "POS",
  "/admin/dashboard":       "Dashboard",
  "/admin/products":        "Products",
  "/admin/categories":      "Categories",
  "/admin/reports":         "Reports",
  "/admin/reports/daily":   "Daily",
  "/admin/reports/monthly": "Monthly",
  "/admin/users":           "Users",
};

export default function AppBreadcrumb() {
  const navigate = useNavigate();
  const location = useLocation();
  const path     = location.pathname;

  // Build cumulative path segments
  // e.g. "/admin/reports/daily" → ["/admin", "/admin/reports", "/admin/reports/daily"]
  const parts   = path.split("/").filter(Boolean);
  const allCrumbs = parts.map((_, i) => {
    const url = "/" + parts.slice(0, i + 1).join("/");
    return { url, label: ROUTE_LABELS[url] ?? null };
  });

  // Only keep segments that have a known label (skip "/admin" prefix)
  const crumbs = allCrumbs.filter((c) => c.label !== null);

  return (
    <nav
      aria-label="breadcrumb"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        fontSize: 13,
        fontFamily: "'Inter','Segoe UI',sans-serif",
      }}
    >
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span
            key={crumb.url}
            style={{ display: "flex", alignItems: "center", gap: 4 }}
          >
            {/* Separator — skip before first item */}
            {i > 0 && (
              <ChevronRight
                style={{ width: 13, height: 13, color: "#d1d5db" }}
              />
            )}

            {isLast ? (
              // Current page — not clickable
              <span style={{ color: "#111827", fontWeight: 600 }}>
                {crumb.label}
              </span>
            ) : (
              // Parent page — clickable
              <button
                onClick={() => navigate(crumb.url)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#6b7280",
                  padding: "2px 4px",
                  borderRadius: 4,
                  fontWeight: 400,
                  fontSize: 13,
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "#3b82f6")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "#6b7280")
                }
              >
                {crumb.label}
              </button>
            )}
          </span>
        );
      })}
    </nav>
  );
}