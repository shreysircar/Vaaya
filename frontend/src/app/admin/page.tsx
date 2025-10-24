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

export default function AdminDashboard() {
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

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

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">
        Admin Dashboard
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
          <h2 className="text-gray-500 font-medium">Total Products</h2>
          <p className="text-3xl font-semibold text-gray-900 mt-2">
            {totalProducts}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
          <h2 className="text-gray-500 font-medium">Total Orders</h2>
          <p className="text-3xl font-semibold text-gray-900 mt-2">
            {totalOrders}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
          <h2 className="text-gray-500 font-medium">Total Revenue</h2>
          <p className="text-3xl font-semibold text-green-600 mt-2">
            ${totalRevenue.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Recent Orders
        </h2>
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
                <td className="py-2">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {recentOrders.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="text-center py-6 text-gray-400 italic"
                >
                  No recent orders
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
