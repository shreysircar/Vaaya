"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface CartContextType {
  cart: any;
  loading: boolean;
  addToCart: (productId: string, quantity?: number, price?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
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

  // ➕ Add to cart
  const addToCart = async (productId: string, quantity = 1, price?: number) => {
    if (!userId) return alert("Please log in first");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, productId, quantity, price }),
      });
      if (res.ok) await refreshCart();
    } catch (err) {
      console.error("Failed to add to cart:", err);
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
