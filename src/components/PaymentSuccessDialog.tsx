import SharedDialog from "@/components/SharedDialog";

interface PaymentSuccessDialogProps {
  open: boolean;
  onClose: (val: boolean) => void;
  onPrintReceipt: () => void;
}

export default function PaymentSuccessDialog({ open, onClose, onPrintReceipt }: PaymentSuccessDialogProps) {
  return (
    <SharedDialog open={open} setOpen={onClose} isCancel={false} title="Payment Confirmed!" width="35%">
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 0" }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(34,197,94,0.12)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
          <span style={{ fontSize: 40 }}>✅</span>
        </div>
        <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Order Completed!</p>
        <p style={{ fontSize: 13, color: "#94a3b8", textAlign: "center" }}>Payment received. Stock has been updated.</p>
        <button
          onClick={onPrintReceipt}
          style={{ marginTop: 20, padding: "11px 32px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #3b82f6, #2563eb)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 14px rgba(59,130,246,0.35)" }}
        >
          🖨️ Print Receipt
        </button>
      </div>
    </SharedDialog>
  );
}