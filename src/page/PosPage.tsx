"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useDebouncedCallback } from "use-debounce";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import type { IProduct } from "@/types/product";
import type { ICart } from "@/types/cart";
import type { OrderPayload } from "@/service/orders.service";

import { useCategories }                     from "@/hooks/useCategories";
import { useOutOfStockProducts, useProduct } from "@/hooks/useProduct";
import { useCreatePayment, useConfirmOrder } from "@/hooks/usePayment";
import { useUsbScanner }                     from "@/hooks/useUsbScanner";
import { launchAbaCheckout }                 from "@/utils/abaPayway";
import { useDarkMode }                       from "@/hooks/useDarkMode";
import { useTheme }                          from "@/hooks/useTheme";
import { useCart }                           from "@/hooks/useCart";
import { useCurrencyDisplay }                from "@/hooks/useCurrencyDisplay";

import PosHeader            from "@/components/PosHeader";
import CategoryBar          from "@/components/CategoryBar";
import ProductGrid          from "@/components/ProductGrid";
import CartSidebar          from "@/components/CartSidebar";
import BarcodeScanner       from "@/components/BarcodeScanner";
import OrderSummaryDialog   from "@/components/OrderSummaryDialog";
import PaymentSuccessDialog from "@/components/PaymentSuccessDialog";
import PrintReceipt         from "@/components/PrintReceipt";
import { useCancelOrder, useCreateOrder } from "./Orders";

// ✅ removed useAbaRedirect — ABA uses modal callback, not URL redirect

export default function PosPage() {
  const { dark, toggle } = useDarkMode();
  const t                = useTheme(dark);
  const { currency, toggle: toggleCurrency, format: formatPrice, khrAvailable } = useCurrencyDisplay();
  const queryClient      = useQueryClient();

  // ── Filters ────────────────────────────────────────────────
  const [searchInput,      setSearchInput]      = useState("");
  const [searchText,       setSearchText]       = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);

  // Debounce search input — wait 300ms after the user stops typing
  // before firing the API call (via React Query key change).
  const handleSearchChange = useDebouncedCallback(
    useCallback((value: string) => {
      setSearchText(value);
    }, []),
    300
  );

  // ── UI state ───────────────────────────────────────────────
  const [isOpen,      setIsOpen]      = useState(false);
  const [isLoading,   setIsLoading]   = useState(false);
  const [isSuccess,   setIsSuccess]   = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);

  // ── Order / receipt state ──────────────────────────────────
  const [currentOrderId, setCurrentOrderId] = useState<number | null>(null);
  const [receiptItems,   setReceiptItems]   = useState<ICart[]>([]);
  const [receiptTotal,   setReceiptTotal]   = useState(0);
  const [receiptSubtotal, setReceiptSubtotal] = useState(0);
  const [receiptDiscount, setReceiptDiscount] = useState(0);
  const [receiptOrderId, setReceiptOrderId] = useState<number | null>(null);

  // ── Cart ───────────────────────────────────────────────────
  const {
    cartItems, cartSummary, discount,
    addToCart, removeFromCart, increaseQty, decreaseQty, clearCart,
  } = useCart();

  // ── Data ───────────────────────────────────────────────────
  const { data: productData }    = useProduct(searchText, 1, 100, selectedCategory);
  const { data: outOfStockData } = useOutOfStockProducts(searchText, selectedCategory);
  const { data: categoryData }   = useCategories();

  // ── Memoized product data ──────────────────────────────────
  // Derive products list filtered to in-stock items only, then build
  // a lookup map keyed by (id, name, barcode) for O(1) scanning.
  const { products, productsById, outOfStockProducts, categories } = useMemo(() => {
    const all      = (productData?.data       as IProduct[]) ?? [];
    const stocked  = all.filter((p) => p.qty > 0);
    const outStock = (outOfStockData?.data    as IProduct[]) ?? [];
    const cats     = (categoryData?.data      as any[])     ?? [];

    // Build a Map for O(1) barcode scan lookups — keyed by multiple identifiers
    const byId: Map<string, IProduct> = new Map();
    for (const p of stocked) {
      byId.set(String(p.id),             p);
      byId.set(p.name.toLowerCase(),     p);
      if ((p as any).barcode) byId.set(String((p as any).barcode).toLowerCase(), p);
    }

    return { products: stocked, productsById: byId, outOfStockProducts: outStock, categories: cats };
  }, [productData, outOfStockData, categoryData]);

  // ── Mutations ──────────────────────────────────────────────
  const { mutate: createOrderMutate }   = useCreateOrder();
  const { mutate: createPaymentMutate } = useCreatePayment();
  const { mutate: cancelOrderMutate }   = useCancelOrder();
  const { mutate: confirmOrderMutate }  = useConfirmOrder();

  // ── Invalidate all caches ──────────────────────────────────
  const invalidateAll = useCallback(() => {
    console.log("🔄 invalidateAll called");
    queryClient.invalidateQueries({ queryKey: ["products"] });
    queryClient.invalidateQueries({ queryKey: ["products-out-of-stock"] });
    queryClient.invalidateQueries({ queryKey: ["products-low-stock"] });
    queryClient.invalidateQueries({ queryKey: ["product-stock"] });
    queryClient.invalidateQueries({ queryKey: ["categories"] });
    queryClient.invalidateQueries({ queryKey: ["orders"] });
  }, [queryClient]);

  useEffect(() => {
    if (!isSuccess) return;
    const timer = setTimeout(() => setIsSuccess(false), 10_000);
    return () => clearTimeout(timer);
  }, [isSuccess]);

  // ── Barcode scanning ───────────────────────────────────────
  // O(1) lookup via Map — no more O(n) array scan per barcode
  const handleBarcodeScan = useCallback((code: string) => {
    const trimmed = code.trim().toLowerCase();
    const found = productsById.get(trimmed) || products.find(
      (p) => String(p.id) === code.trim()
    );
    if (found) { addToCart(found); setShowScanner(false); }
    else toast.warning(`Product not found: ${code}`);
  }, [productsById, products, addToCart]);

  useUsbScanner(handleBarcodeScan, !showScanner);

  // ── Cancel order ───────────────────────────────────────────
  const handleCancelOrder = useCallback((orderId: number, reason = "Customer cancelled") => {
    console.log("🔴 handleCancelOrder — orderId:", orderId, "reason:", reason);
    cancelOrderMutate({ id: orderId, reason }, {
      onSuccess: () => {
        console.log("✅ cancelOrder success — orderId:", orderId);
        toast.info("Order cancelled.");
        invalidateAll();
        setCurrentOrderId(null);
        setIsOpen(false);
      },
      onError: (err) => {
        console.error("❌ cancelOrder error:", err);
        toast.error("Failed to cancel order ❌");
      },
    });
  }, [cancelOrderMutate, invalidateAll]);

  // ── Confirm order (Cash + ABA) ─────────────────────────────
  const handleConfirmOrder = useCallback((orderId: number, items: ICart[], total: number, paymentMethod?: string) => {
    console.log("✅ handleConfirmOrder — orderId:", orderId, "method:", paymentMethod || "cash");
    confirmOrderMutate({ orderId, paymentMethod }, {
      onSuccess: () => {
        console.log("✅ confirmOrder success — orderId:", orderId);
        const subTotal = items.reduce((sum, it) => sum + it.originalPrice * it.qty, 0);
        const discAmt  = items.reduce((sum, it) => sum + (it.originalPrice - it.price) * it.qty, 0);
        setReceiptItems(items);
        setReceiptTotal(total);
        setReceiptSubtotal(subTotal);
        setReceiptDiscount(discAmt);
        setReceiptOrderId(orderId);
        setCurrentOrderId(null);
        setIsSuccess(true);
        setIsOpen(false);
        clearCart();     // ✅ clear cart
        invalidateAll(); // ✅ refresh stock
      },
      onError: (err) => {
        console.error("❌ confirmOrder error:", err);
        toast.error("Failed to confirm order ❌");
        handleCancelOrder(orderId, "Confirm failed");
      },
    });
  }, [confirmOrderMutate, clearCart, invalidateAll, handleCancelOrder]);

  // ── Place order ────────────────────────────────────────────
  const handlePlaceOrder = useCallback((method: "cash" | "aba" = "aba") => {
    console.log("🛒 handlePlaceOrder — method:", method, "cartItems:", cartItems.length);
    if (cartItems.length === 0) { toast.warning("Cart is empty"); return; }

    setIsLoading(true);

    const payload: OrderPayload = {
      discount,
      items: cartItems.map((item) => ({ productId: item.id, qty: item.qty })),
    };

    const snapshotItems = [...cartItems];
    const snapshotTotal = cartSummary.netTotal;

    console.log("📦 createOrder payload:", payload);

    createOrderMutate(payload, {
      onSuccess: (res: { success: boolean; data: { id: number } }) => {
        const orderId = res.data.id;
        console.log("✅ createOrder success — orderId:", orderId, "method:", method);
        setCurrentOrderId(orderId);

        // ── Cash: confirm immediately ─────────────────────
        if (method === "cash") {
          console.log("💵 Cash — confirming immediately");
          handleConfirmOrder(orderId, snapshotItems, snapshotTotal);
          return;
        }

        // ── ABA: launch KHQR modal ────────────────────────
        console.log("📱 ABA — creating payment");
        createPaymentMutate(orderId, {
          onSuccess: (payRes) => {
            console.log("✅ createPayment success:", payRes);
            const payway = payRes.data.payway;
            if (!payway) {
              console.warn("⚠️ payway is null");
              return;
            }

            setReceiptItems(snapshotItems);
            setReceiptTotal(snapshotTotal);
            setReceiptOrderId(orderId);
            setIsOpen(false);

            const launched = launchAbaCheckout(
              payway,
              // ✅ ABA success callback — confirm order here
              (_tranId) => {
                console.log("✅ ABA payment success — confirming order:", orderId);
                handleConfirmOrder(orderId, snapshotItems, snapshotTotal, 'aba');
              },
              // ✅ ABA cancel/fail callback
              () => {
                console.log("❌ ABA payment cancelled/failed");
                toast.error("Payment cancelled.");
                handleCancelOrder(orderId, "Payment cancelled by user");
              }
            );

            console.log("🚀 launchAbaCheckout result:", launched);
            if (!launched) {
              toast.error("Payment gateway script not loaded. Check index.html.");
              handleCancelOrder(orderId, "Payment gateway unavailable");
            }
          },
          onError: (err) => {
            console.error("❌ createPayment error:", err);
            toast.error("Payment failed — cancelling order...");
            handleCancelOrder(orderId, "Payment failed");
          },
        });
      },
      onError: (error: any) => {
        console.error("❌ createOrder error:", error);
        toast.error(error?.response?.data?.message || "Order failed.");
      },
      onSettled: () => {
        console.log("🏁 createOrder settled");
        setIsLoading(false);
      },
    });
  }, [
    cartItems, cartSummary, discount,
    createOrderMutate, createPaymentMutate,
    handleConfirmOrder, handleCancelOrder,
  ]);

  // ── Checkout ───────────────────────────────────────────────
  const handleCheckout = useCallback((method: "cash" | "aba") => {
    console.log("🎯 handleCheckout — method:", method);
    if (method === "cash") {
      handlePlaceOrder("cash"); // ✅ no dialog needed for cash
    } else {
      setIsOpen(true);          // ✅ show summary dialog for ABA
    }
  }, [handlePlaceOrder]);

  // ── Render ─────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", height: "100vh", background: t.pageBg, fontFamily: "'Inter','Segoe UI',sans-serif", overflow: "hidden" }}>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <PosHeader
          dark={dark}
          toggleDark={toggle}
          currency={currency}
          toggleCurrency={toggleCurrency}
          khrAvailable={khrAvailable}
          searchText={searchInput}
          onSearchChange={(value: string) => { setSearchInput(value); handleSearchChange(value); }}
          onScanClick={() => setShowScanner(true)}
          t={t}
        />
        <CategoryBar
          categories={categories}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
          t={t}
        />
        <ProductGrid
          products={products}
          outOfStockProducts={outOfStockProducts}
          onAdd={addToCart}
          dark={dark}
          t={t}
          formatPrice={formatPrice}
        />
      </div>

      <CartSidebar
        cartItems={cartItems}
        cartSummary={cartSummary}
        dark={dark}
        t={t}
        currency={currency}
        formatPrice={formatPrice}
        onScanClick={() => setShowScanner(true)}
        onClearCart={clearCart}
        onRemove={removeFromCart}
        onIncrease={increaseQty}
        onDecrease={decreaseQty}
        onCheckout={handleCheckout}
      />

      {showScanner && (
        <BarcodeScanner onScan={handleBarcodeScan} onClose={() => setShowScanner(false)} />
      )}

      <OrderSummaryDialog
        open={isOpen}
        onClose={() => {
          if (currentOrderId) handleCancelOrder(currentOrderId, "Customer closed dialog");
          else setIsOpen(false);
        }}
        cartItems={cartItems}
        cartSummary={cartSummary}
        formatPrice={formatPrice}
        isLoading={isLoading}
        currentOrderId={currentOrderId}
        onCancel={() => currentOrderId
          ? handleCancelOrder(currentOrderId, "Customer cancelled")
          : setIsOpen(false)
        }
        onPlaceOrder={handlePlaceOrder}
      />

      <PaymentSuccessDialog
        open={isSuccess}
        onClose={setIsSuccess}
        onPrintReceipt={() => setShowReceipt(true)}
      />

      {showReceipt && (
        <PrintReceipt
          cartItems={receiptItems}
          total={receiptTotal}
          subtotal={receiptSubtotal}
          discountAmount={receiptDiscount}
          orderId={receiptOrderId}
          formatPrice={formatPrice}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </div>
  );
}