"use client";

import { Truck, Headset, CheckCircle, Hammer } from "lucide-react";

const DEEP_CHARCOAL = "#292524";
const MUSTARD_LIGHT = "#dec08a";
const PURE_WHITE = "#ffffff";

export default function FollowUsInfoSection() {
  const infoCards = [
    {
      icon: <Truck className="w-8 h-8 transition-transform duration-300" style={{ color: MUSTARD_LIGHT }} />,
      title: "PAN INDIA DELIVERY",
      desc: "Get delivery at your doorstep, regardless of the city or state you live in.",
    },
    {
      icon: <Headset className="w-8 h-8 transition-transform duration-300" style={{ color: MUSTARD_LIGHT }} />,
      title: "RESPONSIVE SUPPORT",
      desc: "Have queries or issues? We’re just a click away to assist you anytime.",
    },
    {
      icon: <CheckCircle className="w-8 h-8 transition-transform duration-300" style={{ color: MUSTARD_LIGHT }} />,
      title: "QUALITY ASSURED",
      desc: "Each product passes our in-house quality checks before reaching you.",
    },
    {
      icon: <Hammer className="w-8 h-8 transition-transform duration-300" style={{ color: MUSTARD_LIGHT }} />,
      title: "HANDCRAFTED EXCELLENCE",
      desc: "Made with care and attention in every detail, combining design and durability.",
    },
  ];

  return (
    <section
      className="w-full py-16 px-6 md:px-16 border-t border-gray-200 relative overflow-hidden"
      style={{ backgroundColor: PURE_WHITE }}
    >
{/* 🌊 Enhanced Dual-Layer Wave Divider at Top */}
<div className="absolute top-0 left-0 w-full overflow-hidden leading-none rotate-180">
  <svg
    viewBox="0 0 1200 120"
    preserveAspectRatio="none"
    className="relative block w-[calc(100%+1.3px)] h-[90px]"
  >
    {/* Lighter base wave */}
    <path
      d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82-16.5,168.57-17.14,250.45.39,
      110,23.34,219.81,60.44,330.43,66.33,68.17,3.64,
      136.64-8.43,201.73-30.37V120H0V16.81
      C91.9,43.83,208.41,67.25,321.39,56.44Z"
      fill={MUSTARD_LIGHT}
      fillOpacity="0.18"
    ></path>

    {/* Slightly darker overlay wave for depth */}
    <path
      d="M0,67.6C150,120,400,100,600,60s400-40,600,10V120H0Z"
      fill={MUSTARD_LIGHT}
      fillOpacity="0.3"
    ></path>
  </svg>
</div>


      {/* Follow Us + Tagline */}
      <div className="text-center mb-12 mt-8 relative z-10">
        <p className="text-lg" style={{ color: DEEP_CHARCOAL }}>
          Follow us at
        </p>
        <h2
          className="text-2xl md:text-3xl font-semibold mb-1"
          style={{ color: DEEP_CHARCOAL }}
        >
          @vaaya_mart
        </h2>
        <p
          className="text-xl font-semibold italic"
          style={{ color: MUSTARD_LIGHT }}
        >
          “Seriously Wow.”
        </p>
      </div>

      {/* Horizontal Info Blocks */}
      <div className="flex flex-col md:flex-row justify-between items-stretch gap-6 overflow-x-auto scrollbar-hide relative z-10">
        {infoCards.map((card, index) => (
          <div
            key={index}
            className="flex flex-col justify-center items-center text-center bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 p-6 min-w-[250px] md:flex-1"
          >
            <div className="mb-3 group-hover:scale-110">{card.icon}</div>
            <h3
              className="text-lg font-semibold mb-1"
              style={{ color: DEEP_CHARCOAL }}
            >
              {card.title}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">{card.desc}</p>
          </div>
        ))}
      </div>

      {/* Brand Statement */}
      <div className="text-center mt-14 max-w-2xl mx-auto relative z-10">
        <p
          className="italic text-base md:text-lg leading-relaxed"
          style={{ color: DEEP_CHARCOAL }}
        >
          "We are obsessed with the honest union of iron and wood, uncompromising in the style, quality, and integrity of every piece we forge."
        </p>
      </div>
    </section>
  );
}
