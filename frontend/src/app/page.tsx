"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import ProductCard, { Product } from "@/components/ProductCard";
import { motion, AnimatePresence, animate } from "framer-motion";
import { Poppins } from "next/font/google";
import FollowUsInfoSection from "@/components/FollowUsInfoSection";
import DynamicHomepageSection from "@/components/DynamicHomepageSection";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600", "700"] });

const DEEP_CHARCOAL = "#292524";
const DEEP_BLUE = "#81bdc9";
const DEEP_TEAL_DARK = "#014755";
const MUSTARD_LIGHT = "#dec08a";
const DEEP_YELLOW = "#e8cb58";
const OFF_WHITE = "#fafafa";

const staticSlides = [
  {
    id: "static-1",
    title: "Design Your Dream Home",
    subtitle: "Discover premium furniture collections built for comfort and style.",
    cta: "Explore Now",
    image: "/images/banner1.png",
    buttonColor: MUSTARD_LIGHT,
  },
  {
    id: "static-2",
    title: "Home Makeovers Made Easy",
    subtitle: "Transform your living space with curated essentials and timeless designs.",
    cta: "Shop The Look",
    image: "/images/banner2.png",
    buttonColor: DEEP_YELLOW,
  },
  {
    id: "static-3",
    title: "Your Space, Reimagined",
    subtitle: "Elevate your interiors with modern decor and handcrafted pieces.",
    cta: "Start Decorating",
    image: "/images/banner3.png",
    buttonColor: DEEP_BLUE,
  },
];

export default function HomePage() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [homepageSections, setHomepageSections] = useState<any[]>([]);
  const [bannerSlides, setBannerSlides] = useState<any[]>(staticSlides);
  const scrollRef = useRef<HTMLDivElement>(null);

  const smoothScroll = (distance: number) => {
    if (!scrollRef.current) return;
    const scrollContainer = scrollRef.current;
    const start = scrollContainer.scrollLeft;
    const end = start + distance;

    animate(start, end, {
      duration: 0.6,
      ease: "easeInOut",
      onUpdate(value) {
        scrollContainer.scrollLeft = value;
      },
    });
  };

  const handlePrevScroll = () => {
    if (!scrollRef.current) return;
    const distance = -scrollRef.current.offsetWidth * 0.8;
    smoothScroll(distance);
  };

  const handleNextScroll = () => {
    if (!scrollRef.current) return;
    const distance = scrollRef.current.offsetWidth * 0.8;
    smoothScroll(distance);
  };

  // cycle slides
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % bannerSlides.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [bannerSlides.length]);

  // fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`);
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        setProducts(data);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // homepage sections
  useEffect(() => {
    const fetchSections = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/homepage-sections`);
        if (!res.ok) throw new Error("Failed to fetch homepage sections");
        const data = await res.json();
        const active = data.filter((s: any) => s.isActive);
        setHomepageSections(active);
      } catch (error) {
        console.error("Error fetching homepage sections:", error);
      }
    };
    fetchSections();
  }, []);

  // fetch active sale (if any) and append as 4th banner (defensive: no image required)
  // 🧠 Fetch ALL active sales and append each as its own banner
// 🧠 Fetch ALL active sales and append each as its own banner (dynamic colors)
// 🧠 Fetch active sales (single or multiple) and append as dynamic banners with unique colors
useEffect(() => {
  let mounted = true;

  const SALE_BUTTON_COLORS = [
    "#c5a3a3", // dusty rose
    "#9aa88d", // sage green
    "#025a6a", // teal
    "#a29ba8", // smoky lavender
    "#94a6b3", // fog blue
    "#dec08a", // light mustard
    "#b97a5e", // terracotta mist
    "#687276", // slate gray
    "#4c5541", // midnight olive
  ];

  const fetchActiveSales = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sales/active`);
      if (!res.ok) {
        console.warn("No active sales found");
        if (mounted) setBannerSlides(staticSlides);
        return;
      }

      const data = await res.json();
      console.log("Fetched active sales:", data);

      // ✅ Ensure we always have an array
      const salesArray = Array.isArray(data) ? data : [data];

      if (salesArray.length === 0) {
        if (mounted) setBannerSlides(staticSlides);
        return;
      }

      // ✅ Assign colors dynamically (even for 1 sale)
const saleSlides = salesArray.map((sale: any, i: number) => ({
  id: sale.id || `sale-${i}`,
  title: sale.bannerText || sale.title || "Limited Time Offer!",
  subtitle:
    sale.description ||
    `Grab exciting discounts until ${
      sale.endDate ? new Date(sale.endDate).toLocaleDateString() : "soon"
    }!`,
  cta: sale.ctaText || "Shop Now",
  image: sale.bannerImageUrl || null,
  buttonColor: SALE_BUTTON_COLORS[Math.floor(Math.random() * SALE_BUTTON_COLORS.length)],
}));


      console.log("Sale slides with colors:", saleSlides);

      // ✅ Append sale slides to your static banners
      if (mounted) setBannerSlides([...staticSlides, ...saleSlides]);
    } catch (err) {
      console.error("Error fetching active sales:", err);
      if (mounted) setBannerSlides(staticSlides);
    }
  };

  fetchActiveSales();
  return () => {
    mounted = false;
  };
}, []);



  const handlePrev = () =>
    setActiveIndex((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length);
  const handleNext = () => setActiveIndex((prev) => (prev + 1) % bannerSlides.length);

  return (
    <div className={`min-h-screen bg-white ${poppins.className}`}>
      <div className="space-y-20 pt-0 pb-10">
        {/* --- HERO BANNER --- */}
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
              {/* If slide.image exists, render it; otherwise render a fallback gradient/background */}
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

          <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex space-x-2 z-30">
            {bannerSlides.map((_, index) => (
              <button
                key={"dot-" + index}
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

        {/* --- HORIZONTAL SCROLL BEST SELLERS --- */}
        <motion.section
          className="max-w-7xl mx-auto px-4 py-12 rounded-xl relative"
          style={{ backgroundColor: OFF_WHITE }}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, amount: 0.25 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3" style={{ color: DEEP_CHARCOAL }}>
              Our Collections
            </h2>

            <p className="text-lg text-gray-700 mb-3">
              Explore our handpicked furniture and décor collections crafted to perfection.
            </p>

            <div className="mx-auto mt-3 h-[3px] w-24 rounded-full" style={{ backgroundColor: DEEP_BLUE }} />
          </div>

          {loading ? (
            <p className="text-center text-gray-500">Loading products...</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : (
            <motion.div
              className="relative"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                hidden: {},
                visible: {
                  transition: { staggerChildren: 0.15, delayChildren: 0.2 },
                },
              }}
            >
              <button
                onClick={handlePrevScroll}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 text-white rounded-full w-10 h-10 flex items-center justify-center"
              >
                ❮
              </button>
              <button
                onClick={handleNextScroll}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 text-white rounded-full w-10 h-10 flex items-center justify-center"
              >
                ❯
              </button>

              <motion.div ref={scrollRef} className="flex gap-6 overflow-x-hidden px-12" style={{ scrollBehavior: "smooth" }}>
                {products.map((product) => (
                  <motion.div
                    key={product.id}
                    variants={{
                      hidden: { opacity: 0, y: 40 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    transition={{ duration: 0.5 }}
                    className="flex-shrink-0 w-64 text-sm"
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}
        </motion.section>

        {/* ✅ Dynamic Sections */}
        {homepageSections.map((section) => (
          <DynamicHomepageSection key={section.id} section={section} />
        ))}

        {/* ✅ Static Follow Us Section */}
        <FollowUsInfoSection />
      </div>
    </div>
  );
}
