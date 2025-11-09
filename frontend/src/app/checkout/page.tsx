"use client";

import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { applySaleToProduct, type Sale } from "@/utils/saleUtils";

export default function CheckoutPage() {
  const { cart, checkoutOrder, refreshCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sales, setSales] = useState<Sale[]>([]);

  // 🟢 Fetch active sales once
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sales/active`);
        if (res.ok) {
          const data = await res.json();
          setSales(data);
        }
      } catch (err) {
        console.error("Error fetching active sales:", err);
      }
    })();
  }, []);

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="p-10 text-center text-gray-500">
        Your cart is empty 🛒 <br />
        <button
          onClick={() => router.push("/")}
          className="mt-4 bg-[#ba9d5d] text-white px-4 py-2 rounded-md hover:bg-[#a98c4f] transition"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);
    const res = await checkoutOrder();
    setLoading(false);

    if (!res.ok) {
      setError(
        res.message?.includes("left")
          ? `⚠️ ${res.message} Please review your cart.`
          : res.message || "Something went wrong during checkout."
      );

      setTimeout(() => {
        refreshCart();
      }, 1000);
      return;
    }

    setSuccess(true);
    await refreshCart();
  };

  if (success) {
    return (
      <div className="p-10 text-center text-green-700">
        ✅ Order placed successfully!
        <br />
        <button
          onClick={() => router.push("/orders")}
          className="mt-4 bg-[#025a6a] text-white px-4 py-2 rounded-md hover:bg-[#014956] transition"
        >
          View Orders
        </button>
      </div>
    );
  }

  // 🧮 Compute total with discounted prices
  const total = cart.items.reduce((sum: number, i: any) => {
    const { finalPrice } = applySaleToProduct(i.product, sales);
    return sum + finalPrice * i.quantity;
  }, 0);

  return (
    <div className="min-h-screen bg-[#F5F5F4] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-semibold mb-6 text-[#025a6a]">
          Review & Confirm
        </h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
        )}

        {/* 🧾 Cart items with discount display */}
        <div className="space-y-3">
          {cart.items.map((item: any) => {
            const { finalPrice } = applySaleToProduct(item.product, sales);
            const isDiscounted = finalPrice < item.product.price;

            return (
              <div
                key={item.id}
                className="flex justify-between border-b pb-2 text-gray-700"
              >
                <div>
                  <p>
                    {item.product.name} × {item.quantity}
                  </p>

                  {/* 🟢 Slashed price display */}
                  {isDiscounted ? (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-[#025a6a] font-semibold">
                        ₹{finalPrice.toFixed(2)}
                      </span>
                      <span className="text-gray-400 line-through">
                        ₹{item.product.price.toFixed(2)}
                      </span>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      ₹{item.product.price.toFixed(2)}
                    </p>
                  )}
                </div>

                <p className="font-medium text-gray-800">
                  ₹{(finalPrice * item.quantity).toFixed(2)}
                </p>
              </div>
            );
          })}
        </div>

        {/* 💰 Total */}
        <div className="mt-6 flex justify-between font-semibold text-lg text-gray-900">
          <p>Total:</p>
          <p>₹{total.toLocaleString("en-IN")}</p>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleCheckout}
            disabled={loading}
            className={`${
              loading ? "bg-gray-400" : "bg-[#ba9d5d] hover:bg-[#a98c4f]"
            } text-white px-6 py-2 rounded-md font-semibold transition`}
          >
            {loading ? "Processing..." : "Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
}
