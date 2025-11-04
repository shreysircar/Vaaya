"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  CheckCircle,
  XCircle,
  Heart,
  Tag,
  Star,
  Truck,
  Shield,
  RefreshCw,
  Gem,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const DEEP_CHARCOAL = "#292524";
const MUSTARD_LIGHT = "#dec08a";
const DEEP_BLUE = "#4a9eb3";
const TEAL_PRIMARY = "#025a6a";
const TEAL_DARK = "#014c57";

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  /* Fetch product */
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`);
        if (!res.ok) throw new Error("Failed to fetch product");
        const data = await res.json();
        setProduct(data);
      } catch (err: any) {
        setError(err.message || "Error fetching product");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  /* Wishlist Sync */
  useEffect(() => {
    if (!id) return;
    const saved = JSON.parse(localStorage.getItem("wishlist") || "[]");
    setIsWishlisted(saved.includes(id));
  }, [id]);

  const toggleWishlist = () => {
    if (!id) return;
    const saved = JSON.parse(localStorage.getItem("wishlist") || "[]");
    let updated;
    if (saved.includes(id)) {
      updated = saved.filter((pid: string) => pid !== id);
      setIsWishlisted(false);
    } else {
      updated = [...saved, id];
      setIsWishlisted(true);
    }
    localStorage.setItem("wishlist", JSON.stringify(updated));
  };

  const increaseQty = () => setQuantity((q) => q + 1);
  const decreaseQty = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  const handleNextImage = () => {
    if (!product?.imageUrls?.length) return;
    setCurrentImageIndex((prev) => (prev + 1) % product.imageUrls.length);
  };

  const handlePrevImage = () => {
    if (!product?.imageUrls?.length) return;
    setCurrentImageIndex((prev) =>
      prev === 0 ? product.imageUrls.length - 1 : prev - 1
    );
  };

  if (loading)
    return <p className="text-center py-20 text-gray-500">Loading product...</p>;
  if (error)
    return <p className="text-center py-20 text-red-500">{error}</p>;
  if (!product)
    return <p className="text-center py-20 text-gray-500">Product not found</p>;

  const images = product.imageUrls && product.imageUrls.length > 0
    ? product.imageUrls
    : [product.imageUrl || "/images/placeholder.jpg"];

  return (
    <section className="min-h-screen bg-white flex justify-center items-center py-20 px-6 md:px-16">
      <motion.div
        className="max-w-6xl w-full grid md:grid-cols-2 gap-10 bg-white"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Left: Image Carousel */}
        <div className="relative w-full bg-white">
          {/* Main Image */}
          <img
            src={images[currentImageIndex]}
            alt={product.name}
            className="w-full h-[500px] object-cover transition-all duration-500"
          />

          {/* Centered Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute top-1/2 left-4 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow hover:bg-white transition"
              >
                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute top-1/2 right-4 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow hover:bg-white transition"
              >
                <ChevronRight className="w-6 h-6 text-gray-700" />
              </button>
            </>
          )}

          {/* Wishlist Icon */}
          <motion.button
            onClick={toggleWishlist}
            whileTap={{ scale: 0.9 }}
            className="absolute top-5 right-5 bg-white/80 backdrop-blur-sm rounded-full p-3 shadow-md hover:shadow-lg transition-all"
          >
            <Heart
              className={`w-6 h-6 ${
                isWishlisted
                  ? "fill-current text-[#dec08a]"
                  : "text-gray-600 hover:text-[#dec08a]"
              }`}
            />
          </motion.button>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex justify-center gap-3 mt-4 py-3 bg-white border-t border-gray-100">
              {images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`w-20 h-20 overflow-hidden border-2 transition-all duration-300 ${
                    idx === currentImageIndex
                      ? "border-[#025a6a]"
                      : "border-transparent hover:border-gray-300"
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Details */}
        <div className="flex flex-col justify-center p-4 md:p-6 bg-white">
          {/* Category Path */}
          {product.parentCategory?.name && (
            <p className="uppercase text-xs font-medium tracking-wider text-gray-500 mb-2">
              {product.parentCategory.name}
              {product.subCategory?.name && ` → ${product.subCategory.name}`}
            </p>
          )}

          {/* Title + Rating */}
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-3xl md:text-4xl font-bold text-[#292524]">
              {product.name}
            </h1>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < 4 ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                  }`}
                />
              ))}
              <span className="text-sm text-gray-500 ml-1">(4.5)</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2 mb-6">
            <Tag className="w-5 h-5 text-[#292524]" />
            <span className="text-2xl font-semibold text-[#292524]">
              ₹{product.price.toLocaleString()}
            </span>
          </div>

          {/* Stock */}
          <div className="flex items-center mb-6">
            {product.stock > 0 ? (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 border border-green-300">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-green-700 text-sm font-medium">
                  In Stock ({product.stock})
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 border border-red-300">
                <XCircle className="w-4 h-4 text-red-500" />
                <span className="text-red-600 text-sm font-medium">
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center gap-3 mb-8">
            <button
              onClick={decreaseQty}
              className="w-8 h-8 flex items-center justify-center rounded-full border text-lg hover:bg-gray-100"
            >
              -
            </button>
            <span className="font-semibold text-gray-800">{quantity}</span>
            <button
              onClick={increaseQty}
              className="w-8 h-8 flex items-center justify-center rounded-full border text-lg hover:bg-gray-100"
            >
              +
            </button>
          </div>

          {/* Description */}
          <p className="text-gray-700 leading-relaxed text-base mb-8">
            {product.description ||
              "This handcrafted piece combines modern aesthetics with timeless craftsmanship, ensuring it becomes the centerpiece of your living space."}
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap gap-4 mb-8">
            <button
              className="px-6 py-3 rounded-full font-semibold shadow-md text-white transition-all duration-300 hover:scale-105 hover:bg-[#014c57]"
              style={{ backgroundColor: TEAL_PRIMARY }}
            >
              <ShoppingCart className="inline-block mr-2 w-5 h-5" />
              Add to Cart
            </button>

            <button
              className="px-6 py-3 rounded-full font-semibold text-white shadow-md transition-all duration-300 hover:scale-105 hover:bg-[#014c57]"
              style={{ backgroundColor: TEAL_PRIMARY }}
            >
              Buy Now
            </button>
          </div>

          {/* Gradient Crafted Info */}
          <div
            className="flex items-center justify-center gap-4 px-6 py-5 rounded-2xl mb-10 shadow-md"
            style={{
              background: `linear-gradient(135deg, ${DEEP_BLUE}90, ${MUSTARD_LIGHT}90)`,
              boxShadow: `0 4px 15px ${DEEP_BLUE}40`,
            }}
          >
            <Sparkles className="w-8 h-8 text-white" />
            <p className="text-base font-medium text-white leading-snug text-center">
              Crafted for comfort and designed with passion — timeless furniture that elevates every corner of your home.
            </p>
          </div>

          {/* Info Boxes */}
          <div className="grid grid-cols-3 gap-6 mt-4 text-center">
            {[
              { icon: Truck, text: "PAN India Delivery" },
              { icon: Shield, text: "Secure Payments" },
              { icon: RefreshCw, text: "Easy Returns" },
            ].map(({ icon: Icon, text }, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center justify-center h-36 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 p-5"
              >
                <Icon className="w-7 h-7 text-[#025a6a] mb-3" />
                <div className="h-[1px] w-10 bg-[#025a6a]/30 mb-2"></div>
                <p className="text-sm font-medium text-[#292524]">{text}</p>
              </div>
            ))}
          </div>

          {/* Stamps */}
          <div className="grid grid-cols-3 gap-6 mt-6 text-center">
            {[
              { icon: Gem, text: "Premium Quality" },
              { icon: Sparkles, text: "Handcrafted" },
              { icon: CheckCircle, text: "QC Verified" },
            ].map(({ icon: Icon, text }, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center justify-center h-36 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 p-5"
              >
                <Icon className="w-7 h-7 text-[#025a6a] mb-3" />
                <div className="h-[1px] w-10 bg-[#025a6a]/30 mb-2"></div>
                <p className="text-sm font-medium text-[#292524]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
