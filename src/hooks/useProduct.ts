import {
  createProduct,
  deleteProduct,
  deleteProductImage,
  fetchProduct,
  fetchOutOfStockProducts,
  updateProduct,
  uploadProductImage,
  fetchProductStock,
  stockIn,
  stockOut,
  fetchLowStockProducts,
} from "@/service/product.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useProduct = (
  search?: string,
  page?: number,
  limit?: number,
  categoryId?: number
) => {
  return useQuery({
    queryKey: ["products", search, page, limit, categoryId],
    queryFn: () => fetchProduct(search, page, limit, categoryId),
  });
};

export const useOutOfStockProducts = (search?: string, categoryId?: number) => {
  return useQuery({
    queryKey: ["products-out-of-stock", search, categoryId],
    queryFn: () => fetchOutOfStockProducts(search, categoryId),
    retry: false,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      toast.success("Product created successfully");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["products-out-of-stock"] });
      queryClient.invalidateQueries({ queryKey: ["products-low-stock"] }); 
    },
    onError: (error: Error) => {
      toast.error("Failed to create product");
      console.error("Failed to create product", error);
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: any }) =>
      updateProduct(id, request),
    onSuccess: () => {
      toast.success("Product updated successfully");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["products-out-of-stock"] });
      queryClient.invalidateQueries({ queryKey: ["products-low-stock"] }); 
    },
    onError: (error: Error) => {
      toast.error("Failed to update product");
      console.error("Failed to update product", error);
    },
  });
};

export const useUploadProductImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: File }) =>
      uploadProductImage(id, request),
    onSuccess: () => {
      toast.success("Product image uploaded successfully");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error: Error) => {
      toast.error("Failed to upload product image");
      console.error("Failed to upload product image", error);
    },
  });
};

export const useDeleteProductImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, productId }: { id: number; productId: number }) =>
      deleteProductImage(id, productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error: any) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      const status = error?.response?.status;
      if (status !== 404) {
        toast.error("Failed to delete product image");
        console.error("Failed to delete product image", error);
      }
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteProduct(id),
    onSuccess: () => {
      toast.success("Product deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["products"], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["products-out-of-stock"], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["products-low-stock"], refetchType: "all" }); 
    },
    onError: (error: Error) => {
      toast.error("Failed to delete product");
      console.error("Failed to delete product", error);
    },
  });
};

export const useProductStock = (id: number) => {
  return useQuery({
    queryKey: ["product-stock", id],
    queryFn: () => fetchProductStock(id),
    enabled: !!id,
  });
};

export const useStockIn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, qty }: { id: number; qty: number }) => stockIn(id, qty),
    onSuccess: (_, variables) => {
      toast.success("Stock added successfully");
      queryClient.invalidateQueries({ queryKey: ["product-stock", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["products-out-of-stock"] });
      queryClient.invalidateQueries({ queryKey: ["products-low-stock"] });
    },
    onError: () => {
      toast.error("Failed to add stock ❌");
    },
  });
};

export const useStockOut = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, qty }: { id: number; qty: number }) => stockOut(id, qty),
    onSuccess: (_, variables) => {
      toast.success("Stock deducted successfully");
      queryClient.invalidateQueries({ queryKey: ["product-stock", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["products-out-of-stock"] });
      queryClient.invalidateQueries({ queryKey: ["products-low-stock"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to deduct stock");
    },
  });
};

export const useLowStockProducts = (threshold?: number) => {
  return useQuery({
    queryKey: ["products-low-stock", threshold],
    queryFn: () => fetchLowStockProducts(threshold),
    retry: false,
  });
};