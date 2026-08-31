import api from "./libs/axios";
import type { IProductBatch } from "../types/product";

// Paths are relative to baseURL, which already includes /api/v1

export interface GetBatchesParams {
  productId?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface BatchResponse {
  success: boolean;
  message: string;
  data: IProductBatch[];
  pagination?: {
    total: number;
    limit: number;
    currentPage: number;
    prevPage: number | null;
    nextPage: number | null;
  };
}

/** GET /products/:id/batches */
export const getProductBatches = async (
  productId: number,
  params?: GetBatchesParams
): Promise<BatchResponse> =>
  api.get(`/products/${productId}/batches`, { params });

/** GET /batches/:id */
export const getBatchById = async (id: number): Promise<{ success: boolean; data: IProductBatch }> =>
  api.get(`/batches/${id}`);

/** POST /products/:id/batches */
export const createProductBatch = async (
  productId: number,
  data: {
    batchNumber?: string;
    qty: number;
    expireDate?: string;
    receivedDate?: string;
    costPrice?: number;
  }
): Promise<{ success: boolean; data: IProductBatch }> =>
  api.post(`/products/${productId}/batches`, data);

/** PUT /batches/:id */
export const updateProductBatch = async (
  id: number,
  data: {
    batchNumber?: string;
    qty?: number;
    expireDate?: string;
    receivedDate?: string;
    costPrice?: number;
  }
): Promise<{ success: boolean; data: IProductBatch }> =>
  api.put(`/batches/${id}`, data);

/** DELETE /batches/:id */
export const deleteProductBatch = async (id: number): Promise<{ success: boolean }> =>
  api.delete(`/batches/${id}`);

/** GET /inventory */
export const getInventory = async (params?: {
  productId?: number;
  batchId?: number;
  categoryId?: number;
  stockStatus?: string;
  expiryStatus?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ success: boolean; data: any[]; pagination?: any }> =>
  api.get("/inventory", { params });

/** GET /inventory/:id */
export const getInventoryById = async (id: number): Promise<{ success: boolean; data: any }> =>
  api.get(`/inventory/${id}`);

/** GET /stock-movements */
export const getStockMovements = async (params?: {
  productId?: number;
  batchId?: number;
  type?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}): Promise<{ success: boolean; data: any[]; pagination?: any }> =>
  api.get("/stock-movements", { params });

/** GET /returns */
export const getReturns = async (params?: {
  orderId?: number;
  productId?: number;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{ success: boolean; data: any[]; pagination?: any }> =>
  api.get("/returns", { params });

/** GET /returns/:id */
export const getReturnById = async (id: number): Promise<{ success: boolean; data: any }> =>
  api.get(`/returns/${id}`);

/** POST /returns */
export const createReturn = async (data: {
  orderId: number;
  orderDetailId: number;
  productId: number;
  batchId: number;
  qty: number;
  reason: string;
}): Promise<{ success: boolean; data: any }> =>
  api.post("/returns", data);
