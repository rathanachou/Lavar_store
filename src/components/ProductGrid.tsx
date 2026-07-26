import { memo, useState } from "react";
import { PackageX, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import type { IProduct } from "@/types/product";
import type { Theme } from "@/hooks/useTheme";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  products: IProduct[];
  outOfStockProducts: IProduct[];
  onAdd: (item: IProduct) => void;
  dark: boolean;
  t: Theme;
  formatPrice: (usd: number) => string;
}

const ProductGrid = memo(function ProductGrid({ products, outOfStockProducts, onAdd, dark, t, formatPrice }: ProductGridProps) {
  const [showStockAlert, setShowStockAlert] = useState(false);

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
      {products.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14 }}>
          {products.map((item) => (
            <ProductCard key={item.id} item={item} onAdd={onAdd} dark={dark} t={t} formatPrice={formatPrice} />
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 200, gap: 8 }}>
          <PackageX style={{ width: 36, height: 36, color: t.textMuted }} />
          <p style={{ color: t.textSecondary, fontSize: 14, fontWeight: 500 }}>No products found</p>
          <p style={{ color: t.textMuted, fontSize: 12 }}>Try a different category or search</p>
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
                <ProductCard key={item.id} item={item} disabled onAdd={onAdd} dark={dark} t={t} formatPrice={formatPrice} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default ProductGrid;