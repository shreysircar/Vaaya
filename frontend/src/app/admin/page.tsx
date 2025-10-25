"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/utils/api";

interface Product {
  id: string;
  name: string;
}

interface Order {
  id: string;
  total: number;
  status: string;
  createdAt: string;
}

interface AdminInfo {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

export default function AdminDashboard() {
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) return;

    // Fetch total products
    fetch(`${API_URL}/api/products`, {
      headers: { 
         "Content-Type": "application/json",
         Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data: Product[]) => setTotalProducts(data.length))
      .catch(console.error);

    // Fetch orders
    fetch(`${API_URL}/api/orders`, {
      headers: { 
         "Content-Type": "application/json",
         Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data: Order[]) => {
        setTotalOrders(data.length);
        const revenue = data.reduce((acc, order) => acc + order.total, 0);
        setTotalRevenue(revenue);
        setRecentOrders(data.slice(-5).reverse());
      })
      .catch(console.error);
  }, [token]);

  const fetchAdminInfo = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch admin info");
      const data = await res.json();
      setAdminInfo(data);
      setSettingsOpen(true);
    } catch (err) {
      console.error(err);
      alert("Error fetching admin info");
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <button
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
          onClick={fetchAdminInfo}
        >
          Info
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
          <h2 className="text-gray-500 font-medium">Total Products</h2>
          <p className="text-3xl font-semibold text-gray-900 mt-2">{totalProducts}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
          <h2 className="text-gray-500 font-medium">Total Orders</h2>
          <p className="text-3xl font-semibold text-gray-900 mt-2">{totalOrders}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
          <h2 className="text-gray-500 font-medium">Total Revenue</h2>
          <p className="text-3xl font-semibold text-green-600 mt-2">${totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Recent Orders</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b text-gray-600">
              <th className="py-2">Order ID</th>
              <th className="py-2">Total</th>
              <th className="py-2">Status</th>
              <th className="py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order) => (
              <tr key={order.id} className="border-b hover:bg-gray-50">
                <td className="py-2">{order.id}</td>
                <td className="py-2">${order.total.toFixed(2)}</td>
                <td className="py-2 capitalize">{order.status}</td>
                <td className="py-2">{new Date(order.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {recentOrders.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-6 text-gray-400 italic">
                  No recent orders
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Settings Modal */}
      {settingsOpen && adminInfo && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow w-96">
            <h2 className="text-xl font-bold mb-4">Admin Settings</h2>
            <div className="space-y-2 text-gray-700">
              <p><strong>Name:</strong> {adminInfo.name}</p>
              <p><strong>Email:</strong> {adminInfo.email}</p>
              <p><strong>Role:</strong> {adminInfo.isAdmin ? "Admin" : "User"}</p>
            </div>
            <div className="flex justify-end mt-4">
              <button
                className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 transition"
                onClick={() => setSettingsOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
