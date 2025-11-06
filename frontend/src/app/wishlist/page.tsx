"use client";

import { useWishlist } from "@/context/WishlistContext";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function WishlistPage() {
  const { wishlist, loading, toggleWishlist, clearWishlist } = useWishlist();
  const router = useRouter();

  if (loading) return <div className="p-10 text-gray-600">Loading your wishlist...</div>;
  if (!wishlist || !wishlist.items || wishlist.items.length === 0)
    return <div className="p-10 text-center text-gray-500">Your wishlist is empty 💛</div>;

  return (
    <div className="min-h-screen bg-[#F5F5F4] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-semibold mb-8 text-[#025a6a]">Your Wishlist</h1>

        {/* 💛 Wishlist Items */}
        <div className="space-y-5">
          {wishlist.items.map((item: any) => (
            <div
              key={item.id}
              className="flex justify-between items-center border border-gray-200 rounded-lg p-4 bg-white hover:shadow-sm transition cursor-pointer"
            >
              {/* 🖼️ Product Image + Name (clickable) */}
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
                  <p className="text-sm text-gray-500">₹{item.product.price.toFixed(2)}</p>
                </div>
              </div>

              {/* ❤️ Remove Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWishlist(item.product.id);
                }}
                className="text-red-600 hover:text-red-700 text-sm font-medium transition"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* 💼 Footer */}
        <div className="mt-10 border-t pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="font-semibold text-lg text-gray-800">
            Total Items: {wishlist.items.length}
          </p>

          <button
            onClick={clearWishlist}
            className="bg-[#ba9d5d] text-white px-6 py-2 rounded-md hover:bg-[#a98c4f] transition font-semibold shadow-md"
          >
            Clear Wishlist
          </button>
        </div>
      </div>
    </div>
  );
}
