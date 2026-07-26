import { Plus, Minus, Trash2, QrCode, ShoppingCart } from "lucide-react";
import type { ICart, ICartSummary } from "@/types/cart";
import type { Theme } from "@/hooks/useTheme";

interface CartSidebarProps {
  cartItems: ICart[];
  cartSummary: ICartSummary;
  dark: boolean;
  t: Theme;
  currency: "USD" | "KHR";
  formatPrice: (usd: number) => string;
  onScanClick: () => void;
  onClearCart: () => void;
  onRemove: (id: number) => void;
  onIncrease: (id: number) => void;
  onDecrease: (id: number) => void;
  onCheckout: (method: "cash" | "aba") => void; // ✅ accepts payment method
}

export default function CartSidebar({
  cartItems, cartSummary, dark, t, currency, formatPrice,
  onScanClick, onClearCart, onRemove, onIncrease, onDecrease, onCheckout,
}: CartSidebarProps) {
  const hasItems = cartItems.length > 0;

  return (
    <div style={{ width: 340, display: "flex", flexDirection: "column", flexShrink: 0, background: t.cartBg, borderLeft: `1px solid ${t.cartBorder}` }}>

      {/* Header */}
      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${t.cartBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: t.navBg }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ShoppingCart style={{ width: 18, height: 18, color: "#3b82f6" }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: t.textPrimary }}>Cart</span>
          {cartSummary.totalItems > 0 && (
            <span style={{ background: "#3b82f6", color: "#fff", fontSize: 11, fontWeight: 700, padding: "1px 8px", borderRadius: 20 }}>
              {cartSummary.totalItems}
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={onScanClick} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            <QrCode style={{ width: 16, height: 16, color: "#3b82f6" }} />
          </button>
          {hasItems && (
            <button onClick={onClearCart} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
              <Trash2 style={{ width: 16, height: 16, color: "#ef4444" }} />
            </button>
          )}
        </div>
      </div>

      {/* Items */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px" }}>
        {!hasItems ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 200, gap: 10 }}>
            <ShoppingCart style={{ width: 40, height: 40, color: t.textMuted }} />
            <p style={{ color: t.textMuted, fontSize: 13 }}>Cart is empty</p>
            <p style={{ color: t.textMuted, fontSize: 11 }}>Click a product to add</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {cartItems.map((item, index) => (
              <div key={`${item.id}-${index}`} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 12, background: t.cardBg, border: `1px solid ${t.cardBorder}` }}>
                <div style={{ width: 44, height: 44, borderRadius: 8, overflow: "hidden", background: dark ? "#1e2435" : "#f0f4ff", flexShrink: 0 }}>
                  <img src={item.imageUrl} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: t.textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</p>
                  <p style={{ fontSize: 11, color: t.textMuted, marginTop: 1 }}>{item.category}</p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#3b82f6", marginTop: 2 }}>{formatPrice(item.price * item.qty)}</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                  <button onClick={() => onRemove(item.id)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                    <Trash2 style={{ width: 13, height: 13, color: "#ef4444" }} />
                  </button>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <button onClick={() => onDecrease(item.id)} style={{ width: 24, height: 24, borderRadius: 6, cursor: "pointer", background: t.btnBg, border: `1px solid ${t.btnBorder}`, display: "flex", alignItems: "center", justifyContent: "center", color: t.textSecondary }}>
                      <Minus style={{ width: 10, height: 10 }} />
                    </button>
                    <span style={{ width: 24, textAlign: "center", fontSize: 13, fontWeight: 600, color: t.textPrimary }}>{item.qty}</span>
                    <button onClick={() => onIncrease(item.id)} style={{ width: 24, height: 24, borderRadius: 6, cursor: "pointer", background: "#3b82f6", border: "none", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                      <Plus style={{ width: 10, height: 10 }} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: "14px 16px", borderTop: `1px solid ${t.cartBorder}`, background: t.navBg }}>
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: t.textMuted }}>Subtotal</span>
            <span style={{ fontSize: 12, color: t.textSecondary, fontWeight: 500 }}>{formatPrice(cartSummary.totalPrice)}</span>
          </div>
          {cartSummary.discount > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: "#22c55e" }}>Discount</span>
              <span style={{ fontSize: 12, color: "#22c55e", fontWeight: 500 }}>-{formatPrice(cartSummary.discount)}</span>
            </div>
          )}
          <div style={{ height: 1, background: t.divider, marginBottom: 8 }} />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: t.textPrimary }}>Total</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: "#3b82f6" }}>{formatPrice(cartSummary.netTotal)}</span>
          </div>
        </div>

        {/* Payment method buttons */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
          {/* ✅ Cash — confirm immediately */}
          <button
            onClick={() => hasItems && onCheckout("cash")}
            disabled={!hasItems}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              padding: "10px 8px", borderRadius: 10,
              cursor: hasItems ? "pointer" : "not-allowed",
              background: t.cardBg, border: `1px solid ${t.cardBorder}`,
              color: t.textSecondary, opacity: hasItems ? 1 : 0.5,
            }}
          >
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(34,197,94,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {currency === "KHR"
                ? <span style={{ color: "#22c55e", fontWeight: 700, fontSize: 16 }}>៛</span>
                : <span style={{ color: "#22c55e", fontWeight: 700, fontSize: 16 }}>$</span>}
            </div>
            <span style={{ fontSize: 11, fontWeight: 500 }}>Cash</span>
          </button>

          {/* ✅ Scan QR — ABA checkout */}
          <button
            onClick={() => hasItems && onCheckout("aba")}
            disabled={!hasItems}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              padding: "10px 8px", borderRadius: 10,
              cursor: hasItems ? "pointer" : "not-allowed",
              background: t.cardBg, border: `1px solid ${t.cardBorder}`,
              color: t.textSecondary, opacity: hasItems ? 1 : 0.5,
            }}
          >
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(139,92,246,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <QrCode style={{ width: 16, height: 16, color: "#8b5cf6" }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 500 }}>Scan QR</span>
          </button>
        </div>

        {/* Checkout button */}
        <button
          onClick={() => hasItems && onCheckout("aba")}
          disabled={!hasItems}
          style={{
            width: "100%", padding: "13px 0", borderRadius: 12, border: "none",
            background: !hasItems ? t.btnBg : "linear-gradient(135deg, #3b82f6, #2563eb)",
            color: !hasItems ? t.textMuted : "#fff",
            fontSize: 14, fontWeight: 700,
            cursor: !hasItems ? "not-allowed" : "pointer",
            boxShadow: hasItems ? "0 4px 14px rgba(59,130,246,0.4)" : "none",
            transition: "all 0.2s",
          }}
        >
          {!hasItems ? "Add items to checkout" : `Checkout  ${formatPrice(cartSummary.netTotal)}`}
        </button>
      </div>
    </div>
  );
}