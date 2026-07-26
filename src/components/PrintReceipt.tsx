import { Printer, X, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import type { ICart } from "@/types/cart";

interface PrintReceiptProps {
  cartItems: ICart[];
  total: number;
  orderId?: number | null;
  formatPrice: (usd: number) => string;
  onClose: () => void;
}

export default function PrintReceipt({
  cartItems,
  total,
  orderId,
  formatPrice,
  onClose,
}: PrintReceiptProps) {
  const [isPrinting, setIsPrinting] = useState(false);

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit",
  });

  // ── Preload the logo image into browser cache so window.print()
  //    doesn't wait for a fresh network request. ────────────
  useEffect(() => {
    const img = new Image();
    img.src = "/logo.png";
  }, []);

  const handlePrint = useCallback(() => {
    setIsPrinting(true);

    // Use requestAnimationFrame to let React paint the loading state
    // before window.print() blocks the main thread.
    requestAnimationFrame(() => {
      setTimeout(() => {
        window.print();
        setIsPrinting(false);
      }, 80);
    });
  }, []);

  return (
    <>
      {/* ── Print styles injected globally ── */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #receipt-overlay, #receipt-overlay * { visibility: visible !important; }
          #receipt-overlay {
            position: fixed !important;
            inset: 0 !important;
            background: white !important;
            z-index: 9999 !important;
            display: flex !important;
            align-items: flex-start !important;
            justify-content: center !important;
            padding: 0 !important;
          }
          #receipt-paper {
            box-shadow: none !important;
            border: none !important;
            width: 80mm !important;
            max-height: none !important;
            overflow: visible !important;
            margin: 0 auto !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* ── Overlay ── */}
      <div
        id="receipt-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      >
        {/* ── Receipt Paper ── */}
        <div
          id="receipt-paper"
          className="bg-white rounded-lg shadow-2xl w-[340px] max-h-[90vh] overflow-y-auto"
          style={{ fontFamily: "'Courier New', monospace" }}
        >
          {/* Header */}
          <div className="text-center px-6 pt-6 pb-3 border-b border-dashed border-gray-300">
            <div className="flex justify-center mb-2">
              <img src="/logo.png" alt="logo"
                className="h-14 w-14 object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            </div>
            <h2 className="text-lg font-bold tracking-widest uppercase">Levarstore</h2>
            <p className="text-xs text-gray-500">POS System</p>
            <p className="text-xs text-gray-400 mt-1">{dateStr} — {timeStr}</p>
            {orderId && (
              <p className="text-xs text-gray-500 mt-1">
                Order #<span className="font-bold">{orderId}</span>
              </p>
            )}
          </div>

          {/* Items */}
          <div className="px-6 py-3">
            <div className="flex justify-between text-xs font-bold text-gray-500 uppercase mb-2">
              <span>Item</span>
              <span>Subtotal</span>
            </div>
            <div className="space-y-2">
              {cartItems.map((item, i) => (
                <div key={`${item.id}-${i}`}>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium truncate max-w-[180px]">{item.name}</span>
                    <span className="font-semibold">{formatPrice(item.price * item.qty)}</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    {formatPrice(item.price)} × {item.qty}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="px-6 py-3 border-t border-dashed border-gray-300">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>Discount</span>
              <span>$0.00</span>
            </div>
            <div className="flex justify-between text-base font-bold mt-2 pt-2 border-t border-gray-200">
              <span>TOTAL</span>
              <span className="text-blue-600">{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between text-sm text-green-600 mt-1">
              <span>Paid (ABA)</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center px-6 pb-4 pt-2 border-t border-dashed border-gray-300">
            <p className="text-xs text-gray-400">Thank you for shopping!</p>
            <p className="text-xs text-gray-400">Please come again 😊</p>
            <div className="mt-3 flex justify-center">
              <div className="text-[8px] tracking-[0.3em] text-gray-300 uppercase">
                ★ ★ ★ ★ ★
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="no-print flex gap-2 px-6 pb-5">
            <button
              onClick={onClose}
              disabled={isPrinting}
              className="flex-1 py-2 rounded-lg border border-gray-300
                         text-sm text-gray-600 hover:bg-gray-50 transition-colors
                         flex items-center justify-center gap-1.5
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X size={16} />
              Close
            </button>
            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className="flex-1 py-2 rounded-lg bg-blue-600 text-white
                         text-sm font-semibold hover:bg-blue-700 transition-colors
                         flex items-center justify-center gap-1.5
                         disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isPrinting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Printer size={16} />
              )}
              {isPrinting ? "Printing…" : "Print"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
