"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import { apiRequest } from "@/utils/api";
import { applySaleToProduct } from "@/utils/saleUtils";
import type { Sale } from "@/utils/saleUtils";


/* ---------------- TYPES ---------------- */

export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  parentCategoryId?: string;
  subCategoryId?: string;
}

interface ProductCardProps {
  product: Product;
}

/* ---------------- COLORS ---------------- */
const COLORS = {
  MUSTARD_LIGHT: "#dec08a",
  DEEP_BLUE: "#4a9eb3",
  PRIMARY_TEAL: "#025a6a",
  TEXT_GRAY: "#444444",
  MUTED_GRAY: "#6b6b6b",
  BORDER_GRAY: "#e5e5e5",
  OFF_WHITE: "#f9f6ef",
};

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { addToCart } = useCart();
  const { wishlist, toggleWishlist } = useWishlist();

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [hovered, setHovered] = useState(false);

  const [finalPrice, setFinalPrice] = useState(product.price);
  const [hasSale, setHasSale] = useState(false);

  /* ---------------- SALE FETCH ---------------- */
  useEffect(() => {
    // prevent hydration flicker
    if (typeof window === "undefined") return;

    const fetchActiveSales = async () => {
      try {
        const activeSales = await apiRequest<Sale[]>("/api/sales/active", {
          method: "GET",
        });
        const { finalPrice, sale } = applySaleToProduct(product, activeSales || []);
        setFinalPrice(finalPrice);
        setHasSale(Boolean(sale));
      } catch (err) {
        console.error("Sale fetch failed:", err);
        setFinalPrice(product.price);
        setHasSale(false);
      }
    };

    fetchActiveSales();
  }, [product]);

  /* ---------------- WISHLIST ---------------- */
  useEffect(() => {
    setIsWishlisted(
      wishlist?.items?.some((item: any) => item.productId === product.id) || false
    );
  }, [wishlist, product.id]);

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (authLoading || !user) {
      toast.dismiss();
      toast.error("Please log in to add to your wishlist", {
        duration: 3000,
        style: {
          background: "#f9f6ef",
          color: "#292524",
          border: "1px solid #e5e5e5",
          fontWeight: 500,
        },
      });
      return;
    }

    try {
      await toggleWishlist(product.id);
      toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist", {
        duration: 1500,
        style: {
          background: "#f9f6ef",
          color: "#292524",
          border: "1px solid #e5e5e5",
        },
      });
    } catch (err) {
      console.error("Wishlist toggle failed:", err);
      toast.error("Something went wrong while updating wishlist");
    }
  };

  /* ---------------- CART ---------------- */
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (authLoading || !user) {
      toast.dismiss();
      toast.error("Please log in to add items to your cart", {
        duration: 3000,
        style: {
          background: "#f9f6ef",
          color: "#292524",
          border: "1px solid #e5e5e5",
          fontWeight: 500,
        },
      });
      return;
    }

    try {
      await addToCart(product.id, 1, finalPrice);
      toast.success("Added to cart!", {
        duration: 1500,
        style: {
          background: "#f9f6ef",
          color: "#292524",
          border: "1px solid #e5e5e5",
        },
      });
    } catch (err) {
      console.error("Add to cart failed:", err);
      toast.error("Something went wrong while adding to cart");
    }
  };

  const handleClick = () => router.push(`/product/${product.id}`);

  /* ---------------- RENDER ---------------- */
  return (
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
      className="relative cursor-pointer rounded-2xl overflow-hidden border flex flex-col transition-all duration-300"
      style={{
        backgroundColor: COLORS.OFF_WHITE,
        borderColor: COLORS.BORDER_GRAY,
        height: "380px",
      }}
    >
      <motion.div
        animate={{ y: hovered ? -10 : 0 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="flex flex-col justify-between flex-1 h-full"
      >
        <motion.div
          className="relative w-full overflow-hidden bg-white"
          animate={{ height: hovered ? 195 : 225 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          <motion.img
            src={product.imageUrl || "/images/placeholder.jpg"}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />

          <motion.button
            onClick={handleToggleWishlist}
            whileTap={{ scale: 0.9 }}
            className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-sm hover:shadow-md transition-all"
          >
            <Heart
              className="w-5 h-5"
              style={{
                color: isWishlisted ? COLORS.MUSTARD_LIGHT : COLORS.MUTED_GRAY,
                fill: isWishlisted ? COLORS.MUSTARD_LIGHT : "none",
              }}
            />
          </motion.button>
        </motion.div>

        <div className="px-4 pt-2 pb-1 flex flex-col gap-[3px]">
          <p className="text-xs font-medium tracking-wide" style={{ color: COLORS.MUTED_GRAY }}>
            Vaaya
          </p>

          <h3
            className="font-medium text-[15px] leading-snug line-clamp-2"
            style={{ color: COLORS.TEXT_GRAY }}
          >
            {product.name}
          </h3>

          <div className="flex items-center gap-1 mt-[2px]">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={15}
                fill={i < 4 ? COLORS.MUSTARD_LIGHT : "none"}
                stroke={COLORS.MUSTARD_LIGHT}
              />
            ))}
            <span
              className="text-sm font-medium ml-1"
              style={{ color: COLORS.MUTED_GRAY }}
            >
              4.3
            </span>
          </div>

          {/* 💰 Price Section */}
          <div className="flex items-baseline gap-2 mt-[3px]">
            {hasSale && (
              <p className="text-base line-through font-medium" style={{ color: "#888" }}>
                ₹{product.price.toFixed(2)}
              </p>
            )}
            <p className="font-semibold text-lg" style={{ color: "#000" }}>
              ₹{finalPrice.toFixed(2)}
            </p>
          </div>
        </div>

        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{
            height: hovered ? 40 : 0,
            opacity: hovered ? 1 : 0,
          }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="overflow-hidden px-4 pb-3"
        >
          <motion.button
            onClick={handleAddToCart}
            className="w-full py-[6px] rounded-xl text-white font-medium text-sm shadow-md transition-colors duration-300"
            style={{
              backgroundColor: COLORS.PRIMARY_TEAL,
            }}
            whileTap={{ scale: 0.97 }}
            whileHover={{ backgroundColor: COLORS.DEEP_BLUE }}
          >
            Add to Cart
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
