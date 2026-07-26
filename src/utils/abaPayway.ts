declare const AbaPayway: any;

interface AbaPaywayForm {
  method: string;
  action: string;
  target: string;
  fields: Record<string, string | number>;
}

// ✅ Exact field order ABA PayWay expects in the form
const ABA_FIELD_ORDER = [
  "req_time",
  "merchant_id",
  "tran_id",
  "amount",
  "items",
  "shipping",
  "firstname",
  "lastname",
  "email",
  "phone",
  "type",
  "payment_option",
  "currency",
  "return_url",
  "cancel_url",
  "continue_success_url",
  "hash",
  "view_type",
];

export function launchAbaCheckout(
  payway: AbaPaywayForm,
  onSuccess?: (tranId: string) => void,
  onFail?: () => void
): boolean {
  // Remove any stale form
  const existingForm = document.getElementById("aba_merchant_request");
  if (existingForm) existingForm.remove();

  const form = document.createElement("form");
  form.id     = "aba_merchant_request";
  form.method = payway.method;
  form.action = payway.action;
  form.target = payway.target;


  ABA_FIELD_ORDER.forEach((key) => {
    const value = payway.fields[key];
    if (value === undefined || value === null) return;
    const input = document.createElement("input");
    input.type  = "hidden";
    input.name  = key;
    input.value = String(value);
    form.appendChild(input);
  });

  // Append any extra fields not in the ordered list
  Object.entries(payway.fields).forEach(([key, value]) => {
    if (ABA_FIELD_ORDER.includes(key)) return;
    const input = document.createElement("input");
    input.type  = "hidden";
    input.name  = key;
    input.value = String(value);
    form.appendChild(input);
  });

  document.body.appendChild(form);

  if (typeof AbaPayway === "undefined") {
    console.error("❌ AbaPayway SDK not loaded!");
    return false;
  }

  const messageHandler = (event: MessageEvent) => {
    const data = event.data;
    if (!data || typeof data !== "object") return;

    if (data._abaCallbackOnSuccess) {
      const cb = data._abaCallbackOnSuccess;
      console.log(" ABA _abaCallbackOnSuccess:", JSON.stringify(cb));

      if (cb.action === "approved" || cb.step === "payment_success") {
        window.removeEventListener("message", messageHandler);
        const tranId = cb.transaction_summary?.order_details?.order_id || "";
        onSuccess?.(tranId);
      }
      return;
    }

    if (data.removeClose) {
      console.log("📱 ABA QR scanned — waiting for approval...");
      return;
    }
  };

  window.addEventListener("message", messageHandler);


  (window as any).onAbaPaymentSuccess = (data: any) => {
    console.log(" onAbaPaymentSuccess fired!", data);
    window.removeEventListener("message", messageHandler);
    onSuccess?.(data?.tran_id || "");
  };

  (window as any).onAbaPaymentCancel = () => {
    console.log("❌ onAbaPaymentCancel fired!");
    window.removeEventListener("message", messageHandler);
    onFail?.();
  };

  console.log(" AbaPayway.checkout() calling...");
  setTimeout(() => AbaPayway.checkout(), 150);
  return true;
}