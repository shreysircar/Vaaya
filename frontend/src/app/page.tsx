
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/ProductCard";

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

export default function HomePage() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-slide logic
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % bannerSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white"> {/* ✅ Full-page white background */}
      <div className="space-y-20 py-10">
        {/* --- HERO BANNER --- */}
        <section className="relative w-full overflow-hidden rounded-2xl shadow-md h-[420px] md:h-[520px] max-w-7xl mx-auto">
          <div
            className="flex transition-transform duration-700 ease-in-out h-full"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {bannerSlides.map((slide, index) => (
         <div key={slide.id} className="relative flex-shrink-0 w-full h-full min-w-full overflow-hidden">

                {/* Banner Image */}
                <img
                  src={slide.image}
                  alt={slide.title}
className={`absolute inset-0 w-full h-full object-cover transition-transform duration-[4000ms] ease-in-out ${
  index === activeIndex ? "scale-100" : "scale-[1.05]"
}`}

                />

                {/* Softer Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent"></div>

                {/* Overlay Text - aligned lower-left but higher to not block visuals */}
                <div className="absolute bottom-14 left-8 md:bottom-20 md:left-20 max-w-lg text-white z-20">
                  <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-snug drop-shadow-md">
                    {slide.title}
                  </h1>
                  <p className="text-base md:text-lg text-gray-200 mb-6 max-w-md leading-relaxed drop-shadow-sm">
                    {slide.subtitle}
                  </p>
                  <button
                    onClick={() => router.push("/shop")}
                    className="px-6 py-2 md:px-8 md:py-3 rounded-full font-semibold uppercase tracking-wide transition text-sm md:text-base shadow-md hover:scale-[1.03]"
                    style={{
                      backgroundColor: slide.buttonColor,
                      color: "white",
                    }}
                  >
                    {slide.cta}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Dots */}
          <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex space-x-2 z-30">
            {bannerSlides.map((_, index) => (
              <button
                key={index}
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

        {/* --- FEATURED PRODUCTS SECTION --- */}
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
