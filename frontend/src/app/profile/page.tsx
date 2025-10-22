"use client";

import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
  const { user, logout, loading } = useAuth();

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!user) return <p className="text-center mt-10">Please log in first.</p>;

  return (
    <div className="flex flex-col items-center mt-20">
      <h1 className="text-3xl font-bold mb-2">Welcome, {user.name} 👋</h1>
      <p className="text-gray-600">Email: {user.email}</p>
      <p className="text-gray-600 mb-6">Role: {user.role}</p>

      <button
        onClick={logout}
        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
      >
        Log Out
      </button>
    </div>
  );
}
