"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface User {
  isAdmin: boolean;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      setUser(null);
      router.push("/admin/login");
      setCheckingAuth(false);
      return;
    }

    const parsedUser: User = JSON.parse(userData);
    if (!parsedUser.isAdmin) {
      setUser(null);
      router.push("/");
      setCheckingAuth(false);
      return;
    }

    setUser(parsedUser);
    setCheckingAuth(false);
  }, [router]);

  const navItems = [
    { name: "Dashboard", href: "/admin" },
    { name: "Products", href: "/admin/products" },
    { name: "Orders", href: "/admin/orders" },
    { name: "Users", href: "/admin/users" },
    { name: "Categories", href: "/admin/categories" },
    { name: "Homepage Sections", href: "/admin/homepage-sections" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/admin/login");
  };

  // Render layout while checking auth
  if (checkingAuth) return null;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Only show sidebar if user is logged in and not on login page */}
      {user && pathname !== "/admin/login" && (
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
                  pathname === item.href ? "bg-blue-100 text-blue-800 font-semibold" : ""
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
      )}

      <main className="flex-1 overflow-y-auto p-8 text-gray-900">{children}</main>
    </div>
  );
}
