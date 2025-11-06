"use client";

import { createContext, useContext, useEffect, useState } from "react";

// ✅ Define the context type
interface WishlistContextType {
  wishlist: any;
  loading: boolean;
  toggleWishlist: (productId: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

// ✅ Initialize context with proper type
const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({
  userId,
  children,
}: {
  userId?: string;
  children: React.ReactNode;
}) => {
  const [wishlist, setWishlist] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // 🟢 Fetch wishlist whenever userId changes
  useEffect(() => {
    if (!userId) {
      setWishlist(null);
      return;
    }

    const fetchWishlist = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wishlist/${userId}`);
        const data = await res.json();
        setWishlist(data);
      } catch (err) {
        console.error("Error fetching wishlist:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [userId]);

  // 💛 Toggle wishlist item (add/remove)
  const toggleWishlist = async (productId: string) => {
    if (!userId) {
      alert("Please log in first");
      return;
    }
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wishlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, productId }),
      });
      await refreshWishlist();
    } catch (err) {
      console.error("Failed to toggle wishlist:", err);
    }
  };

  // ❌ Clear all items
  const clearWishlist = async () => {
    if (!userId) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wishlist/${userId}`, {
        method: "DELETE",
      });
      setWishlist({ items: [] });
    } catch (err) {
      console.error("Failed to clear wishlist:", err);
    }
  };

  // 🔄 Refresh wishlist manually
  const refreshWishlist = async () => {
    if (!userId) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wishlist/${userId}`);
      const data = await res.json();
      setWishlist(data);
    } catch (err) {
      console.error("Error refreshing wishlist:", err);
    }
  };

  const value: WishlistContextType = {
    wishlist,
    loading,
    toggleWishlist,
    clearWishlist,
    refreshWishlist,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

// 🪄 Custom Hook for useWishlist()
export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
