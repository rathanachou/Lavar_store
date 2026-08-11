import { memo } from "react";
import { Plus } from "lucide-react";
import type { IProduct } from "@/types/product";
import type { Theme } from "@/hooks/useTheme";

interface ProductCardProps {
  item: IProduct;
  disabled?: boolean;
  onAdd: (item: IProduct) => void;
  dark: boolean;
  t: Theme;
  formatPrice: (usd: number) => string;
}

const ProductCard = memo(function ProductCard({ item, disabled = false, onAdd, dark, t, formatPrice }: ProductCardProps) {
  return (
    <div
      onClick={() => !disabled && onAdd(item)}
      style={{
        background: t.cardBg,
        border: `1px solid ${t.cardBorder}`,
        boxShadow: t.cardShadow,
        borderRadius: 14,
        overflow: "hidden",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition: "all 0.2s ease",
        filter: disabled ? "grayscale(0.4)" : "none",
      }}
      className="group"
      onMouseEnter={(e) => {
        if (!disabled) {
          const el = e.currentTarget as HTMLDivElement;
          el.style.transform = "translateY(-3px)";
          el.style.boxShadow = dark
            ? "0 8px 24px rgba(0,0,0,0.4)"
            : "0 8px 24px rgba(59,130,246,0.12)";
          el.style.borderColor = "#3b82f6";
        }
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = "translateY(0)";
        el.style.boxShadow = t.cardShadow;
        el.style.borderColor = t.cardBorder;
      }}
    >
      {/* Image */}
      <div style={{ position: "relative", aspectRatio: "4/3", overflow: "hidden", background: dark ? "#1e2435" : "#f0f4ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <img
          src={item.productImages?.[0]?.imageUrl ?? "/no-image.png"}
          alt={item.name}
          style={{ width: "100%", height: "100%", objectFit: "contain", transition: "transform 0.4s ease" }}
          className="group-hover:scale-105"
        />

        {disabled ? (
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", background: "#ef4444", padding: "3px 10px", borderRadius: 20 }}>
              Out of Stock
            </span>
          </div>
        ) : (
          <div style={{ position: "absolute", inset: 0, background: "rgba(59,130,246,0.5)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.2s" }} className="group-hover:opacity-100">
            <div style={{ background: "#fff", borderRadius: "50%", padding: 10, boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}>
              <Plus style={{ width: 20, height: 20, color: "#3b82f6" }} />
            </div>
          </div>
        )}

        {!disabled && (
          <div style={{ position: "absolute", top: 8, right: 8, background: item.qty > 5 ? t.badgeGreenBg : t.badgeOrangeBg, color: item.qty > 5 ? t.badgeGreenText : t.badgeOrangeText, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, backdropFilter: "blur(4px)" }}>
            {item.qty}
          </div>
        )}

        {Number(item.discountPercent) > 0 && (
          <div
            style={{
              position: "absolute",
              top: 8,
              left: 8,
              background: "#f97316",
              color: "#fff",
              fontSize: 10,
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: 20,
              boxShadow: "0 2px 8px rgba(249,115,22,0.4)",
              display: "flex",
              alignItems: "center",
              gap: 3,
            }}
            title="Near-expiry discount"
          >
            -{Number(item.discountPercent)}%
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: "12px 12px 14px" }}>
        <div style={{ display: "inline-block", background: dark ? "rgba(59,130,246,0.15)" : "rgba(59,130,246,0.08)", color: "#3b82f6", fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 6, marginBottom: 6 }}>
          {item?.category?.name || "Uncategorized"}
        </div>
        <p style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary, marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {item.name}
        </p>
        <p style={{ fontSize: 16, fontWeight: 700, color: "#3b82f6" }}>
          {formatPrice(Number(item.price))}
        </p>
      </div>
    </div>
  );
});

export default ProductCard;