"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";

interface TrendingProductsProps {
  section: any;
}

const DEEP_BLUE = "#4a9eb3"; // darker teal-blue
const MUSTARD_LIGHT = "#c5a254"; // deeper mustard-gold
const DEEP_CHARCOAL = "#1e1b18"; // darker neutral charcoal
const OFF_WHITE = "#f5f5f5"; // slightly darker background tone

export default function TrendingProducts({ section }: TrendingProductsProps) {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!section?.linkedProductIds?.length) return;
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/products/by-ids`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids: section.linkedProductIds }),
          }
        );
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Error fetching trending products:", err);
      }
    };
    fetchProducts();
  }, [section]);

  if (!products.length) return null;

  return (
    <section
      className="relative w-full py-20 px-6 md:px-16 overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${DEEP_BLUE}19 0%, ${OFF_WHITE} 90%)`,
      }}
    >
      {/* 🔵 Background Accent Circle */}
      <div
        className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-20"
        style={{ backgroundColor: DEEP_BLUE }}
      ></div>

      {/* 🧭 Section Heading (unified format) */}
      <div className="text-center mb-14 relative z-10">
        <h2
          className="text-3xl md:text-4xl font-bold tracking-tight mb-3"
          style={{
            color: DEEP_CHARCOAL,
          }}
        >
          {section.heading || "Trending Products"}
        </h2>

        {section.subheading && (
          <p className="text-lg text-gray-700 max-w-2xl mx-auto mb-3">
            {section.subheading}
          </p>
        )}

        {/* Unified mustard underline */}
        <div
          className="mx-auto mt-3 h-[3px] w-24 rounded-full"
          style={{ backgroundColor: DEEP_BLUE }}
        ></div>
      </div>

      {/* 🪄 Product Cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-7xl mx-auto relative z-10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{
          hidden: { opacity: 0, y: 30 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { staggerChildren: 0.15, duration: 0.6 },
          },
        }}
      >
        {products.map((p, index) => (
          <motion.div
            key={p.id}
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0 },
            }}
            whileHover={{
              scale: 1.05,
              boxShadow: `0 10px 25px -8px ${DEEP_BLUE}80`,
            }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-gray-100"
          >
            <ProductCard product={p} />
          </motion.div>
        ))}
      </motion.div>

    </section>
  );
}
