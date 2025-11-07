"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface CartContextType {
  cart: any;
  loading: boolean;
  addToCart: (productId: string, quantity?: number, price?: number) => Promise<{ ok: boolean; message?: string }>; // 🆕 return structured result
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  updateCartItemQuantity: (productId: string, delta: number) => Promise<{ ok: boolean; message?: string }>; // 🆕 added
  checkoutOrder: () => Promise<{ ok: boolean; message?: string }>; // 🆕 added

}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({
  userId,
  children,
}: {
  userId?: string;
  children: React.ReactNode;
}) => {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // 🟢 Fetch cart when userId changes
  useEffect(() => {
    if (!userId) {
      setCart(null);
      return;
    }

    const fetchCart = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart/${userId}`);
        const data = await res.json();
        setCart(data);
      } catch (err) {
        console.error("Error fetching cart:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [userId]);

  const refreshCart = async () => {
    if (!userId) return;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart/${userId}`);
    const data = await res.json();
    setCart(data);
  };

  // ➕ Add to cart (now stock-aware)
  const addToCart = async (
    productId: string,
    quantity = 1,
    price?: number
  ): Promise<{ ok: boolean; message?: string }> => {
    if (!userId) return { ok: false, message: "Please log in first" };
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, productId, quantity, price }),
      });

      const data = await res.json();

      if (!res.ok) {
        // 🆕 backend sends helpful stock error messages
        return { ok: false, message: data?.error || "Failed to add to cart" };
      }

      await refreshCart();
      return { ok: true };
    } catch (err) {
      console.error("Failed to add to cart:", err);
      return { ok: false, message: "Network error" };
    }
  };

  // 🆕 Increment or decrement quantity in cart
 const updateCartItemQuantity = async (
  productId: string,
  delta: number
): Promise<{ ok: boolean; message?: string }> => {
  if (!userId) return { ok: false, message: "User not logged in" };
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, productId, delta }),
    });

    const data = await res.json();

    if (!res.ok) {
      // backend returns stock info (available, etc.)
      return { ok: false, message: data?.error || "Failed to update quantity" };
    }

    // ✅ backend returns the updated cart now — apply it directly
    if (data.cart) {
      setCart(data.cart);
    } else {
      // fallback in case backend doesn’t return full cart
      await refreshCart();
    }

    return { ok: true };
  } catch (err) {
    console.error("updateCartItemQuantity error:", err);
    return { ok: false, message: "Network error" };
  }
};

// 🆕 Checkout function
const checkoutOrder = async (): Promise<{ ok: boolean; message?: string }> => {
  if (!userId) return { ok: false, message: "Please log in first" };

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });

    const data = await res.json();

    if (res.status === 409) {
      // race condition / out-of-stock handled here
      return { ok: false, message: data?.message || "Some items are out of stock" };
    }

    if (!res.ok) {
      return { ok: false, message: data?.error || "Checkout failed" };
    }

    // on success: clear cart + return success
    await refreshCart();
    return { ok: true };
  } catch (err) {
    console.error("checkoutOrder error:", err);
    return { ok: false, message: "Network error" };
  }
};



  // ❌ Remove from cart
  const removeFromCart = async (productId: string) => {
    if (!userId) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart/${userId}/${productId}`, {
        method: "DELETE",
      });
      await refreshCart();
    } catch (err) {
      console.error("Failed to remove from cart:", err);
    }
  };

  // 🧹 Clear all
  const clearCart = async () => {
    if (!userId) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart/${userId}`, {
        method: "DELETE",
      });
      setCart({ items: [] });
    } catch (err) {
      console.error("Failed to clear cart:", err);
    }
  };

  const value: CartContextType = {
    cart,
    loading,
    addToCart,
    removeFromCart,
    clearCart,
    refreshCart,
    updateCartItemQuantity, 
    checkoutOrder
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// 🪄 Easy hook
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
