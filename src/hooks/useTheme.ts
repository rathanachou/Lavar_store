export interface Theme {
  pageBg: string;
  navBg: string;
  navBorder: string;
  cardBg: string;
  cardBorder: string;
  cardShadow: string;
  cartBg: string;
  cartBorder: string;
  inputBg: string;
  inputBorder: string;
  inputText: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  btnBg: string;
  btnBorder: string;
  btnText: string;
  divider: string;
  categoryActiveBg: string;
  categoryActiveText: string;
  categoryBg: string;
  categoryText: string;
  categoryBorder: string;
  badgeGreenBg: string;
  badgeGreenText: string;
  badgeOrangeBg: string;
  badgeOrangeText: string;
}

export function useTheme(dark: boolean): Theme {
  return {
    pageBg:       dark ? "#0f1623" : "#f3f4f8",
    navBg:        dark ? "#161b27" : "#ffffff",
    navBorder:    dark ? "#1e2435" : "#e5e7eb",
    cardBg:       dark ? "#161b27" : "#ffffff",
    cardBorder:   dark ? "#1e2435" : "#e5e7eb",
    cardShadow:   dark ? "none"    : "0 1px 6px rgba(0,0,0,0.07)",
    cartBg:       dark ? "#0d1117" : "#f8faff",
    cartBorder:   dark ? "#1e2435" : "#dbeafe",
    inputBg:      dark ? "#1e2435" : "#f9fafb",
    inputBorder:  dark ? "#2d3748" : "#e5e7eb",
    inputText:    dark ? "#f1f5f9" : "#111827",
    textPrimary:   dark ? "#f1f5f9" : "#111827",
    textSecondary: dark ? "#94a3b8" : "#6b7280",
    textMuted:     dark ? "#4b5563" : "#9ca3af",
    btnBg:        dark ? "#1e2435" : "#f3f4f8",
    btnBorder:    dark ? "#2d3748" : "#e5e7eb",
    btnText:      dark ? "#94a3b8" : "#6b7280",
    divider:      dark ? "#1e2435" : "#e5e7eb",
    categoryActiveBg:   "#3b82f6",
    categoryActiveText: "#ffffff",
    categoryBg:         dark ? "#1e2435" : "#f0f4ff",
    categoryText:       dark ? "#94a3b8" : "#4b5563",
    categoryBorder:     dark ? "#2d3748" : "#dbeafe",
    badgeGreenBg:   dark ? "rgba(34,197,94,0.15)"  : "rgba(34,197,94,0.1)",
    badgeGreenText: "#22c55e",
    badgeOrangeBg:  dark ? "rgba(245,158,11,0.15)" : "rgba(245,158,11,0.1)",
    badgeOrangeText:"#f59e0b",
  };
}

