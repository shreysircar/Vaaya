import ProductCard from "@/components/ProductCard";

const sampleProducts = [
  { id: 1, name: "Wireless Headphones", price: 99, image: "https://via.placeholder.com/300" },
  { id: 2, name: "Smartwatch", price: 149, image: "https://via.placeholder.com/300" },
  { id: 3, name: "Gaming Mouse", price: 59, image: "https://via.placeholder.com/300" },
  { id: 4, name: "Bluetooth Speaker", price: 79, image: "https://via.placeholder.com/300" },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50 py-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Featured Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {sampleProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
}
