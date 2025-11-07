"use client";

import { useCart } from "@/context/CartContext";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CartPage() {
  const { cart, loading, removeFromCart, clearCart, updateCartItemQuantity } = useCart();
  const router = useRouter();
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

  if (loading) return <div className="p-10 text-gray-600">Loading your cart...</div>;
  if (!cart || !cart.items || cart.items.length === 0)
    return <div className="p-10 text-center text-gray-500">Your cart is empty 🛒</div>;

  const total = cart.items.reduce(
    (sum: number, i: any) => sum + (i.price || i.product.price) * i.quantity,
    0
  );

  // ✅ Updated logic: use PATCH route for +/− changes
const handleQuantityChange = async (
  productId: string,
  currentQty: number,
  action: "increase" | "decrease"
) => {
  // 🧠 prevent double-clicks while one request is in progress
  if (loadingMap[productId]) return;

  try {
    setLoadingMap((prev) => ({ ...prev, [productId]: true }));

    if (action === "increase") {
      const res = await updateCartItemQuantity(productId, +1);
      if (!res.ok && res.message) alert(res.message);
    } else {
      if (currentQty > 1) {
        const res = await updateCartItemQuantity(productId, -1);
        if (!res.ok && res.message) alert(res.message);
      } else {
        if (confirm("Remove this item from your cart?")) {
          await removeFromCart(productId);
        }
      }
    }
  } catch (err) {
    console.error("Error updating quantity:", err);
  } finally {
    setTimeout(() => {
      // tiny delay to avoid immediate re-click
      setLoadingMap((prev) => ({ ...prev, [productId]: false }));
    }, 200);
  }
};


  // ✅ UI remains exactly the same
  return (
    <div className="min-h-screen bg-[#F5F5F4] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-semibold mb-8 text-[#025a6a]">Your Cart</h1>

        <div className="space-y-5">
          {cart.items.map((item: any) => (
            <div
              key={item.id}
              className="flex justify-between items-center border border-gray-200 rounded-lg p-4 bg-white hover:shadow-sm transition cursor-pointer"
            >
              <div
                className="flex items-center gap-4"
                onClick={() => router.push(`/product/${item.product.id}`)}
              >
                <Image
                  src={item.product.imageUrl || "/placeholder.png"}
                  alt={item.product.name}
                  width={80}
                  height={80}
                  className="rounded-md object-cover"
                />
                <div>
                  <h2 className="font-medium text-gray-800">{item.product.name}</h2>
                  <p className="text-sm text-gray-500">
                    ₹{item.product.price.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-5">
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button
                    disabled={loadingMap[item.product.id]}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuantityChange(item.product.id, item.quantity, "decrease");
                    }}
                    className="px-2 py-1 text-gray-700 hover:text-[#025a6a] transition"
                  >
                    −
                  </button>
                  <span className="px-3 text-gray-800 font-medium">{item.quantity}</span>
                  <button
                    disabled={loadingMap[item.product.id]}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuantityChange(item.product.id, item.quantity, "increase");
                    }}
                    className="px-2 py-1 text-gray-700 hover:text-[#025a6a] transition"
                  >
                    +
                  </button>
                </div>

                <p className="font-semibold text-gray-800">
                  ₹{(item.product.price * item.quantity).toFixed(2)}
                </p>

                <button
                  disabled={loadingMap[item.product.id]}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromCart(item.product.id);
                  }}
                  className="text-red-600 hover:text-red-700 text-sm font-medium transition"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="font-semibold text-lg text-gray-800">
            Total: ₹{total.toLocaleString("en-IN")}
          </p>

          <div className="flex gap-3">
            <button
              onClick={clearCart}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition font-medium"
            >
              Clear Cart
            </button>

            <button
              onClick={() => router.push("/checkout")}
              className="bg-[#ba9d5d] text-white px-6 py-2 rounded-md hover:bg-[#a98c4f] transition font-semibold shadow-md"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
