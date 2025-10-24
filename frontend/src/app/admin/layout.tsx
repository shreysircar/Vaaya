"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const res = await fetch("/api/admin/me");
      if (!res.ok) router.push("/admin/login");
      else setLoading(false);
    };
    checkAuth();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="flex">
      {/* Sidebar goes here */}
      <aside className="w-64 bg-gray-900 text-white h-screen p-4">Sidebar</aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
