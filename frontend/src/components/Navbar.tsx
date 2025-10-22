"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

// Minimalist Placeholder Icons (Replace these with actual SVG icons from a library like Lucide or Heroicons)
const SearchIcon = () => (
    <svg className="w-6 h-6 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
    </svg>
);
const XIcon = () => (
    <svg className="w-6 h-6 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>
    </svg>
);
const UserIcon = () => (
    <svg className="w-6 h-6 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
    </svg>
);
const CartIcon = () => (
    <svg className="w-6 h-6 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
    </svg>
);


export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  // State for toggling the search bar
  const [showSearch, setShowSearch] = useState(false);
  // State for Hydration Tracking
  const [isMounted, setIsMounted] = useState(false);

  // Set state after component mounts on the client to fix hydration error
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setShowSearch(false); // Hide the bar after search
    }
  };

  // Component for rendering Auth buttons/icons safely after mounting
  const AuthButtons = () => {
    // Show a small skeleton until hydration is complete
    if (!isMounted) {
      return <div className="w-16 h-6 bg-gray-100 rounded animate-pulse"></div>;
    }

    if (user) {
      // Logged In: Profile/Account Menu (Icon)
      return (
        <div className="group relative">
            <button className="hover:text-gray-600 transition p-1 flex items-center">
                <UserIcon />
            </button>
            <div className="absolute right-0 mt-3 w-40 bg-white border border-gray-200 rounded-md shadow-lg py-1 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition duration-200 ease-out z-10">
                <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    My Account
                </a>
                <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                    Logout
                </button>
            </div>
        </div>
      );
    }

    // Logged Out: Login/Register Links (Text)
    return (
      <div className="hidden sm:flex space-x-4 text-base font-medium">
        <a href="/login" className="text-gray-700 hover:text-gray-900 transition">
          Sign In
        </a>
      </div>
    );
  };

  return (
    // Navbar Container: White, ample padding, subtle border
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      
      {/* Main Bar: Max width container for clean layout */}
      <div className="flex items-center justify-between h-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 1. Brand/Logo (Left) */}
        <div 
          className="text-3xl font-extrabold text-gray-900 tracking-wider cursor-pointer hover:text-gray-700 transition"
          onClick={() => router.push("/")}
        >
          E-STORE
        </div>

        {/* 2. Main Navigation Links (Center) - Hidden on mobile for space */}
        <div className="hidden md:flex space-x-10 text-base font-medium text-gray-700">
          <a href="/" className="group relative transition tracking-wide pb-1 hover:text-gray-900">
            Home
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gray-900 scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
          </a>
          <a href="/shop/new" className="group relative transition tracking-wide pb-1 hover:text-gray-900">
            New Arrivals
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gray-900 scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
          </a>
          <a href="/shop/sales" className="group relative transition tracking-wide pb-1 hover:text-gray-900">
            Sale
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gray-900 scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
          </a>
        </div>

        {/* 3. Action Icons & Auth (Right) */}
        <div className="flex items-center space-x-5 text-gray-800">
          
          {/* Search Icon/Toggle Button */}
          <button 
            onClick={() => setShowSearch(!showSearch)}
            className="hover:text-gray-600 transition p-1"
            aria-label={showSearch ? "Close search" : "Open search"}
          >
            {showSearch ? <XIcon /> : <SearchIcon />}
          </button>

          {/* Cart Icon */}
          <a href="/cart" className="hover:text-gray-600 transition p-1 relative">
            <CartIcon />
          </a>

          {/* Auth Section (Hydration Safe) */}
          <AuthButtons />
          
          {/* Mobile Menu Icon */}
          <button className="md:hidden text-gray-900 hover:text-gray-700 transition p-1">
            <span className="text-2xl">☰</span>
          </button>
        </div>
      </div>

      {/* Toggled Search Bar */}
      {showSearch && (
        <div className="border-t border-gray-100 py-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto transition-all duration-300 ease-in-out">
            <form onSubmit={handleSearchSubmit} className="flex w-full">
                <input
                    type="text"
                    placeholder="Search for products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:border-gray-500 focus:ring-0 focus:outline-none transition"
                    autoFocus
                />
                <button
                    type="submit"
                    className="bg-gray-900 text-white px-6 py-2 rounded-r-md hover:bg-gray-700 transition"
                >
                    Search
                </button>
            </form>
        </div>
      )}
    </nav>
  );
}