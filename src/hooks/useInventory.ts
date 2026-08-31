import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getProductBatches,
  getBatchById,
  createProductBatch,
  getInventory,
  getInventoryById,
  getStockMovements,
  getReturns,
  getReturnById,
} from "@/service/inventory.service";

// ─── Batches ────────────────────────────────────────────────

export const useProductBatches = (
  productId: number,
  params?: {
    search?: string;
    page?: number;
    limit?: number;
  }
) => {
  return useQuery({
    queryKey: ["product-batches", productId, params],
    queryFn: () => getProductBatches(productId, params),
    enabled: !!productId,
  });
};

export const useBatchDetail = (id: number) => {
  return useQuery({
    queryKey: ["batch-detail", id],
    queryFn: () => getBatchById(id),
    enabled: !!id,
  });
};

// ─── Inventory ──────────────────────────────────────────────

export const useInventory = (params?: {
  productId?: number;
  batchId?: number;
  categoryId?: number;
  stockStatus?: string;
  expiryStatus?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ["inventory", params],
    queryFn: () => getInventory(params),
    staleTime: 30_000,
  });
};

export const useInventoryDetail = (id: number) => {
  return useQuery({
    queryKey: ["inventory-detail", id],
    queryFn: () => getInventoryById(id),
    enabled: !!id,
  });
};

// ─── Create Batch (Receive Stock) ────────────────────────────

export const useCreateBatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, data }: { productId: number; data: { qty: number; expireDate?: string; batchNumber?: string; costPrice?: number } }) =>
      createProductBatch(productId, data),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ["product-batches", variables.productId] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["stock-movements"] });
    },
  });
};

// ─── Stock Movements ────────────────────────────────────────

export const useStockMovements = (params?: {
  productId?: number;
  batchId?: number;
  type?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ["stock-movements", params],
    queryFn: () => getStockMovements(params),
    staleTime: 30_000,
  });
};

// ─── Returns ────────────────────────────────────────────────

export const useReturns = (params?: {
  orderId?: number;
  productId?: number;
  status?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ["returns", params],
    queryFn: () => getReturns(params),
    staleTime: 30_000,
  });
};

export const useReturnDetail = (id: number) => {
  return useQuery({
    queryKey: ["return-detail", id],
    queryFn: () => getReturnById(id),
    enabled: !!id,
  });
};
