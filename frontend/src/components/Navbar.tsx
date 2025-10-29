"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// === ICONS ===
const SearchIcon = () => (
  <svg className="w-6 h-6 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);
const XIcon = () => (
  <svg className="w-6 h-6 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const UserIcon = () => (
  <svg className="w-6 h-6 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
const CartIcon = () => (
  <svg className="w-6 h-6 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => setIsMounted(true), []);

  // === Fetch categories ===
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`);
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setShowSearch(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // === Auth Dropdown ===
  const AuthButtons = () => {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!isMounted) return <div className="w-16 h-6 bg-gray-100 rounded animate-pulse"></div>;

    if (user) {
      return (
        <div className="relative" ref={dropdownRef}>
          <button onClick={() => setOpen(!open)} className="hover:text-gray-600 transition p-1 flex items-center">
            <UserIcon />
          </button>
          {open && (
            <div className="absolute right-0 mt-3 w-40 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-10">
              <a
                href="/profile"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setOpen(false)}
              >
                My Account
              </a>
              <button
                onClick={() => {
                  handleLogout();
                  setOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="hidden sm:flex space-x-4 text-base font-medium">
        <a href="/login" className="text-gray-700 hover:text-gray-900 transition">
          Sign In
        </a>
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      {/* === 🟦 TOPBAR === */}
      <div className="flex items-center justify-between h-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-20"></div>

        {/* Centered Logo */}
        <div className="absolute left-0 right-0 flex justify-center">
          <img
            src="/logo.png"
            alt="E-Store Logo"
            className="h-12 w-auto object-contain cursor-pointer hover:scale-105 transition-transform"
            onClick={() => router.push("/")}
          />
        </div>

        {/* Right: Icons */}
        <div className="flex items-center space-x-5 text-gray-800 ml-auto">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="hover:text-gray-600 transition p-1"
            aria-label={showSearch ? "Close search" : "Open search"}
          >
            {showSearch ? <XIcon /> : <SearchIcon />}
          </button>
          <a href="/cart" className="hover:text-gray-600 transition p-1 relative">
            <CartIcon />
          </a>
          <AuthButtons />
        </div>
      </div>

      {/* === Search Bar === */}
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

{/* === Category Bar === */}
<nav className="bg-white border-t border-gray-200 relative font-[Inter] shadow-inner shadow-gray-100">


  <ul className="flex items-center justify-center space-x-10 py-3 font-medium text-gray-800 text-[0.95rem] tracking-wide">
    {categories.map((cat: any) => (
      <li
        key={cat.id}
        className="group relative cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)]"
      >
        <span
          className="relative px-2 py-1 font-[Poppins] text-gray-700 
          transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)]
          group-hover:text-[#ba9d5d] group-hover:drop-shadow-sm group-hover:scale-[1.03]"
        >
          {cat.name}
          <span
            className="absolute left-0 bottom-0 w-0 h-[2px] bg-gradient-to-r from-[#8f7a43] via-[#ba9d5d] to-[#d8c27a]

            group-hover:w-full transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] rounded-full"
          ></span>
        </span>

        {/* 🔽 Full-width dropdown */}
        {cat.subcategories?.length > 0 && (
          <div
            className="fixed left-0 top-[7.6rem] w-full bg-white/95 backdrop-blur-md border-t border-gray-100 
            shadow-[0_8px_30px_rgba(0,0,0,0.08)] opacity-0 invisible group-hover:visible group-hover:opacity-100 
            translate-y-3 group-hover:translate-y-0 transition-all duration-700 ease-[cubic-bezier(0.25,0.8,0.25,1)] z-40"
          >
            <div className="max-w-7xl mx-auto px-10 py-10 grid grid-cols-5 gap-10">
              {cat.subcategories.map((sub: any) => (
                <div
                  key={sub.id}
                  className="transform transition-all duration-500 hover:scale-[1.04]"
                >
                  <h4 className="uppercase tracking-wider text-gray-900 font-semibold text-[0.75rem] mb-4 border-b border-gray-200 pb-2 font-[Inter]">
                    {sub.name}
                  </h4>
                  <ul className="space-y-2">
                    {sub.products?.map((p: any) => (
                      <li
                        key={p.id}
                      className="text-gray-600 text-sm hover:text-[#8f7a43] hover:bg-[#f7f3e8]/90 px-2 py-1 rounded-md
transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] cursor-pointer hover:translate-x-1"
>
                        {p.name}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </li>
    ))}
  </ul>
</nav>

    </header>
  );
}
