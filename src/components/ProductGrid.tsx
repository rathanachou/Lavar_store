import { memo, useState } from "react";
import { PackageX, AlertTriangle, Clock3, ChevronDown, ChevronUp } from "lucide-react";
import type { IProduct } from "@/types/product";
import type { Theme } from "@/hooks/useTheme";
import { isProductExpired } from "@/utils/expiry";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  products: IProduct[];
  outOfStockProducts: IProduct[];
  /** In-stock but expired products — shown disabled so they can't be sold */
  expiredProducts?: IProduct[];
  onAdd: (item: IProduct) => void;
  dark: boolean;
  t: Theme;
  formatPrice: (usd: number) => string;
}

const ProductGrid = memo(function ProductGrid({ products, outOfStockProducts, expiredProducts = [], onAdd, dark, t, formatPrice }: ProductGridProps) {
  const [showStockAlert, setShowStockAlert] = useState(false);
  const [showExpiredAlert, setShowExpiredAlert] = useState(false);

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
      {products.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14 }}>
          {products.map((item) => (
            <ProductCard key={item.id} item={item} expired={isProductExpired(item)} onAdd={onAdd} dark={dark} t={t} formatPrice={formatPrice} />
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 200, gap: 8 }}>
          <PackageX style={{ width: 36, height: 36, color: t.textMuted }} />
          <p style={{ color: t.textSecondary, fontSize: 14, fontWeight: 500 }}>No products found</p>
          <p style={{ color: t.textMuted, fontSize: 12 }}>Try a different category or search</p>
        </div>
      )}

      {expiredProducts.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <button
            onClick={() => setShowExpiredAlert((p) => !p)}
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderRadius: 10, cursor: "pointer", background: dark ? "rgba(245,158,11,0.12)" : "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.3)", color: "#f59e0b" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Clock3 style={{ width: 16, height: 16 }} />
              <span style={{ fontSize: 13, fontWeight: 600 }}>Expired Products</span>
              <span style={{ background: "#f59e0b", color: "#fff", fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 20 }}>
                {expiredProducts.length}
              </span>
            </div>
            {showExpiredAlert ? <ChevronUp style={{ width: 14, height: 14 }} /> : <ChevronDown style={{ width: 14, height: 14 }} />}
          </button>

          {showExpiredAlert && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14, marginTop: 14 }}>
              {expiredProducts.map((item) => (
                <ProductCard key={item.id} item={item} disabled expired onAdd={onAdd} dark={dark} t={t} formatPrice={formatPrice} />
              ))}
            </div>
          )}
        </div>
      )}

      {outOfStockProducts.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <button
            onClick={() => setShowStockAlert((p) => !p)}
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderRadius: 10, cursor: "pointer", background: dark ? "rgba(239,68,68,0.1)" : "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.25)", color: "#ef4444" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <AlertTriangle style={{ width: 16, height: 16 }} />
              <span style={{ fontSize: 13, fontWeight: 600 }}>Out of Stock Products</span>
              <span style={{ background: "#ef4444", color: "#fff", fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 20 }}>
                {outOfStockProducts.length}
              </span>
            </div>
            {showStockAlert ? <ChevronUp style={{ width: 14, height: 14 }} /> : <ChevronDown style={{ width: 14, height: 14 }} />}
          </button>

          {showStockAlert && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14, marginTop: 14 }}>
              {outOfStockProducts.map((item) => (
                <ProductCard key={item.id} item={item} disabled expired={isProductExpired(item)} onAdd={onAdd} dark={dark} t={t} formatPrice={formatPrice} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default ProductGrid;
