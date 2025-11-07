"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { motion } from "framer-motion";

const MUSTARD_LIGHT = "#dec08a";
const DEEP_CHARCOAL = "#292524";
const DEEP_BLUE = "#4a9eb3"; 

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
}

interface SubCategory {
  id: string;
  name: string;
  products: Product[];
}

interface ParentCategory {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  subcategories: SubCategory[];
}

export default function CategoryPage() {
  const { id } = useParams();
  const [category, setCategory] = useState<ParentCategory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchCategory = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories/${id}`);
        if (!res.ok) throw new Error("Failed to fetch category");
        const data = await res.json();
        setCategory(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategory();
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-[60vh] text-gray-500">
        Loading category...
      </div>
    );

  if (!category)
    return (
      <div className="flex justify-center items-center h-[60vh] text-gray-500">
        Category not found.
      </div>
    );

  return (
    <div className="bg-white min-h-screen">
{/* 🌄 Refined Minimal Hero — Light Grey Overlay + Teal Accent */}
<div className="relative w-full h-[420px] md:h-[460px] overflow-hidden">
  {/* Background Image */}
  <div
    className="absolute inset-0 w-full h-full"
    style={{
      backgroundImage: `url(${category.imageUrl || "/images/placeholder.jpg"})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      filter: "brightness(93%)",
      transform: "translateY(0)", // ensures perfect alignment
    }}
  ></div>

  {/* Soft Light Overlay */}
  <div
    className="absolute inset-0 w-full h-full"
    style={{
      background: "linear-gradient(to bottom, rgba(0,0,0,0.25), rgba(0,0,0,0.35))",
    }}
  ></div>

  {/* Subtle bottom fade for text depth */}
  <div
    className="absolute bottom-0 left-0 w-full h-20"
    style={{
      background: "linear-gradient(to top, rgba(0,0,0,0.3), transparent)",
    }}
  ></div>

  {/* Centered Text */}
  <div className="relative z-10 flex flex-col items-center justify-center text-center h-full px-6">
    <motion.h1
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-3"
      style={{ textShadow: "0 3px 6px rgba(0,0,0,0.4)" }}
    >
      {category.name}
    </motion.h1>

    {category.description && (
      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="text-gray-100 text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-4"
        style={{ textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}
      >
        {category.description}
      </motion.p>
    )}

    {/* Solid Teal Underline */}
    <motion.div
      initial={{ opacity: 0, width: 0 }}
      animate={{ opacity: 1, width: 80 }}
      transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="h-[3px] rounded-full"
      style={{ backgroundColor: DEEP_BLUE }}
    ></motion.div>
  </div>
</div>



      {/* 📦 Subcategories Section */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-16 space-y-16">
        {category.subcategories?.length > 0 ? (
          category.subcategories.map((sub, index) => (
            <motion.section
              key={sub.id}
              className="p-6 md:p-8 rounded-2xl bg-[#F9F9F8] shadow-sm border border-gray-100"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                delay: index * 0.05,
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <div className="flex flex-col items-start mb-6">
                <h3
                  className="text-xl md:text-2xl font-semibold mb-2"
                  style={{ color: DEEP_CHARCOAL }}
                >
                  {sub.name}
                </h3>
                <div
                  className="h-[2px] w-16 rounded-full"
                  style={{ backgroundColor: DEEP_BLUE }}
                ></div>
              </div>

              {sub.products.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                  {sub.products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic text-sm">No products available.</p>
              )}
            </motion.section>
          ))
        ) : (
          <p className="text-gray-500 text-center italic">
            No subcategories or products available in this category.
          </p>
        )}
      </div>
    </div>
  );
}
