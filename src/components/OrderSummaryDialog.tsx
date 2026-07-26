 import SharedDialog from "@/components/SharedDialog";
import type { ICart, ICartSummary } from "@/types/cart";
import type { ReactNode } from "react";
import { X, Banknote, QrCode } from "lucide-react";

interface OrderSummaryDialogProps {
  open: boolean;
  onClose: () => void;
  cartItems: ICart[];
  cartSummary: ICartSummary;
  formatPrice: (usd: number) => string;
  isLoading: boolean;
  currentOrderId: number | null;
  onCancel: () => void;
  onPlaceOrder: (method: "cash" | "aba") => void;
  children?: ReactNode;
}

export default function OrderSummaryDialog({
  open,
  onClose,
  cartItems,
  cartSummary,
  formatPrice,
  isLoading,
  currentOrderId,
  onCancel,
  onPlaceOrder,
}: OrderSummaryDialogProps) {
  return (
    <SharedDialog
      open={open}
      setOpen={(val) => { if (!val) onClose(); }}
      isCancel={false}
      title="Order Summary"
      desc="Please review your order before placing"
    >
      {/* Item list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {cartItems.map((item, index) => (
          <div key={`${item.id}-${index}`} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 56, height: 56, borderRadius: 10, overflow: "hidden", flexShrink: 0, background: "#f0f4ff" }}>
              <img src={item.imageUrl} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 600 }}>{item.name}</p>
              <p style={{ fontSize: 11, color: "#94a3b8" }}>{item.category}</p>
              <div style={{ display: "flex", gap: 12, marginTop: 2 }}>
                <p style={{ fontSize: 12, color: "#3b82f6" }}>{formatPrice(item.price)}</p>
                <p style={{ fontSize: 12, color: "#94a3b8" }}>× {item.qty}</p>
              </div>
            </div>
            <p style={{ fontWeight: 700, fontSize: 14 }}>{formatPrice(item.price * item.qty)}</p>
          </div>
        ))}
      </div>

      {/* Subtotal / Discount / Total */}
      <div style={{ height: 1, background: "#e5e7eb", margin: "16px 0" }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, color: "#94a3b8" }}>Subtotal</span>
          <span style={{ fontSize: 13, color: "#94a3b8" }}>{formatPrice(cartSummary.totalPrice)}</span>
        </div>
        {cartSummary.discount > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, color: "#22c55e" }}>Discount</span>
            <span style={{ fontSize: 13, color: "#22c55e" }}>-{formatPrice(cartSummary.discount)}</span>
          </div>
        )}
        <div style={{ height: 1, background: "#e5e7eb" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 600 }}>Total</span>
          <span style={{ fontSize: 22, fontWeight: 800, color: "#3b82f6" }}>{formatPrice(cartSummary.netTotal)}</span>
        </div>
      </div>

      {/* Payment method label */}
      <div style={{ marginTop: 20, marginBottom: 8 }}>
        <p style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500, textAlign: "center" }}>
          Select Payment Method
        </p>
      </div>

      {/* Actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>


        {/* Cancel */}
        <button
          onClick={onCancel}
          disabled={isLoading}
          style={{
            padding: "11px 0",
            borderRadius: 10,
            border: "1px solid rgba(239,68,68,0.3)",
            background: "rgba(239,68,68,0.08)",
            color: "#ef4444",
            fontSize: 13,
            fontWeight: 600,
            cursor: isLoading ? "not-allowed" : "pointer",
            opacity: isLoading ? 0.5 : 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
          }}
        >
          <X size={18} strokeWidth={2.2} />
          <span>Cancel</span>
        </button>

        {/* Cash */}
        <button
          onClick={() => onPlaceOrder("cash")}
          disabled={isLoading}
          style={{
            padding: "11px 0",
            borderRadius: 10,
            border: "none",
            background: isLoading ? "#94a3b8" : "linear-gradient(135deg, #22c55e, #16a34a)",
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            cursor: isLoading ? "not-allowed" : "pointer",
            boxShadow: isLoading ? "none" : "0 4px 14px rgba(34,197,94,0.35)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
          }}
        >
          <Banknote size={18} strokeWidth={2.2} />
          <span>{isLoading ? "Processing…" : "Cash"}</span>
        </button>

        {/* ABA / Scan QR */}
        <button
          onClick={() => onPlaceOrder("aba")}
          disabled={isLoading}
          style={{
            padding: "11px 0",
            borderRadius: 10,
            border: "none",
            background: isLoading ? "#94a3b8" : "linear-gradient(135deg, #3b82f6, #2563eb)",
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            cursor: isLoading ? "not-allowed" : "pointer",
            boxShadow: isLoading ? "none" : "0 4px 14px rgba(59,130,246,0.35)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
          }}
        >
          <QrCode size={18} strokeWidth={2.2} />
          <span>{isLoading ? "Processing…" : "Scan QR"}</span>
        </button>

      </div>
    </SharedDialog>
  );
}
