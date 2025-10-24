"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // Protect admin routes
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (!token || !user) {
      router.push("/admin/login");
      return;
    }

    const parsedUser = JSON.parse(user);
    if (!parsedUser.isAdmin) {
      router.push("/"); // redirect non-admin users to homepage
    }
  }, [router]);

  const navItems = [
    { name: "Dashboard", href: "/admin" },
    { name: "Products", href: "/admin/products" },
    { name: "Orders", href: "/admin/orders" },
    { name: "Users", href: "/admin/users" },
    { name: "Settings", href: "/admin/settings" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/admin/login");
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex flex-col border-r border-gray-200">
        <div className="p-6 font-bold text-2xl text-gray-900 border-b border-gray-200">
          Admin Panel
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block p-2 rounded-lg font-medium text-gray-800 hover:text-blue-700 hover:bg-blue-50 transition-all ${
                pathname === item.href
                  ? "bg-blue-100 text-blue-800 font-semibold"
                  : ""
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="m-4 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
        >
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 text-gray-900">{children}</main>
    </div>
  );
}
