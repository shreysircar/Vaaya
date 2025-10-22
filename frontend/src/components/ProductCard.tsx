/*

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
}

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 hover:shadow-2xl transition transform hover:-translate-y-1">
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-52 object-cover rounded-xl mb-4"
      />
      <h3 className="font-semibold text-gray-800 text-lg">{product.name}</h3>
      <p className="text-blue-600 font-bold mt-2 text-lg">${product.price}</p>
      <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition font-medium">
        Add to Cart
      </button>
    </div>
  );
}
*/

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
}

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group bg-[#F5F5F4] border border-gray-200 rounded-xl overflow-hidden transition duration-300 ease-in-out transform hover:shadow-xl hover:-translate-y-0.5">
      
      {/* Product Image */}
      <div className="w-full h-72 overflow-hidden bg-white"> 
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition duration-500 ease-in-out group-hover:scale-105"
        />
      </div>

      {/* Product Details */}
      <div className="p-5">
        
        <h3 className="font-semibold text-[#292524] text-lg mb-1 truncate">
          {product.name}
        </h3>
        
        <p className="text-[#737373] font-bold text-base tracking-wider">
          ${product.price.toFixed(2)}
        </p>

        {/* Consistent Teal Action Button */}
        <button 
          className="mt-4 w-full py-2 rounded-xl text-white font-medium text-sm transition 
            bg-[#025a6a] hover:bg-[#014c57] shadow-md"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
