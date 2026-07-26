import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ICategory } from "@/types/product";
import type { Theme } from "@/hooks/useTheme";

interface CategoryBarProps {
  categories: ICategory[];
  selected: number | undefined;
  onSelect: (id: number | undefined) => void;
  t: Theme;
}

export default function CategoryBar({ categories, selected, onSelect, t }: CategoryBarProps) {
  const allCategories = [{ id: undefined, name: "All" }, ...categories];

  return (
    <div style={{ padding: "12px 20px", display: "flex", alignItems: "center", gap: 8, borderBottom: `1px solid ${t.navBorder}`, background: t.navBg, flexShrink: 0, overflowX: "auto" }}>
      <ChevronLeft style={{ width: 16, height: 16, color: t.textMuted, flexShrink: 0, cursor: "pointer" }} />

      {allCategories.map((cat, i) => (
        <button
          key={i}
          onClick={() => onSelect(cat.id)}
          style={{
            padding: "6px 16px",
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 600,
            whiteSpace: "nowrap",
            cursor: "pointer",
            transition: "all 0.15s",
            background:   selected === cat.id ? t.categoryActiveBg   : t.categoryBg,
            color:        selected === cat.id ? t.categoryActiveText  : t.categoryText,
            border:       selected === cat.id ? "1px solid #3b82f6"   : `1px solid ${t.categoryBorder}`,
            boxShadow:    selected === cat.id ? "0 2px 8px rgba(59,130,246,0.3)" : "none",
          }}
        >
          {cat.name}
        </button>
      ))}

      <ChevronRight style={{ width: 16, height: 16, color: t.textMuted, flexShrink: 0, cursor: "pointer" }} />
    </div>
  );
}