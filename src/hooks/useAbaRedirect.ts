import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useConfirmOrder } from "@/hooks/usePayment";

interface UseAbaRedirectOptions {
  onConfirmed: () => void;
}

export function useAbaRedirect({ onConfirmed }: UseAbaRedirectOptions) {
  const { mutate: confirmOrderMutate } = useConfirmOrder();

  // ✅ useRef to avoid stale closure without re-running effect
  const onConfirmedRef = useRef(onConfirmed);
  useEffect(() => {
    onConfirmedRef.current = onConfirmed;
  }, [onConfirmed]);

  useEffect(() => {
    const params  = new URLSearchParams(window.location.search);
    const tranId  = params.get("tran_id");
    const status  = params.get("status");

    if (!tranId) return;

    // Clean URL immediately — prevents re-trigger on refresh
    window.history.replaceState({}, "", window.location.pathname);

    if (status === "0") {
      const savedOrderId = Number(localStorage.getItem("pending_order_id"));
      localStorage.removeItem("pending_order_id");

      if (!savedOrderId) {
        toast.warning("Payment received but could not confirm order. Contact support.");
        return;
      }

      confirmOrderMutate({ orderId: savedOrderId, paymentMethod: 'aba' }, {
        onSuccess: () => onConfirmedRef.current(), // ✅ use ref — no stale closure
        onError: () => {
          toast.error("Payment received but order confirmation failed. Please confirm manually.");
        },
      });
    } else {
      toast.error("Payment was not completed. Please try again.");
    }
  }, [confirmOrderMutate]); // ✅ removed onConfirmed from deps — prevents re-run loop
}