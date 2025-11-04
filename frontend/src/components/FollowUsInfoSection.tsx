"use client";

import { Truck, Headset, CheckCircle, Hammer } from "lucide-react";

const DEEP_CHARCOAL = "#292524";
const DEEP_BLUE = "#81bdc9";
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
      className="w-full py-16 px-6 md:px-16 border-t border-gray-200"
      style={{ backgroundColor: PURE_WHITE }}
    >
      {/* Follow Us + Tagline */}
      <div className="text-center mb-12">
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
          style={{ color: DEEP_BLUE }}
        >
          “Seriously Wow.”
        </p>
      </div>

      {/* Horizontal Info Blocks */}
      <div className="flex flex-col md:flex-row justify-between items-stretch gap-6 overflow-x-auto scrollbar-hide">
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
      <div className="text-center mt-14 max-w-2xl mx-auto">
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
