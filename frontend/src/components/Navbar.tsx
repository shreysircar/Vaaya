export default function Navbar() {
  return (
    <nav className="flex items-center justify-between bg-white shadow px-6 py-3 sticky top-0 z-50">
      <h1 className="text-2xl font-bold text-blue-600">E-Shop</h1>
<div className="space-x-6 text-gray-700">
  <a href="/" className="hover:text-blue-500">Home</a>
  <a href="/login" className="hover:text-blue-500">Login</a>
  <a href="/register" className="hover:text-blue-500">Sign Up</a>
  <a href="/cart" className="hover:text-blue-500">Cart</a>
</div>
    </nav>
  );
}
