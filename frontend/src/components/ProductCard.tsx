"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useState, useEffect } from "react";

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
  const [isWishlisted, setIsWishlisted] = useState(false);

  // ✅ Load wishlist state from localStorage
  useEffect(() => {
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    setIsWishlisted(wishlist.includes(product.id));
  }, [product.id]);

  // ✅ Handle toggle wishlist
  const toggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    let updated;
    if (wishlist.includes(product.id)) {
      updated = wishlist.filter((id: string) => id !== product.id);
      setIsWishlisted(false);
    } else {
      updated = [...wishlist, product.id];
      setIsWishlisted(true);
    }
    localStorage.setItem("wishlist", JSON.stringify(updated));
  };

  // ✅ Handle navigation to Product Details
  const handleClick = () => {
    router.push(`/product/${product.id}`); // ✅ corrected path
  };

  return (
    <motion.div
      onClick={handleClick}
      className="relative group cursor-pointer bg-[#F5F5F4] border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
      whileHover={{ scale: 1.02 }}
    >
      {/* Image Section */}
      <div className="relative w-full h-72 overflow-hidden bg-white">
        <motion.img
          src={product.imageUrl || "/images/placeholder.jpg"}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* ❤️ Wishlist Icon */}
        <motion.button
          onClick={toggleWishlist}
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

      {/* Info Section */}
      <div className="p-5 transition-all duration-300 ease-in-out group-hover:mb-12">
        <h3 className="font-semibold text-[#292524] text-sm mb-1 truncate">
          {product.name}
        </h3>
        <p className="text-[#737373] font-bold text-xs tracking-wider">
          ₹{product.price.toFixed(2)}
        </p>
      </div>

      {/* Add to Cart Button (appears on hover) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          console.log(`🛒 Add to cart: ${product.name}`);
        }}
        className="absolute bottom-5 left-1/2 -translate-x-1/2 w-11/12 py-2 rounded-xl text-white font-medium text-sm bg-[#025a6a] hover:bg-[#014c57] shadow-md
                   opacity-0 translate-y-6 transition-all duration-300 ease-in-out group-hover:opacity-100 group-hover:-translate-y-0"
      >
        Add to Cart
      </button>
    </motion.div>
  );
}
