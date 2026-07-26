import { useCallback, useState } from "react";
import type { ICart, ICartSummary } from "../types/cart";
import type { IProduct } from "../types/product";
import { toast } from "sonner";
import { useCreateOrder } from "@/page/Orders";

export const useCart = () => {
  const [cartItems, setCartItems] = useState<ICart[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const { mutate: createOrder, isPending } = useCreateOrder();

  // ─── Add to Cart ──────────────────────────────────────
  const addToCart = useCallback((product: IProduct) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);

      if (existing) {
        if (existing.qty >= existing.stock) {
          toast.error("❌ Out of stock!");
          return prev;
        }
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }

      // ─── Map IProduct → ICart ──────────────────────────
      const cartItem: ICart = {
        id:       product.id,
        name:     product.name,
        category: product.category?.name ?? "Uncategorized",
        price:    Number(product.price),
        imageUrl: product.productImages?.[0]?.imageUrl ?? "/no-image.png",
        stock:    product.qty,
        qty:      1,
      };

      toast.success(`${product.name} added!`);
      return [...prev, cartItem];
    });
  }, []);

  // ─── Remove from Cart ─────────────────────────────────
  const removeFromCart = useCallback((id: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
    toast.info("Item removed from cart");
  }, []);

  // ─── Increase Qty ─────────────────────────────────────
  const increaseQty = useCallback((id: number) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          if (item.qty >= item.stock) {
            toast.error("❌ Out of stock!");
            return item;
          }
          return { ...item, qty: item.qty + 1 };
        }
        return item;
      })
    );
  }, []);

  // ─── Decrease Qty ─────────────────────────────────────
  const decreaseQty = useCallback((id: number) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, qty: item.qty - 1 } : item
        )
        .filter((item) => item.qty > 0)
    );
  }, []);

  // ─── Clear Cart ───────────────────────────────────────
  const clearCart = useCallback(() => {
    setCartItems([]);
    setDiscount(0);
  }, []);

  // ─── Cart Summary ─────────────────────────────────────
  const cartSummary: ICartSummary = {
    items:      cartItems,
    totalItems: cartItems.reduce((sum, item) => sum + item.qty, 0),
    totalPrice: cartItems.reduce((sum, item) => sum + item.price * item.qty, 0),
    discount,
    netTotal:   cartItems.reduce((sum, item) => sum + item.price * item.qty, 0) - discount,
  };

  // ─── Checkout ─────────────────────────────────────────
  const checkout = () => {
    if (cartItems.length === 0) {
      toast.error("❌ Cart is empty!");
      return;
    }

    createOrder(
      {
        discount,
        items: cartItems.map((item) => ({
          productId: item.id,
          qty:       item.qty,
        })),
      },
      {
        onSuccess: () => {
          clearCart();
        },
      }
    );
  };

  return {
    cartItems,
    discount,
    setDiscount,
    cartSummary,
    addToCart,
    removeFromCart,
    increaseQty,
    decreaseQty,
    clearCart,
    checkout,
    isPending,
  };
};