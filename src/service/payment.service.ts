import api from "@/service/libs/axios";

// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface KHQRResult {
  qr: string;
  md5: string;
}

export interface IndividualKHQRParams {
  bakongAccountID: string;
  merchantName: string;
  merchantCity?: string;
  currency?: "usd" | "khr";
  amount?: number;
  accountInformation?: string;
  acquiringBank?: string;
  billNumber?: string;
  mobileNumber?: string;
  storeLabel?: string;
  terminalLabel?: string;
  purposeOfTransaction?: string;
  languagePreference?: string;
  merchantNameAlternateLanguage?: string;
  merchantCityAlternateLanguage?: string;
  upiMerchantAccount?: string;
  merchantCategoryCode?: string;
  expiryMinutes?: number;
}

export interface MerchantKHQRParams extends IndividualKHQRParams {
  merchantID: string;
  acquiringBank: string;
}

export interface DeepLinkParams {
  qr: string;
  apiUrl: string;
  appName: string;
  appIconUrl: string;
  appDeepLinkCallBack: string;
}

export interface KHQRDecoded {
  bakongAccountID?: string;
  merchantName?: string;
  merchantCity?: string;
  currency?: number;
  amount?: number;
  billNumber?: string;
  mobileNumber?: string;
  storeLabel?: string;
  terminalLabel?: string;
  purposeOfTransaction?: string;
  merchantCategoryCode?: string;
  [key: string]: unknown;
}

// ─── NOTE ─────────────────────────────────────────────────────────────────────
// The axios instance interceptor already does:
//   (response) => response.data
// So api.post() returns response.data directly — never wrap in { data }.
// ─────────────────────────────────────────────────────────────────────────────

// ─── ABA PAYWAY TYPES ─────────────────────────────────────────────────────────

/** The hidden form fields ABA PayWay needs to trigger checkout */
export interface AbaPaywayForm {
  method: string;                      // "POST"
  action: string;                      // ABA checkout URL
  target: string;                      // "_blank" | "aba_webservice"
  fields: Record<string, string | number>; // all hidden input key/values
}

// Paths are relative to baseURL, which already includes /api/v1

/** What POST /payments/:orderId returns (interceptor already unwrapped) */
export interface CreatePaymentResponse {
  success: boolean;
  data: {
    payway: AbaPaywayForm;
    [key: string]: unknown;
  };
}

/** What POST /payments/:tranId/check returns */
export interface CheckPaymentResponse {
  success: boolean;
  status: string;           // "0" = success, other = failed
  message?: string;
  [key: string]: unknown;
}

// ─── PAYMENTS ─────────────────────────────────────────────────────────────────

/** POST /payments/:orderId — returns ABA PayWay form fields */
export const createPayment = async (
  orderId: number
): Promise<CreatePaymentResponse> => {
  return api.post(`/payments/${orderId}`);
};

/** POST /payments/:tranId/check — verify ABA payment result */
export const checkPayment = async (
  tranId: string
): Promise<CheckPaymentResponse> => {
  return api.post(`/payments/${tranId}/check`);
};

// ─── ORDERS ───────────────────────────────────────────────────────────────────

/**
 * POST /orders/:id/confirm
 * Deducts stock and moves order from "pending" → "confirmed".
 * Must be called after ABA redirects back with status=0.
 */
export const confirmOrder = async (orderId: number, paymentMethod?: string): Promise<{ success: boolean }> => {
  return api.post(`/orders/${orderId}/confirm`, paymentMethod ? { paymentMethod } : {});
};

// ─── KHQR ─────────────────────────────────────────────────────────────────────
// KHQR endpoints live outside the v1 API, so they use a direct fetch against
// VITE_API_URL + /api (not the v1 axios instance).

const apiBase = (import.meta.env.VITE_API_URL as string).replace(/\/api\/v1$/, "");

async function khqrPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${apiBase}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
  });
  if (!res.ok) throw new Error(`KHQR ${path} failed: ${res.status}`);
  return res.json();
}

/** POST /api/payment/khqr/individual */
export const generateIndividualKHQR = async (
  params: IndividualKHQRParams
): Promise<{ success: boolean; data: KHQRResult }> =>
  khqrPost("/api/payment/khqr/individual", params);

/** POST /api/payment/khqr/merchant */
export const generateMerchantKHQR = async (
  params: MerchantKHQRParams
): Promise<{ success: boolean; data: KHQRResult }> =>
  khqrPost("/api/payment/khqr/merchant", params);

/** POST /api/payment/khqr/verify */
export const verifyKHQR = async (
  qr: string
): Promise<{ success: boolean; data: { isValid: boolean } }> =>
  khqrPost("/api/payment/khqr/verify", { qr });

/** POST /api/payment/khqr/decode */
export const decodeKHQR = async (
  qr: string
): Promise<{ success: boolean; data: KHQRDecoded }> =>
  khqrPost("/api/payment/khqr/decode", { qr });

/** POST /api/payment/khqr/deeplink */
export const generateDeepLink = async (
  params: DeepLinkParams
): Promise<{ success: boolean; data: { shortLink: string } }> =>
  khqrPost("/api/payment/khqr/deeplink", params);