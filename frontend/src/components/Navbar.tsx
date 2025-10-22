"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login"); // redirect to login after logout
  };

  return (
    <nav className="flex items-center justify-between bg-white shadow px-6 py-3 sticky top-0 z-50">
      <h1 className="text-2xl font-bold text-blue-600 cursor-pointer" onClick={() => router.push("/")}>
        E-Shop
      </h1>

      <div className="space-x-6 text-gray-700">
        <a href="/" className="hover:text-blue-500">Home</a>
        <a href="/cart" className="hover:text-blue-500">Cart</a>

        {!loading && !user && (
          <>
            <a href="/login" className="hover:text-blue-500">Login</a>
            <a href="/register" className="hover:text-blue-500">Sign Up</a>
          </>
        )}

        {!loading && user && (
          <>
            <a href="/profile" className="hover:text-blue-500">{user.name}</a>
            <button
              onClick={handleLogout}
              className="hover:text-red-600 transition font-medium"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
