import type { IProduct, IProductBatch } from "./product";

export interface IInventory {
  id: number;
  batchId: number;
  productId: number;
  qty: number;
  availableQty: number;
  reservedQty: number;
  stockStatus: "AVAILABLE" | "LOW_STOCK" | "OUT_OF_STOCK" | "EXPIRED";
  productBatch: IProductBatch;
  product: IProduct;
  createdAt: string;
  updatedAt: string;
}

export interface IInventoryResponse {
  success: boolean;
  message: string;
  data: IInventory[];
}

export interface IStockMovement {
  id: number;
  batchId: number;
  productId: number;
  type: "PURCHASE" | "SALE" | "RETURN" | "ADJUSTMENT" | "DAMAGE" | "EXPIRED";
  qty: number;
  reason: string;
  reference: string;
  userId: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  batch: IProductBatch;
  product: IProduct;
  createdAt: string;
}

export interface IStockMovementResponse {
  success: boolean;
  message: string;
  data: IStockMovement[];
}

export interface IOrderDetailBatch {
  id: number;
  orderDetailId: number;
  batchId: number;
  qty: number;
  unitPrice: number;
  batch: IProductBatch;
  orderDetail: {
    id: number;
    orderId: number;
    productId: number;
    productName: string;
    qty: number;
  };
}

export interface IReturn {
  id: number;
  orderId: number;
  orderDetailId: number;
  productId: number;
  batchId: number;
  qty: number;
  reason: string;
  refundAmount: number;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  processedBy: number;
  processor: {
    id: number;
    name: string;
    email: string;
  };
  /** User who processed this return (snapshot from backend) */
  processedByUser?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: "admin" | "cashier";
  };
  order: {
    id: number;
    orderNumber: string;
    total: number;
  };
  product: IProduct;
  batch: IProductBatch;
  createdAt: string;
  updatedAt: string;
}

export interface IReturnResponse {
  success: boolean;
  message: string;
  data: IReturn[];
}

export interface IReturnUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: "admin" | "cashier";
}
