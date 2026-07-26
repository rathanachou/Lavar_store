import { cancelOrder, completeOrder, createOrder, generateOrderDoc, getOrderById, getOrders, type GetOrdersParams, type OrderPayload, } from "@/service/orders.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: OrderPayload) => createOrder(payload),
    onSuccess: () => {
      toast.success("Order created successfully! 🛒");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });              
      queryClient.invalidateQueries({ queryKey: ["products-out-of-stock"] }); 
      queryClient.invalidateQueries({ queryKey: ["products-low-stock"] });    
    },
    onError: (error: Error) => {
      toast.error("Failed to create order ❌");
      console.error(error);
    },
  });
};

export const useOrders = (params?: GetOrdersParams) =>
  useQuery({
    queryKey: ["orders", params],
    queryFn: () => getOrders(params),
  });

export const useOrderById = (id: number) =>
  useQuery({
    queryKey: ["orders", id],
    queryFn: () => getOrderById(id),
    enabled: !!id,
  });

export const useGenerateOrderDoc = () =>
  useMutation({
    mutationFn: (id: number) => generateOrderDoc(id),
    onSuccess: (data, id) => {
      const url = window.URL.createObjectURL(data.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `order-${id}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success("Document downloaded! 📄");
    },
    onError: () => toast.error("Failed to generate document ❌"),
  });

export const useCancelOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) => cancelOrder(id, reason),
    onSuccess: () => {
      toast.success("Order cancelled — Stock restored");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });             
      queryClient.invalidateQueries({ queryKey: ["products-out-of-stock"] }); 
      queryClient.invalidateQueries({ queryKey: ["products-low-stock"] });   
    },
    onError: () => toast.error("Failed to cancel order ❌"),
  });
};

export const useCompleteOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => completeOrder(id),
    onSuccess: () => {
      toast.success("Order completed! ");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });             
      queryClient.invalidateQueries({ queryKey: ["products-out-of-stock"] }); 
      queryClient.invalidateQueries({ queryKey: ["products-low-stock"] });    
    },
    onError: () => toast.error("Failed to complete order ❌"),
  });
};