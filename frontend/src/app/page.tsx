"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import localFont from "next/font/local";
import { motion, AnimatePresence } from "framer-motion";

// --- Corporate Font (Inter or Poppins) ---
import { Poppins } from "next/font/google";
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600", "700"] });

// --- Color Palette ---
const DEEP_CHARCOAL = "#292524";
const DEEP_BLUE = "#81bdc9";
const DEEP_TEAL_DARK = "#014755";
const MUSTARD_LIGHT = "#dec08a";
const DEEP_YELLOW = "#e8cb58";
const OFF_WHITE = "#fafafa";

// --- Banner Data ---
const bannerSlides = [
  {
    id: 1,
    title: "Design Your Dream Home",
    subtitle: "Discover premium furniture collections built for comfort and style.",
    cta: "Explore Now",
    image: "/images/banner1.png",
    buttonColor: MUSTARD_LIGHT,
  },
  {
    id: 2,
    title: "Home Makeovers Made Easy",
    subtitle: "Transform your living space with curated essentials and timeless designs.",
    cta: "Shop The Look",
    image: "/images/banner2.png",
    buttonColor: DEEP_YELLOW,
  },
  {
    id: 3,
    title: "Your Space, Reimagined",
    subtitle: "Elevate your interiors with modern decor and handcrafted pieces.",
    cta: "Start Decorating",
    image: "/images/banner3.png",
    buttonColor: DEEP_BLUE,
  },
];

// --- Sample Products ---
const sampleProducts = [
  { id: 1, name: "Wireless Headphones", price: 99.99, image: "https://via.placeholder.com/300" },
  { id: 2, name: "Smartwatch", price: 149.0, image: "https://via.placeholder.com/300" },
  { id: 3, name: "Gaming Mouse", price: 59.5, image: "https://via.placeholder.com/300" },
  { id: 4, name: "Bluetooth Speaker", price: 79.99, image: "https://via.placeholder.com/300" },
  { id: 5, name: "E-Reader Tablet", price: 199.0, image: "https://via.placeholder.com/300" },
  { id: 6, name: "Smart Home Hub", price: 89.99, image: "https://via.placeholder.com/300" },
];
// ⬆️ keep all imports the same

export default function HomePage() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);

  // ⏳ Auto-slide logic (interval increased to 8 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 2) % bannerSlides.length);
    }, 8000); // ← was 5000, now 8000ms
    return () => clearInterval(interval);
  }, []);

  const handlePrev = () => setActiveIndex((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length);
  const handleNext = () => setActiveIndex((prev) => (prev + 1) % bannerSlides.length);

  return (
    <div className={`min-h-screen bg-white ${poppins.className}`}>
      <div className="space-y-20 py-10">
   {/* --- HERO BANNER --- */}
<section className="relative w-full overflow-hidden rounded-2xl shadow-md h-[420px] md:h-[520px] max-w-7xl mx-auto">
  {bannerSlides.map((slide, index) => (
    <motion.div
      key={slide.id}
      className="absolute inset-0 w-full h-full overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: index === activeIndex ? 1 : 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      {/* 🖼️ Banner Image with zoom */}
      <motion.img
        src={slide.image}
        alt={slide.title}
        initial={{ scale: 1.15 }}
        animate={{ scale: index === activeIndex ? 1 : 1.15 }}
        transition={{ duration: 1, ease: "easeInOut" }}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* 🌫️ Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent"></div>

      {/* ✨ Animated Text Overlay */}
      <AnimatePresence mode="wait">
        {index === activeIndex && (
          <motion.div
            key={slide.id}
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

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => router.push("/shop")}
              className="px-6 py-2 md:px-8 md:py-3 rounded-full font-semibold uppercase tracking-wide shadow-md text-sm md:text-base"
              style={{ backgroundColor: slide.buttonColor, color: "white" }}
            >
              {slide.cta}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  ))}

  {/* ⬅️➡️ Arrows */}
  <button
    onClick={handlePrev}
    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl z-30 transition"
  >
    ❮
  </button>

  <button
    onClick={handleNext}
    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl z-30 transition"
  >
    ❯
  </button>

  {/* ⚫ Navigation Dots */}
  <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex space-x-2 z-30">
    {bannerSlides.map((_, index) => (
      <button
        key={index}
        onClick={() => setActiveIndex(index)}
        className={`w-3 h-3 rounded-full transition-all duration-300 ${
          index === activeIndex ? "scale-110 shadow-md" : "opacity-70"
        }`}
        style={{
          backgroundColor: index === activeIndex ? DEEP_CHARCOAL : "rgba(255,255,255,0.7)",
        }}
      />
    ))}
  </div>
</section>

        {/* --- FEATURED PRODUCTS --- */}
        <section
          className="max-w-7xl mx-auto px-4 py-12 rounded-xl"
          style={{ backgroundColor: OFF_WHITE }}
        >
          <h2
            className="text-3xl font-extrabold mb-8 tracking-tight border-b border-gray-200 pb-3"
            style={{ color: DEEP_CHARCOAL }}
          >
            Best Sellers This Week
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {sampleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
