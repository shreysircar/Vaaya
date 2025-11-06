"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
}

interface ProductCardProps {
  product: Product;
}

const MUSTARD_LIGHT = "#dec08a";
const DEEP_BLUE = "#025a6a";
const DEEP_CHARCOAL = "#292524";

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { addToCart, cart } = useCart();
  const { wishlist, toggleWishlist } = useWishlist();
  const [isWishlisted, setIsWishlisted] = useState(false);

  // ✅ Keep wishlist sync with global context
  useEffect(() => {
    if (wishlist?.items?.some((item: any) => item.productId === product.id)) {
      setIsWishlisted(true);
    } else {
      setIsWishlisted(false);
    }
  }, [wishlist, product.id]);

  // ❤️ Toggle wishlist
  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleWishlist(product.id);
  };

  // 🛒 Add to cart
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await addToCart(product.id, 1, product.price);
  };

  // 🔍 Go to product details
  const handleClick = () => {
    router.push(`/product/${product.id}`);
  };

  return (
    <motion.div
      onClick={handleClick}
      className="relative group cursor-pointer bg-[#F5F5F4] border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
      whileHover={{ scale: 1.02 }}
    >
      {/* 🖼️ Product Image */}
      <div className="relative w-full h-72 overflow-hidden bg-white">
        <motion.img
          src={product.imageUrl || "/images/placeholder.jpg"}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* ❤️ Wishlist Icon */}
        <motion.button
          onClick={handleToggleWishlist}
          whileTap={{ scale: 0.9 }}
          className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-sm hover:shadow-md transition-all"
        >
          <Heart
            className={`w-5 h-5 ${
              isWishlisted
                ? "fill-current text-[#dec08a]"
                : "text-gray-600 hover:text-[#dec08a]"
            }`}
          />
        </motion.button>
      </div>

      {/* ℹ️ Product Info */}
      <div className="p-5 transition-all duration-300 ease-in-out group-hover:mb-12">
        <h3 className="font-semibold text-[#292524] text-sm mb-1 truncate">
          {product.name}
        </h3>
        <p className="text-[#737373] font-bold text-xs tracking-wider">
          ₹{product.price.toFixed(2)}
        </p>
      </div>

      {/* 🛒 Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        className="absolute bottom-5 left-1/2 -translate-x-1/2 w-11/12 py-2 rounded-xl text-white font-medium text-sm bg-[#025a6a] hover:bg-[#014c57] shadow-md
                   opacity-0 translate-y-6 transition-all duration-300 ease-in-out group-hover:opacity-100 group-hover:-translate-y-0"
      >
        Add to Cart
      </button>
    </motion.div>
  );
}
