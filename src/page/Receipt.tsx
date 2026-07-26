// src/components/Receipt.tsx
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Printer, Download, X } from "lucide-react";

interface ReceiptItem {
  name: string;
  qty: number;
  price: number;
}

interface ReceiptProps {
  orderNumber: string;
  items: ReceiptItem[];
  subtotal: number;
  discount?: number;
  total: number;
  paymentMethod?: "cash" | "aba_khqr";
  cashReceived?: number;
  onClose?: () => void;
}

const Receipt = ({
  orderNumber,
  items,
  subtotal,
  discount = 0,
  total,
  paymentMethod = "cash",
  cashReceived = 0,
  onClose,
}: ReceiptProps) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  const change = cashReceived - total;
  const now = new Date();
  const dateStr = now.toLocaleDateString("km-KH", {
    year: "numeric", month: "long", day: "numeric",
  });
  const timeStr = now.toLocaleTimeString("km-KH", {
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });

  // ✅ Browser Print
  const handlePrint = () => {
    const printContents = receiptRef.current?.innerHTML;
    if (!printContents) return;

    const win = window.open("", "_blank", "width=400,height=600");
    if (!win) return;

    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${orderNumber}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              width: 80mm;
              padding: 8px;
              color: #000;
            }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .divider { border-top: 1px dashed #000; margin: 6px 0; }
            .row { display: flex; justify-content: space-between; margin: 2px 0; }
            .item-name { flex: 1; }
            .item-qty { width: 30px; text-align: center; }
            .item-price { width: 60px; text-align: right; }
            .total-row { font-size: 14px; font-weight: bold; }
            .shop-name { font-size: 18px; font-weight: bold; }
            .thank-you { font-size: 13px; font-style: italic; }
            @media print {
              body { width: 80mm; }
            }
          </style>
        </head>
        <body>${printContents}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 300);
  };

  // ✅ Download PDF (via html2canvas + jsPDF alternative — use browser print to PDF)
  const handleDownloadPDF = () => {
    handlePrint(); // browser print dialog allows "Save as PDF"
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">

        {/* ── Action Buttons ── */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
          <span className="font-semibold text-sm text-gray-700">Receipt</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handlePrint}
              className="flex items-center gap-1 text-blue-600 border-blue-300 hover:bg-blue-50">
              <Printer className="h-3.5 w-3.5" /> Print
            </Button>
            <Button size="sm" variant="outline" onClick={handleDownloadPDF}
              className="flex items-center gap-1 text-green-600 border-green-300 hover:bg-green-50">
              <Download className="h-3.5 w-3.5" /> PDF
            </Button>
            {onClose && (
              <Button size="sm" variant="ghost" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* ── Receipt Content ── */}
        <div className="overflow-y-auto max-h-[80vh] p-4">
          <div ref={receiptRef} style={{ fontFamily: "'Courier New', monospace", fontSize: "12px", color: "#000" }}>

            {/* Shop Header */}
            <div className="center" style={{ textAlign: "center", marginBottom: "8px" }}>
              <div className="shop-name bold" style={{ fontSize: "18px", fontWeight: "bold" }}>
                🏪 LEVAR STORE
              </div>
              <div style={{ fontSize: "11px", marginTop: "2px" }}>
                Tel: 012-345-678
              </div>
              <div style={{ fontSize: "11px" }}>
                Phnom Penh, Cambodia
              </div>
            </div>

            {/* Divider */}
            <div className="divider" style={{ borderTop: "1px dashed #000", margin: "8px 0" }} />

            {/* Order Info */}
            <div style={{ marginBottom: "6px" }}>
              <div className="row" style={{ display: "flex", justifyContent: "space-between", margin: "2px 0" }}>
                <span>Order #:</span>
                <span className="bold" style={{ fontWeight: "bold" }}>{orderNumber}</span>
              </div>
              <div className="row" style={{ display: "flex", justifyContent: "space-between", margin: "2px 0" }}>
                <span>Date:</span>
                <span>{dateStr}</span>
              </div>
              <div className="row" style={{ display: "flex", justifyContent: "space-between", margin: "2px 0" }}>
                <span>Time:</span>
                <span>{timeStr}</span>
              </div>
              <div className="row" style={{ display: "flex", justifyContent: "space-between", margin: "2px 0" }}>
                <span>Payment:</span>
                <span className="bold" style={{ fontWeight: "bold" }}>
                  {paymentMethod === "aba_khqr" ? "ABA KHQR" : "Cash"}
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="divider" style={{ borderTop: "1px dashed #000", margin: "8px 0" }} />

            {/* Items Header */}
            <div className="row bold" style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", marginBottom: "4px" }}>
              <span style={{ flex: 1 }}>Item</span>
              <span style={{ width: "30px", textAlign: "center" }}>Qty</span>
              <span style={{ width: "70px", textAlign: "right" }}>Amount</span>
            </div>

            <div className="divider" style={{ borderTop: "1px dashed #000", margin: "4px 0" }} />

            {/* Items */}
            {items.map((item, i) => (
              <div key={i} style={{ marginBottom: "4px" }}>
                <div style={{ fontSize: "11px", fontWeight: "bold" }}>{item.name}</div>
                <div className="row" style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ flex: 1, fontSize: "10px", color: "#555" }}>
                    ${item.price.toFixed(2)} × {item.qty}
                  </span>
                  <span style={{ width: "70px", textAlign: "right", fontWeight: "bold" }}>
                    ${(item.price * item.qty).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}

            {/* Divider */}
            <div className="divider" style={{ borderTop: "1px dashed #000", margin: "8px 0" }} />

            {/* Totals */}
            <div style={{ marginBottom: "4px" }}>
              <div className="row" style={{ display: "flex", justifyContent: "space-between", margin: "2px 0" }}>
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="row" style={{ display: "flex", justifyContent: "space-between", margin: "2px 0", color: "green" }}>
                  <span>Discount:</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="divider" style={{ borderTop: "1px dashed #000", margin: "4px 0" }} />
              <div className="row total-row" style={{ display: "flex", justifyContent: "space-between", fontSize: "15px", fontWeight: "bold", margin: "4px 0" }}>
                <span>TOTAL:</span>
                <span>${total.toFixed(2)}</span>
              </div>
              {paymentMethod === "cash" && cashReceived > 0 && (
                <>
                  <div className="row" style={{ display: "flex", justifyContent: "space-between", margin: "2px 0" }}>
                    <span>Cash Received:</span>
                    <span>${cashReceived.toFixed(2)}</span>
                  </div>
                  <div className="row" style={{ display: "flex", justifyContent: "space-between", margin: "2px 0", fontWeight: "bold" }}>
                    <span>Change:</span>
                    <span>${Math.max(0, change).toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Divider */}
            <div className="divider" style={{ borderTop: "1px dashed #000", margin: "8px 0" }} />

            {/* Footer */}
            <div className="center" style={{ textAlign: "center", marginTop: "8px" }}>
              <div className="thank-you" style={{ fontSize: "13px", fontStyle: "italic" }}>
                អរគុណសម្រាប់ការជ្រើសរើស!
              </div>
              <div style={{ fontSize: "11px", marginTop: "4px" }}>
                Thank you for your purchase!
              </div>
              <div style={{ fontSize: "10px", marginTop: "6px", color: "#555" }}>
                *** Please come again ***
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Receipt;