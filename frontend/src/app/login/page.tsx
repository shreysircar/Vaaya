"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const AuthForm = dynamic(() => import("@/components/AuthForm"), {
  ssr: false,
});

export default function LoginPage() {
  const slides = [
    {
      id: 1,
      image: "/images/login_sofa.png",
      title: "Modern Designs",
      subtitle: "Design your dream home with curated modern essentials.",
    },
    {
      id: 2,
      image: "/images/login_interior.png", // Make sure this file exists
      title: "Comfort Meets Style",
      subtitle: "Shop premium furniture & decor with ease.",
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="flex w-full min-h-[90vh] bg-[#F5F5F4] overflow-hidden pb-20">
      {/* --- LEFT SECTION: IMAGE SLIDER --- */}
      <div className="hidden lg:flex w-6/12 relative overflow-hidden rounded-r-2xl shadow-xl min-h-[90vh]">
        <div
          className="flex transition-transform duration-700 ease-in-out w-full h-full"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className="relative w-full h-full flex-shrink-0"
            >
              {/* Image */}
              <img
                src={slide.image}
                alt={slide.title}
                className={`absolute inset-0 w-full h-full object-cover transition-transform duration-[4000ms] ease-in-out ${
                  index === activeIndex ? "scale-110" : "scale-100"
                }`}
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent" />

              {/* Text */}
              <div className="absolute bottom-16 left-10 text-white max-w-md z-10">
                <h2 className="text-3xl font-bold mb-2 drop-shadow-lg">
                  {slide.title}
                </h2>
                <p className="text-gray-200 text-sm drop-shadow-md">
                  {slide.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Dots */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === activeIndex ? "bg-white scale-110" : "bg-gray-400 opacity-70"
              }`}
            />
          ))}
        </div>
      </div>

      {/* --- RIGHT SECTION: LOGIN FORM --- */}
      <div className="flex w-full lg:w-6/12 items-center justify-center p-8 sm:p-12 lg:p-16">
        <div className="w-full max-w-md">
          <AuthForm type="login" />
        </div>
      </div>
    </div>
  );
}
