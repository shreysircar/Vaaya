interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
}

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition">
      <img src={product.image} alt={product.name} className="w-full h-48 object-cover rounded-md mb-3" />
      <h3 className="font-semibold text-gray-800">{product.name}</h3>
      <p className="text-blue-600 font-bold mt-1">${product.price}</p>
      <button className="mt-3 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition">
        Add to Cart
      </button>
    </div>
  );
}
