import {
  createPayment,
  checkPayment,
  confirmOrder,
  generateIndividualKHQR,
  generateMerchantKHQR,
  verifyKHQR,
  decodeKHQR,
  generateDeepLink,
  type IndividualKHQRParams,
  type MerchantKHQRParams,
  type DeepLinkParams,
} from "@/service/payment.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// ─── Invalidate All Product Caches ────────────────────────
const invalidateProductCaches = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: ["products"] });
  queryClient.invalidateQueries({ queryKey: ["products-out-of-stock"] });
  queryClient.invalidateQueries({ queryKey: ["products-low-stock"] });
  queryClient.invalidateQueries({ queryKey: ["product-stock"] });
  queryClient.invalidateQueries({ queryKey: ["categories"] }); 
};

// ─── Create Payment ───────────────────────────────────────
export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: number) => createPayment(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
    onError: (error: Error) => {
      toast.error("Failed to create payment ❌");
      console.error("Failed to create payment", error);
    },
  });
};

// ─── Check Payment ────────────────────────────────────────
export const useCheckPayment = () => {
  return useMutation({
    mutationFn: (tranId: string) => checkPayment(tranId),
  });
};

// ─── Confirm Order ────────────────────────────────────────
// Called after:
//   1. ABA redirects back with tran_id + status=0
//   2. Cash payment — confirm immediately after createOrder
// Deducts stock and marks order as completed.
export const useConfirmOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, paymentMethod }: { orderId: number; paymentMethod?: string }) =>
      confirmOrder(orderId, paymentMethod),
    onSuccess: () => {
      toast.success("Order confirmed — stock updated ", {
        description: "Dashboard stats have been refreshed.",
        duration: 5000,
      });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      invalidateProductCaches(queryClient); //  updates POS product stock display
      // ── Notify Dashboard (uses useState, not React Query) ──
      try {
        const bc = new BroadcastChannel("pos_payment_confirmed");
        bc.postMessage({ type: "ORDER_CONFIRMED", ts: Date.now() });
        bc.close();
      } catch {
        // BroadcastChannel unavailable in old browsers — safe to ignore
      }
    },
    onError: (error: Error) => {
      toast.error("Failed to confirm order ");
      console.error("Failed to confirm order", error);
    },
  });
};

// ─── KHQR ─────────────────────────────────────────────────

export const useGenerateIndividualKHQR = () =>
  useMutation({
    mutationFn: (params: IndividualKHQRParams) => generateIndividualKHQR(params),
    onError: (error: Error) => {
      toast.error("Failed to generate QR code ");
      console.error("Failed to generate individual KHQR", error);
    },
  });

export const useGenerateMerchantKHQR = () =>
  useMutation({
    mutationFn: (params: MerchantKHQRParams) => generateMerchantKHQR(params),
    onError: (error: Error) => {
      toast.error("Failed to generate merchant QR code ");
      console.error("Failed to generate merchant KHQR", error);
    },
  });

export const useVerifyKHQR = () =>
  useMutation({
    mutationFn: (qr: string) => verifyKHQR(qr),
    onSuccess: (res) => {
      res.data.isValid
        ? toast.success("QR code is valid ")
        : toast.warning("QR code is invalid ");
    },
    onError: (error: Error) => {
      toast.error("Failed to verify QR code ");
      console.error("Failed to verify KHQR", error);
    },
  });

export const useDecodeKHQR = () =>
  useMutation({
    mutationFn: (qr: string) => decodeKHQR(qr),
    onError: (error: Error) => {
      toast.error("Failed to decode QR code ❌");
      console.error("Failed to decode KHQR", error);
    },
  });

export const useGenerateDeepLink = () =>
  useMutation({
    mutationFn: (params: DeepLinkParams) => generateDeepLink(params),
    onError: (error: Error) => {
      toast.error("Failed to generate payment link ");
      console.error("Failed to generate deeplink", error);
    },
  });