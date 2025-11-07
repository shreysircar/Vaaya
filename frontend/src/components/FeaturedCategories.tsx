"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion"; // ✅ added

const DEEP_CHARCOAL = "#292524";
const MUSTARD_LIGHT = "#dec08a";

interface Category {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
}

interface HomepageSection {
  id: string;
  type: string;
  heading?: string;
  subheading?: string;
  categoryIds?: string[];
  isActive: boolean;
}

interface FeaturedCategoriesProps {
  section?: HomepageSection; // ✅ optional prop
}

export default function FeaturedCategories({ section: passedSection }: FeaturedCategoriesProps) {
  const [section, setSection] = useState<HomepageSection | null>(passedSection || null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(!passedSection);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        let currentSection = passedSection;

        // ✅ If section wasn't passed from parent, fetch it manually
        if (!currentSection) {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/homepage-sections`);
          if (!res.ok) throw new Error("Failed to fetch homepage sections");
          const sections = await res.json();
          currentSection = sections.find((s: HomepageSection) => s.type === "featured_categories");
          setSection(currentSection || null);
        }

        if (!currentSection?.categoryIds?.length) return;

        // Fetch categories
        const catRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`);
        if (!catRes.ok) throw new Error("Failed to fetch categories");
        const allCategories = await catRes.json();

        const filtered = allCategories.filter((c: Category) =>
          currentSection!.categoryIds!.includes(c.id)
        );
        setCategories(filtered);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [passedSection]);

  if (loading)
    return <p className="text-center py-12 text-gray-500">Loading featured categories...</p>;
  if (error) return <p className="text-center py-12 text-red-500">{error}</p>;
  if (!section || categories.length === 0) return null;

  return (
    <motion.section
      className="w-full py-16 px-6 md:px-16 border-t border-gray-100 bg-white"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true, amount: 0.2 }}
    >
      {/* Heading */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        viewport={{ once: true }}
      >
        {section.heading && (
          <h2
            className="text-3xl md:text-4xl font-bold mb-2 tracking-tight"
            style={{ color: DEEP_CHARCOAL }}
          >
            {section.heading}
          </h2>
        )}

        {section.subheading && (
          <p className="text-lg text-gray-600 mb-3">{section.subheading}</p>
        )}

        {/* Mustard underline */}
        <div
          className="mx-auto mt-2 h-[3px] w-24 rounded-full"
          style={{ backgroundColor: MUSTARD_LIGHT }}
        ></div>
      </motion.div>

      {/* Category Cards with staggered reveal */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-7xl mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{
          hidden: {},
          visible: {
            transition: { staggerChildren: 0.15, delayChildren: 0.3 },
          },
        }}
      >
        {categories.map((cat) => (
          <motion.div
            key={cat.id}
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative group overflow-hidden rounded-2xl cursor-pointer border border-gray-100 hover:shadow-lg transition-all duration-300"
            onClick={() => router.push(`/category/${cat.id}`)}

          >
            <img
              src={cat.imageUrl || "/images/placeholder.jpg"}
              alt={cat.name}
              className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-all duration-300" />
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-center">
              <h3
                className="text-white text-xl font-semibold uppercase tracking-wide drop-shadow-lg"
                style={{ textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}
              >
                {cat.name}
              </h3>
              <div
                className="mx-auto mt-2 h-[2px] w-12 rounded-full"
                style={{ backgroundColor: MUSTARD_LIGHT }}
              ></div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
}
