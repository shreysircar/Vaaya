"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/utils/api";

export default function AdminSettingsPage() {
  const [admin, setAdmin] = useState<{ name: string; email: string } | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) return;

    fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setAdmin(data))
      .catch(console.error);
  }, [token]);

  if (!admin) return <p>Loading...</p>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-gray-900">Settings</h1>
      <p>
        <strong>Name:</strong> {admin.name}
      </p>
      <p>
        <strong>Email:</strong> {admin.email}
      </p>
    </div>
  );
}