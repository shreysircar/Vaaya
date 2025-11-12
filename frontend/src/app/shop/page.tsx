"use client";

import { useEffect, useMemo, useState } from "react";
import { Poppins } from "next/font/google";
import ProductCard from "@/components/ProductCard";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600", "700"] });

/* 🎨 Theme Colors */
const DEEP_CHARCOAL = "#292524";
const DEEP_BLUE = "#81bdc9";
const DEEP_TEAL_DARK = "#014755";

export default function ShopPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [activeParent, setActiveParent] = useState<string>("all");
  const [activeSub, setActiveSub] = useState<string>("all");
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* 🧩 Fetch categories + products */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`),
        ]);

        if (!catRes.ok || !prodRes.ok) throw new Error("Failed to fetch data");

        const [catData, prodData] = await Promise.all([
          catRes.json(),
          prodRes.json(),
        ]);

        setCategories(catData || []);
        setProducts(prodData || []);
      } catch (err: any) {
        setError(err.message || "Something went wrong while fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* 🧭 Update subcategories when parent changes */
  useEffect(() => {
    if (activeParent === "all") {
      setSubcategories([]);
      setActiveSub("all");
      return;
    }

    const parentCat = categories.find((c) => c.id === activeParent);
    setSubcategories(parentCat?.subcategories || []);
    setActiveSub("all");
  }, [activeParent, categories]);

  /* 🧮 Filter Products */
  const filteredProducts = useMemo(() => {
    let list = [...products];
    if (activeParent !== "all") {
      list = list.filter((p) => p.parentCategoryId === activeParent);
    }
    if (activeSub !== "all") {
      list = list.filter((p) => p.subCategoryId === activeSub);
    }
    return list;
  }, [products, activeParent, activeSub]);

  if (loading)
    return <p className="text-center py-20 text-gray-600">Loading...</p>;
  if (error)
    return <p className="text-center py-20 text-red-600">{error}</p>;

  return (
    <div className={`min-h-screen bg-white ${poppins.className}`}>
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-10 space-y-8">

        {/* 🏷️ Header */}
        <div className="text-center">
          <h1
            className="text-3xl md:text-4xl font-bold mb-2"
            style={{ color: DEEP_CHARCOAL }}
          >
            All Products
          </h1>
          <p className="text-gray-700">Explore all available furniture and décor</p>
          <div
            className="mx-auto mt-3 h-[3px] w-24 rounded-full"
            style={{ backgroundColor: DEEP_BLUE }}
          />
        </div>

        {/* 🧭 Category Filters */}
        <div className="flex flex-col gap-4">
          {/* Parent Categories */}
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => {
                setActiveParent("all");
                setActiveSub("all");
              }}
              className={`px-4 py-2 rounded-full border transition ${
                activeParent === "all"
                  ? "text-white"
                  : "text-gray-800 hover:bg-gray-100"
              }`}
              style={{
                borderColor: activeParent === "all" ? DEEP_TEAL_DARK : "#e5e7eb",
                backgroundColor:
                  activeParent === "all" ? DEEP_TEAL_DARK : "transparent",
              }}
            >
              All Categories
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveParent(cat.id);
                  setActiveSub("all");
                }}
                className={`px-4 py-2 rounded-full border transition ${
                  activeParent === cat.id
                    ? "text-white"
                    : "text-gray-800 hover:bg-gray-100"
                }`}
                style={{
                  borderColor:
                    activeParent === cat.id ? DEEP_BLUE : "#e5e7eb",
                  backgroundColor:
                    activeParent === cat.id ? DEEP_BLUE : "transparent",
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Subcategory Filter */}
          {subcategories.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => setActiveSub("all")}
                className={`px-3 py-1.5 rounded-full border text-sm transition ${
                  activeSub === "all"
                    ? "text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                style={{
                  borderColor:
                    activeSub === "all" ? DEEP_TEAL_DARK : "#e5e7eb",
                  backgroundColor:
                    activeSub === "all" ? DEEP_TEAL_DARK : "transparent",
                }}
              >
                All Subcategories
              </button>

              {subcategories.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setActiveSub(sub.id)}
                  className={`px-3 py-1.5 rounded-full border text-sm transition ${
                    activeSub === sub.id
                      ? "text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  style={{
                    borderColor:
                      activeSub === sub.id ? DEEP_BLUE : "#e5e7eb",
                    backgroundColor:
                      activeSub === sub.id ? DEEP_BLUE : "transparent",
                  }}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 🛋️ Product Grid (no animation) */}
        {filteredProducts.length === 0 ? (
          <p className="text-center text-gray-600 py-16">No products found.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
