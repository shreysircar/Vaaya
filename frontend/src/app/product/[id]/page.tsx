"use client";
import { apiRequest } from "@/utils/api";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation"; // 🟢 added router import
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
import { notify } from "@/utils/notify";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { applySaleToProduct } from "@/utils/saleUtils";

const DEEP_CHARCOAL = "#292524";
const MUSTARD_LIGHT = "#dec08a";
const DEEP_BLUE = "#4a9eb3";
const TEAL_PRIMARY = "#025a6a";
const TEAL_DARK = "#014c57";

interface Sale {
  id: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  parentCategoryId?: string | null;
  subCategoryId?: string | null;
  productId?: string | null;
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter(); // 🟢 added
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"description" | "care" | "disclaimer">("description");

  // ✅ Sale states
const [finalPrice, setFinalPrice] = useState<number | null>(null);
const [hasSale, setHasSale] = useState(false);

  // 🟢 context hooks
  const { addToCart } = useCart();
  const { wishlist, toggleWishlist } = useWishlist();
  const { user } = useAuth();


const isWishlisted = Array.isArray(wishlist?.items)
  ? wishlist.items.some((item: any) => item.productId === String(id))
  : false;


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

// ✅ Fetch active sales and compute discounted price
useEffect(() => {
  const fetchSales = async () => {
    try {
      const activeSales = await apiRequest<Sale[]>("/api/sales/active", { method: "GET" });
      if (product) {
        const { finalPrice, sale } = applySaleToProduct(product, activeSales || []);
        setFinalPrice(finalPrice);
        setHasSale(Boolean(sale));
      }
    } catch (err) {
      console.error("Sale fetch error:", err);
      setFinalPrice(null);
      setHasSale(false);
    }
  };

  if (product) fetchSales();
}, [product]);


  // 🟢 Updated wishlist handler
const handleToggleWishlist = async () => {
  if (!user) {
    notify.loginRequired("Please log in to use Wishlist");
    return;
  }

  try {
    await toggleWishlist(String(id));

    // show feedback based on whether it’s added or removed
    if (isWishlisted) {
      notify.info("Removed from Wishlist");
    } else {
      notify.success("Added to Wishlist");
    }
  } catch (error) {
    console.error("Failed to toggle wishlist:", error);
    notify.error("Something went wrong. Please try again.");
  }
};


  // 🟢 Add to cart logic
const handleAddToCart = async () => {
  if (!user) {
  notify.loginRequired("Please log in to add items to cart");
  return;
}

const res = await addToCart(String(id), quantity, product.price);

if (!res.ok) {
  notify.error(res.message || "Could not add to cart — please check stock.");
  return;
}

notify.success("Added to cart successfully!");};



  // 🟢 Buy Now (add then go to checkout)
const handleBuyNow = async () => {
if (!user) {
  notify.loginRequired("Please log in to continue to checkout");
  return;
}

const res = await addToCart(String(id), quantity, product.price);
if (!res.ok) {
  notify.error(res.message || "Could not add to cart — please check stock.");
  return;
}

notify.success("Added to cart! Redirecting to checkout...");
router.push("/checkout");

};


const increaseQty = () => {
  if (quantity < product.stock) {
    setQuantity((q) => q + 1);
  } else {
  notify.info(`Only ${product.stock} units available.`);
  }
};

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

  const images =
    product.imageUrls && product.imageUrls.length > 0
      ? product.imageUrls
      : [product.imageUrl || "/images/placeholder.jpg"];

  return (
    <div className="bg-white text-[#292524] pb-10">
      <section className="min-h-screen bg-white flex justify-center py-20 px-6 md:px-16">
        <motion.div
          className="max-w-6xl w-full grid md:grid-cols-2 gap-10 bg-white"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Left: Image Carousel */}
          <div className="relative w-full bg-white">
            <img
              src={images[currentImageIndex]}
              alt={product.name}
              className="w-full h-[500px] object-cover transition-all duration-500"
            />

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

            {/* 🟢 Updated wishlist button */}
            <motion.button
              onClick={handleToggleWishlist}
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
            {product.parentCategory?.name && (
              <p className="uppercase text-xs font-medium tracking-wider text-gray-500 mb-2">
                {product.parentCategory.name}
                {product.subCategory?.name && ` → ${product.subCategory.name}`}
              </p>
            )}

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

<div className="flex items-center gap-2 mb-6">
  <Tag className="w-5 h-5 text-[#292524]" />
  {hasSale ? (
    <>
      <span className="text-xl line-through text-gray-500">
        ₹{product.price.toLocaleString()}
      </span>
      <span className="text-2xl font-semibold text-[#292524]">
        ₹{finalPrice?.toLocaleString()}
      </span>
    </>
  ) : (
    <span className="text-2xl font-semibold text-[#292524]">
      ₹{product.price.toLocaleString()}
    </span>
  )}
</div>


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

            <p className="text-gray-700 leading-relaxed text-base mb-8">
              {product.description ||
                "This handcrafted piece combines modern aesthetics with timeless craftsmanship, ensuring it becomes the centerpiece of your living space."}
            </p>

            {/* 🟢 Cart & Buy buttons updated */}
            <div className="flex flex-wrap gap-4 mb-8">
              <button
                onClick={handleAddToCart}
                className="px-6 py-3 rounded-full font-semibold shadow-md text-white transition-all duration-300 hover:scale-105 hover:bg-[#014c57]"
                style={{ backgroundColor: TEAL_PRIMARY }}
              >
                <ShoppingCart className="inline-block mr-2 w-5 h-5" />
                Add to Cart
              </button>

              <button
                onClick={handleBuyNow}
                className="px-6 py-3 rounded-full font-semibold text-white shadow-md transition-all duration-300 hover:scale-105 hover:bg-[#014c57]"
                style={{ backgroundColor: TEAL_PRIMARY }}
              >
                Buy Now
              </button>
            </div>
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

     {/* ✅ Bottom Section: Description | Care & Instructions | Disclaimer */}
{/* ✅ Bottom Section: Description | Care & Instructions | Disclaimer */}
<div className="w-full bg-white border-t border-gray-200 mt-20">
  <div className="max-w-6xl mx-auto px-4 py-10">
    {/* Tabs */}
    <div className="flex justify-center space-x-10 border-b border-gray-200 pb-3">
      {[
        { id: "description", label: "Description (Specifications)" },
        { id: "care", label: "Care & Instructions" },
        { id: "disclaimer", label: "Disclaimer" },
      ].map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id as any)}
          className={`pb-2 px-2 text-sm md:text-base font-semibold transition-all duration-300 ${
            activeTab === tab.id
              ? "text-[#dec08a] border-b-2 border-[#dec08a]"
              : "text-gray-500 hover:text-[#dec08a]"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>

    {/* Tab Content */}
    <motion.div
      key={activeTab}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="mt-8 text-gray-700 leading-relaxed text-sm md:text-base"
    >
      {activeTab === "description" && (
        <div>
          <p className="mb-6">{product.description}</p>

          {product.specifications?.length > 0 && (
            <div className="border border-gray-200 overflow-hidden">
              <table className="w-full text-sm border-collapse">
                <tbody>
                  {product.specifications.map(
                    (spec: { key: string; value: string }, idx: number) => (
                      <tr key={idx} className="border-b border-gray-200">
                        <td className="px-6 py-3 font-medium text-[#292524] w-1/3 border-r border-gray-200">
                          {spec.key}
                        </td>
                        <td className="px-6 py-3 text-gray-600">{spec.value}</td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "care" && (
        <div>
          <h3 className="font-semibold text-[#292524] mb-3">Care & Instructions</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>Wipe clean with a soft, dry cloth.</li>
            <li>Avoid using harsh chemicals or abrasive materials on the surface.</li>
            <li>Keep away from direct sunlight and moisture to maintain finish.</li>
            <li>For wooden products, use furniture wax or oil occasionally to retain shine.</li>
          </ul>
        </div>
      )}

    {activeTab === "disclaimer" && (
  <div>
    <h3 className="font-semibold text-[#292524] mb-3">Disclaimer</h3>
    <ul className="list-disc list-inside text-gray-700 space-y-2">
      <li>
        The decorative accessories shown in the images are for representation purposes only and are not included with the product unless clearly mentioned.
      </li>
      <li>
        As this product is crafted from solid wood, natural variations in wood grain and texture are to be expected, giving each piece its unique character.
      </li>
      <li>
        Handcrafted or hand-painted details may exhibit minor differences between the displayed image and the actual product.
      </li>
      <li>
        Depending on your device’s display settings and lighting conditions, slight variations in fabric color or wood finish may occur between on-screen images and the physical product.
      </li>
      <li>
        The primary material listed refers to the main component used in the product’s construction. Secondary materials may also be utilized for structural integrity or finishing purposes.
      </li>
    </ul>
  </div>
)}

    </motion.div>
  </div>
</div>

    </div> // ✅ End wrapper
  );
};
