"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface BrandStorySectionProps {
  section: {
    heading?: string;
    subheading?: string;
    description?: string;
    imageUrl?: string;
    imageUrls?: string[];
  };
}

const DEEP_BLUE = "#4a9eb3";
const MUSTARD_LIGHT = "#c5a254";
const DEEP_CHARCOAL = "#1e1b18";
const OFF_WHITE = "#fafafa";

export default function BrandStorySection({ section }: BrandStorySectionProps) {
  const images: string[] =
    section?.imageUrls && section.imageUrls.length > 0
      ? section.imageUrls
      : section?.imageUrl
      ? [section.imageUrl]
      : [];

  const [current, setCurrent] = useState<number>(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images]);

  return (
    <motion.section
      className="relative py-20 md:py-24 overflow-x-hidden"
      style={{
        background: `linear-gradient(135deg, ${OFF_WHITE} 0%, ${DEEP_BLUE}08 100%)`,
      }}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true, amount: 0.25 }}
    >
      {/* Decorative subtle gradient blob */}
      <div
        className="absolute top-[-80px] right-[-100px] w-80 h-80 rounded-full blur-3xl opacity-20"
        style={{ backgroundColor: MUSTARD_LIGHT }}
      ></div>

      {/* Grid layout */}
      <motion.div
        className="max-w-7xl mx-auto grid md:grid-cols-2 gap-14 px-6 md:px-12 items-center relative z-10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{
          hidden: {},
          visible: {
            transition: { staggerChildren: 0.2, delayChildren: 0.2 },
          },
        }}
      >
        {/* Left Image Section */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 40 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-2xl shadow-sm border border-gray-100 w-full h-[400px] md:h-[460px] bg-white"
        >
          {images.length > 0 ? (
            images.map((img: string, index: number) => (
              <motion.img
                key={index}
                src={img}
                alt={`Brand story ${index + 1}`}
                className="absolute inset-0 w-full h-full object-cover"
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{
                  opacity: index === current ? 1 : 0,
                  scale: index === current ? 1 : 1.03,
                }}
                transition={{ duration: 1 }}
              />
            ))
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 italic">
              No images available
            </div>
          )}

          {/* Dots Navigation */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, index: number) => (
                <button
                  key={index}
                  onClick={() => setCurrent(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    index === current
                      ? "bg-gray-800 scale-110"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                />
              ))}
            </div>
          )}
        </motion.div>

        {/* Right Text Section */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 40 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative text-center md:text-left"
        >
          {/* Unified Heading */}
          <h2
            className="text-3xl md:text-4xl font-bold tracking-tight mb-3"
            style={{ color: DEEP_CHARCOAL }}
          >
            {section?.heading || "Our Story"}
          </h2>

          {section?.subheading && (
            <p className="text-lg text-gray-700 mb-3">
              {section.subheading}
            </p>
          )}

          {/* Mustard underline — unified style */}
          <div
            className="mx-auto md:mx-0 mt-3 h-[3px] w-24 rounded-full"
            style={{ backgroundColor: MUSTARD_LIGHT }}
          ></div>

          <p
            className="text-gray-700 leading-relaxed text-base md:text-lg mt-6"
            style={{ lineHeight: "1.75" }}
          >
            {section?.description ||
              "At Vaaya, every piece is designed with passion and crafted to perfection. We blend heritage craftsmanship with modern design to create something truly timeless."}
          </p>
        </motion.div>
      </motion.div>

      {/* Subtle bottom fade */}
      <div
        className="absolute bottom-0 left-0 w-full h-20"
        style={{
          background: `linear-gradient(to top, ${OFF_WHITE} 40%, transparent 100%)`,
        }}
      ></div>
    </motion.section>
  );
}
