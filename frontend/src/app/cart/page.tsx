"use client";

import { useState } from "react";
import Image from "next/image";

export default function CartPage() {
  // temporary static data for demo (will replace with real cart items later)
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Wireless Bluetooth Headphones",
      price: 2999,
      quantity: 1,
      image: "/placeholder-product.png",
    },
    {
      id: 2,
      name: "Smart Fitness Watch",
      price: 4999,
      quantity: 2,
      image: "/placeholder-product.png",
    },
  ]);

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-8 tracking-wide">
        Your Shopping Cart 🛒
      </h1>

      {cartItems.length === 0 ? (
        <div className="text-gray-600 text-center py-20 border rounded-md">
          <p className="text-lg font-medium mb-2">Your cart is empty</p>
          <p className="text-sm text-gray-500">
            Looks like you haven’t added anything yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 🧾 Cart Items List */}
          <div className="md:col-span-2 space-y-6">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between border rounded-md p-4 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="font-medium text-gray-800 text-[1rem]">
                      {item.name}
                    </h2>
                    <p className="text-sm text-gray-500">
                      ₹{item.price.toLocaleString("en-IN")}
                    </p>
                    <div className="flex items-center mt-2">
                      <span className="text-sm mr-2 text-gray-600">Qty:</span>
                      <select
                        value={item.quantity}
                        onChange={(e) =>
                          setCartItems((prev) =>
                            prev.map((i) =>
                              i.id === item.id
                                ? { ...i, quantity: Number(e.target.value) }
                                : i
                            )
                          )
                        }
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                      >
                        {[1, 2, 3, 4, 5].map((q) => (
                          <option key={q} value={q}>
                            {q}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() =>
                    setCartItems((prev) =>
                      prev.filter((i) => i.id !== item.id)
                    )
                  }
                  className="text-sm text-red-600 hover:text-red-700 font-medium transition"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* 💰 Cart Summary */}
          <div className="border rounded-md p-6 shadow-sm h-fit">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="flex justify-between text-gray-700 mb-2">
              <span>Subtotal</span>
              <span>₹{total.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-gray-700 mb-2">
              <span>Shipping</span>
              <span className="text-green-600">Free</span>
            </div>
            <hr className="my-3" />
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>₹{total.toLocaleString("en-IN")}</span>
            </div>

            <button className="mt-6 w-full bg-[#ba9d5d] hover:bg-[#a4884e] text-white font-semibold py-2 rounded-md transition">
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
