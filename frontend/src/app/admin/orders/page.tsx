"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/utils/api";
import OrderModal from "@/components/OrderModal";

interface Order {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  user?: { name: string; email: string };
}

const allowedStatuses = ["pending", "shipped", "delivered", "cancelled"];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    const fetchOrders = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/api/orders`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch orders");
        const data = await res.json();
        setOrders(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  const openOrderDetails = async (orderId: string) => {
    if (!token) return;
    setModalLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/orders/${orderId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch order details");
      const data = await res.json();
      setSelectedOrder(data);
    } catch {
      alert("Error loading order details");
    } finally {
      setModalLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update order status");
      const updatedOrder = await res.json();

      setOrders((prev) => prev.map((o) => (o.id === orderId ? updatedOrder : o)));
      if (selectedOrder?.id === orderId) setSelectedOrder(updatedOrder);
    } catch {
      alert("Error updating order status");
    }
  };

  if (loading) return <p className="text-gray-600">Loading orders...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Orders</h1>

      <div className="bg-white rounded-xl shadow-md p-6">
        {orders.length === 0 ? (
          <p className="text-gray-500 italic">No orders found</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b text-gray-600">
                <th className="py-2">Order ID</th>
                <th className="py-2">Customer</th>
                <th className="py-2">Email</th>
                <th className="py-2">Total</th>
                <th className="py-2">Status</th>
                <th className="py-2">Date</th>
                <th className="py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-50 transition">
                  <td className="py-2">{order.id}</td>
                  <td className="py-2">{order.user?.name || "N/A"}</td>
                  <td className="py-2 text-gray-600">{order.user?.email || "N/A"}</td>
                  <td className="py-2 font-medium">${order.total?.toFixed(2) || "0.00"}</td>
                  <td className="py-2">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="border rounded px-2 py-1 text-sm"
                    >
                      {allowedStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="py-2 text-center">
                    <button
                      onClick={() => openOrderDetails(order.id)}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedOrder && (
        <OrderModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={handleStatusChange}
          loading={modalLoading}
        />
      )}
    </div>
  );
}
