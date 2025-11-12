"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Poppins } from "next/font/google";
import ProductCard from "@/components/ProductCard";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600", "700"] });

/* 🎨 Theme Colors */
const DEEP_CHARCOAL = "#292524";
const DEEP_BLUE = "#81bdc9";
const MUSTARD_LIGHT = "#dec08a";

export default function SalePage() {
  const [bannerSlides, setBannerSlides] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* --- 🧠 Fetch Active Sale Banners --- */
  useEffect(() => {
    let mounted = true;

    const SALE_BUTTON_COLORS = [
      "#c5a3a3", "#9aa88d", "#025a6a", "#a29ba8", "#94a6b3",
      "#dec08a", "#b97a5e", "#687276", "#4c5541",
    ];

    const fetchActiveSales = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sales/active`);
        if (!res.ok) return;

        const data = await res.json();
        const salesArray = Array.isArray(data) ? data : [data];
        if (salesArray.length === 0) return;

        const saleSlides = salesArray.map((sale: any, i: number) => ({
          id: sale.id || `sale-${i}`,
          title: sale.bannerText || sale.title || "Limited Time Offer!",
          subtitle:
            sale.description ||
            `Enjoy discounts until ${
              sale.endDate ? new Date(sale.endDate).toLocaleDateString() : "soon"
            }!`,
          image: sale.bannerImageUrl || null,
          buttonColor:
            SALE_BUTTON_COLORS[Math.floor(Math.random() * SALE_BUTTON_COLORS.length)],
        }));

        if (mounted) setBannerSlides(saleSlides);
      } catch (err) {
        console.error("Error fetching sales:", err);
      }
    };

    fetchActiveSales();
    return () => {
      mounted = false;
    };
  }, []);

  // 🕓 Auto-cycle banners
  useEffect(() => {
    if (!bannerSlides.length) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % bannerSlides.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [bannerSlides.length]);

  /* --- 🧮 Fetch Sale Products --- */
  useEffect(() => {
    const fetchSaleProducts = async () => {
      try {
        const [salesRes, prodRes, catRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sales/active`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`),
        ]);

        if (!salesRes.ok || !prodRes.ok) throw new Error("Failed to fetch sale data");

        const [sales, allProducts, allCategories] = await Promise.all([
          salesRes.json(),
          prodRes.json(),
          catRes.json(),
        ]);

        const saleProducts = allProducts.filter((product: any) =>
          sales.some(
            (sale: any) =>
              sale.productId === product.id ||
              sale.subCategoryId === product.subCategoryId ||
              sale.parentCategoryId === product.parentCategoryId
          )
        );

        setProducts(saleProducts);
        setCategories(allCategories);
      } catch (err: any) {
        setError(err.message || "Something went wrong while fetching sales");
      } finally {
        setLoading(false);
      }
    };

    fetchSaleProducts();
  }, []);

  /* --- 🧩 Group Products by Category --- */
  const groupedByCategory = categories
    .map((cat) => ({
      ...cat,
      saleProducts: products.filter((p) => p.parentCategoryId === cat.id),
    }))
    .filter((cat) => cat.saleProducts.length > 0);

  if (loading) return <p className="text-center py-20 text-gray-600">Loading sale products...</p>;
  if (error) return <p className="text-center py-20 text-red-600">{error}</p>;

  return (
    <div className={`min-h-screen bg-white ${poppins.className}`}>
      {/* 🏷️ HERO SALE BANNER (No Buttons) */}
      {bannerSlides.length > 0 && (
        <section className="relative w-full overflow-hidden shadow-md h-[420px] md:h-[520px]">
          {bannerSlides.map((slide, index) => (
            <motion.div
              key={String(slide.id) + "-" + index}
              className="absolute inset-0 w-full h-full overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: index === activeIndex ? 1 : 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            >
              {slide.image ? (
                <motion.img
                  src={slide.image}
                  alt={slide.title}
                  initial={{ scale: 1.15 }}
                  animate={{ scale: index === activeIndex ? 1 : 1.15 }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div
                  className="absolute inset-0 w-full h-full"
                  style={{
                    background: `linear-gradient(135deg, ${DEEP_BLUE}22 0%, ${MUSTARD_LIGHT}11 100%)`,
                  }}
                />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />

              <AnimatePresence mode="wait">
                {index === activeIndex && (
                  <motion.div
                    key={slide.id + "-content"}
                    className="absolute bottom-14 left-8 md:bottom-20 md:left-20 max-w-lg text-white z-20"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.h1
                      initial={{ y: 40, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      className="text-3xl md:text-5xl font-bold mb-4 leading-snug drop-shadow-lg"
                    >
                      {slide.title}
                    </motion.h1>
                    <motion.p
                      initial={{ y: 40, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.6, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      className="text-base md:text-lg text-gray-200 mb-6 max-w-md leading-relaxed drop-shadow-md"
                    >
                      {slide.subtitle}
                    </motion.p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}

          {/* Banner Controls */}
          <button
            onClick={() => setActiveIndex((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl z-30 transition"
          >
            ❮
          </button>
          <button
            onClick={() => setActiveIndex((prev) => (prev + 1) % bannerSlides.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl z-30 transition"
          >
            ❯
          </button>

          {/* Dots */}
          <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex space-x-2 z-30">
            {bannerSlides.map((_, index) => (
              <button
                key={"dot-" + index}
                onClick={() => setActiveIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === activeIndex ? "scale-110 shadow-md" : "opacity-70"
                }`}
                style={{
                  backgroundColor:
                    index === activeIndex ? DEEP_CHARCOAL : "rgba(255,255,255,0.7)",
                }}
              />
            ))}
          </div>
        </section>
      )}

      {/* 🛋️ SALE PRODUCTS GRID */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-10 space-y-12">
        <div className="text-center">
          <h1
            className="text-3xl md:text-4xl font-bold mb-2"
            style={{ color: DEEP_CHARCOAL }}
          >
            Products on Sale
          </h1>
          <p className="text-gray-700">
            Discover discounts across all categories
          </p>
          <div
            className="mx-auto mt-3 h-[3px] w-24 rounded-full"
            style={{ backgroundColor: DEEP_BLUE }}
          />
        </div>

        {groupedByCategory.length === 0 ? (
          <p className="text-center text-gray-600 py-16">No products currently on sale.</p>
        ) : (
          groupedByCategory.map((cat) => (
            <div key={cat.id} className="space-y-6">
              <h2
                className="text-2xl font-semibold border-b pb-2"
                style={{ borderColor: DEEP_BLUE, color: DEEP_CHARCOAL }}
              >
                {cat.name}
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {cat.saleProducts.map((product: any) => (
                  <div key={product.id}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
