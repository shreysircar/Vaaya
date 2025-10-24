"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/products/${product.id}`);
  };

  return (
    <motion.div
      onClick={handleClick}
      className="relative group cursor-pointer bg-[#F5F5F4] border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300"
      whileHover={{ scale: 1.02 }}
    >
      {/* Container for image + text */}
      <div className="flex flex-col transition-all duration-300 ease-in-out group-hover:-translate-y-2">
        {/* Image */}
        <motion.div
          className="w-full h-72 overflow-hidden bg-white"
          initial={{ scale: 1 }}
          whileHover={{ scale: 0.9 }} // shrink more to give space
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500"
          />
        </motion.div>

        {/* Text */}
        <div className="p-5 transition-all duration-300 ease-in-out group-hover:mb-12">
          <h3 className="font-semibold text-[#292524] text-lg mb-1 truncate">
            {product.name}
          </h3>

          <p className="text-[#737373] font-bold text-base tracking-wider">
            ${product.price.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Add to Cart Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          console.log(`Add to cart: ${product.name}`);
        }}
        className="absolute bottom-5 left-1/2 -translate-x-1/2 w-11/12 py-2 rounded-xl text-white font-medium text-sm bg-[#025a6a] hover:bg-[#014c57] shadow-md
                   opacity-0 translate-y-6 transition-all duration-300 ease-in-out group-hover:opacity-100 group-hover:-translate-y-0"
      >
        Add to Cart
      </button>
    </motion.div>
  );
}
