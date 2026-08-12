import api from "@/service/libs/axios";

// ─── TYPES ────────────────────────────────────────────────

export interface OrderItem {
  productId: number;
  qty: number;
}

export interface OrderPayload {
  discount: number;
  items: OrderItem[];
  /** Display currency at POS checkout — "USD" | "KHR". Backend defaults to USD. */
  currency?: "USD" | "KHR";
}

export interface OrderResponse {
  id: number;
  total: number;
  discount: number;
  status: string;
  createdAt: string;
  [key: string]: unknown;
}

export interface GetOrdersParams {
  page?: number;
  limit?: number;
  search?: string;
}

// ─── SERVICES ─────────────────────────────────────────────
// Paths are relative to baseURL, which already includes /api/v1

/** POST /orders — creates order (pending, no stock deduction) */
export const createOrder = async (
  payload: OrderPayload
): Promise<{ success: boolean; data: OrderResponse }> =>
  api.post("/orders", payload);

/** GET /orders */
export const getOrders = async (
  params?: GetOrdersParams
): Promise<{ success: boolean; data: OrderResponse[] }> =>
  api.get("/orders", { params });

/** GET /orders/:id */
export const getOrderById = async (
  id: number
): Promise<{ success: boolean; data: OrderResponse }> =>
  api.get(`/orders/${id}`);

/** PATCH /orders/:id/cancel — cancels order, restores stock if completed */
export const cancelOrder = async (
  id: number,
  reason?: string
): Promise<{ success: boolean }> =>
  api.patch(`/orders/${id}/cancel`, { reason });

/** POST /orders/:id/confirm — deducts stock, marks order completed */
export const completeOrder = async (
  id: number
): Promise<{ success: boolean }> =>
  api.post(`/orders/${id}/confirm`);

/** GET /orders/:id/doc */
export const generateOrderDoc = async (
  id: number
): Promise<{ success: boolean; data: Blob }> =>
  api.get(`/orders/${id}/doc`, { responseType: "blob" });