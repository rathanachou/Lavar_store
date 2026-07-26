import api from "@/service/libs/axios";

// ─── TYPES ────────────────────────────────────────────────

export interface OrderItem {
  productId: number;
  qty: number;
}

export interface OrderPayload {
  discount: number;
  items: OrderItem[];
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

/** POST /api/v1/orders — creates order (pending, no stock deduction) */
export const createOrder = async (
  payload: OrderPayload
): Promise<{ success: boolean; data: OrderResponse }> =>
  api.post("/api/v1/orders", payload);

/** GET /api/v1/orders */
export const getOrders = async (
  params?: GetOrdersParams
): Promise<{ success: boolean; data: OrderResponse[] }> =>
  api.get("/api/v1/orders", { params });

/** GET /api/v1/orders/:id */
export const getOrderById = async (
  id: number
): Promise<{ success: boolean; data: OrderResponse }> =>
  api.get(`/api/v1/orders/${id}`);

/** PATCH /api/v1/orders/:id/cancel — cancels order, restores stock if completed */
export const cancelOrder = async (
  id: number,
  reason?: string
): Promise<{ success: boolean }> =>
  api.patch(`/api/v1/orders/${id}/cancel`, { reason });

/** POST /api/v1/orders/:id/confirm — deducts stock, marks order completed */
export const completeOrder = async (
  id: number
): Promise<{ success: boolean }> =>
  api.post(`/api/v1/orders/${id}/confirm`);

/** GET /api/v1/orders/:id/doc */
export const generateOrderDoc = async (
  id: number
): Promise<{ success: boolean; data: Blob }> =>
  api.get(`/api/v1/orders/${id}/doc`, { responseType: "blob" });