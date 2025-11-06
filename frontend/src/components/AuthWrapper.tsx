"use client";

import { useAuth } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  return (
    <CartProvider userId={user?.id}>
      <WishlistProvider userId={user?.id}>{children}</WishlistProvider>
    </CartProvider>
  );
}
