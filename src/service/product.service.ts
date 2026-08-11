import type { ProductSchema } from "../components/Products/ProductForm";
import type { IProductResponse } from "../types/product";
import api from "./libs/axios";

// ─── Fetch Products ───────────────────────────────────────
export const fetchProduct = async (
  search?: string,
  page: number = 1,
  limit: number = 10,
  categoryId?: number
) => {
  const data = await api.get<any, IProductResponse>("/api/v1/products", {
    params: { search, page, limit, categoryId },
  });
  return data;
};

// ─── Fetch Out-of-Stock Products ──────────────────────────
export const fetchOutOfStockProducts = async (
  search?: string,
  categoryId?: number
) => {
  const data = await api.get<any, IProductResponse>("/api/v1/products", {
    params: { search, categoryId, page: 1, limit: 100, inStock: false },
  });
  return data;
};

// ─── CRUD ─────────────────────────────────────────────────
export const createProduct = async (request: ProductSchema) => {
  return await api.post("/api/v1/products", request);
};

export const createBulkProducts = async (requests: ProductSchema[]) => {
  return await Promise.all(
    requests.map((item) => api.post("/api/v1/products", item))
  );
};

export const updateProduct = async (id: number, request: ProductSchema) => {
  return await api.put(`/api/v1/products/${id}`, request);
};

export const deleteProduct = async (id: number) => {
  return await api.delete(`/api/v1/products/${id}`);
};

// ─── Images ───────────────────────────────────────────────
export const uploadProductImage = async (id: number, file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return await api.post(`/api/v1/products/${id}/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deleteProductImage = async (imageId: number, productId: number) => {
  return await api.delete(`/api/v1/products/${productId}/images/${imageId}`);
};

// ─── Stock ────────────────────────────────────────────────
export const fetchProductStock = async (id: number) => {
  const res = await api.get(`/api/v1/products/${id}/stock`);
  return res;
};

export const stockIn = async (id: number, qty: number) => {
  const res = await api.patch(`/api/v1/products/${id}/stock/in`, { qty });
  return res;
};

export const stockOut = async (id: number, qty: number) => {
  const res = await api.patch(`/api/v1/products/${id}/stock/out`, { qty });
  return res;
};

export const fetchLowStockProducts = async (threshold?: number) => {
  const res = await api.get(`/api/v1/products/stock/low`, {
    params: { threshold },
  });
  return res;
};

// ─── Near-Expiry & Discounts ─────────────────────────────
export const fetchNearExpiryProducts = async (days: number = 7) => {
  const res = await api.get(`/api/v1/products/near-expiry`, {
    params: { days },
  });
  return res;
};

export const setProductDiscount = async (
  id: number,
  request: { discount_percent: number }
) => {
  const res = await api.patch(`/api/v1/products/${id}/discount`, request);
  return res;
};

// ─── Barcodes ─────────────────────────────────────────────

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

// Print all active products as barcode PDF
export const printAllBarcodes = async () => {
  const res = await api.get("/api/v1/products/barcodes/print", {
    responseType: "blob",
  });
  const blob = new Blob([res as any], { type: "application/pdf" });
  downloadBlob(blob, "product-labels.pdf");
};

// Print a single product barcode PDF
export const printSingleBarcode = async (id: number) => {
  const res = await api.get(`/api/v1/products/${id}/barcode/print`, {
    responseType: "blob",
  });
  const blob = new Blob([res as any], { type: "application/pdf" });
  downloadBlob(blob, `label-${id}.pdf`);
};

// Print selected product IDs as barcode PDF
export const printSelectedBarcodes = async (ids: number[]) => {
  const res = await api.post(
    "/api/v1/products/barcodes/print",
    { ids },
    { responseType: "blob" }
  );
  const blob = new Blob([res as any], { type: "application/pdf" });
  downloadBlob(blob, "selected-labels.pdf");
};

export const getBarcodeImageUrl = (id: number): string => {
  return `${import.meta.env.VITE_API_URL}/api/v1/products/${id}/barcode`;
};