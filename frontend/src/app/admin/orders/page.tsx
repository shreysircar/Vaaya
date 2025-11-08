"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/utils/api";
import { applySaleToProduct, type Sale } from "@/utils/saleUtils";

interface Order {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  user?: { name: string; email: string };
  items?: {
    id: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      price: number;
      imageUrl?: string;
      subCategoryId?: string;
      parentCategoryId?: string;
    };
  }[];
}

const allowedStatuses = ["pending", "shipped", "delivered", "cancelled"];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewLoading, setViewLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // 🟢 Fetch all orders
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

  // 🟢 Fetch all active sales (for checking discounts)
  useEffect(() => {
    const fetchSales = async () => {
      try {
        const res = await fetch(`${API_URL}/api/sales/active`);
        if (!res.ok) throw new Error("Failed to fetch sales");
        const data = await res.json();
        setSales(data);
      } catch (err) {
        console.error("Error fetching sales:", err);
      }
    };
    fetchSales();
  }, []);

  // 🟢 Open order details
  const openOrderDetails = async (orderId: string) => {
    if (!token) return;
    setViewLoading(true);
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
      setViewLoading(false);
    }
  };

  // 🟢 Handle status change
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

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? updatedOrder : o))
      );
      if (selectedOrder?.id === orderId) setSelectedOrder(updatedOrder);
    } catch {
      alert("Error updating order status");
    }
  };

  // 🟡 Loading or error
  if (loading) return <p className="text-gray-600">Loading orders...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;

  // 🟢 Order details view
  if (selectedOrder) {
    return (
      <div className="p-6 bg-white rounded-xl shadow-md">
        <button
          onClick={() => setSelectedOrder(null)}
          className="mb-4 text-sm text-[#025a6a] hover:underline"
        >
          ← Back to all orders
        </button>

        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Order #{selectedOrder.id}
        </h2>

        <div className="text-gray-700 mb-4">
          <p>
            <strong>Customer:</strong> {selectedOrder.user?.name || "N/A"}
          </p>
          <p>
            <strong>Email:</strong> {selectedOrder.user?.email || "N/A"}
          </p>
          <p>
            <strong>Status:</strong> {selectedOrder.status}
          </p>
          <p>
            <strong>Date:</strong>{" "}
            {new Date(selectedOrder.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* 🧾 Order Items */}
        {viewLoading ? (
          <p className="text-gray-500">Loading details...</p>
        ) : !selectedOrder.items || selectedOrder.items.length === 0 ? (
          <p className="text-gray-500 italic">No items found for this order.</p>
        ) : (
          <div className="space-y-3 border-t pt-4">
            {selectedOrder.items.map((item) => {
              const basePrice = item.product.price;
              const orderDate = new Date(selectedOrder.createdAt);

              // 🧠 Filter only sales that were active when the order was placed
              const validSales = sales.filter((s) => {
                const saleStart = new Date(s.startDate);
                const saleEnd = new Date(s.endDate);
                return saleStart <= orderDate && saleEnd >= orderDate;
              });

              const { finalPrice } = applySaleToProduct(
                item.product,
                validSales
              );
              const isDiscounted = finalPrice < basePrice;

              return (
                <div
                  key={item.id}
                  className="flex justify-between border-b pb-2 text-gray-700"
                >
                  <div>
                    <p className="font-medium">{item.product.name}</p>
                    {isDiscounted ? (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-[#025a6a] font-semibold">
                          ₹{finalPrice.toFixed(2)}
                        </span>
                        <span className="text-gray-400 line-through">
                          ₹{basePrice.toFixed(2)}
                        </span>
                        <span className="text-xs text-green-600">
                          (Sale active during order)
                        </span>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        ₹{basePrice.toFixed(2)}
                      </p>
                    )}
                  </div>

                  <p className="font-semibold text-gray-800">
                    ₹{(finalPrice * item.quantity).toFixed(2)}{" "}
                    <span className="text-sm text-gray-500">
                      × {item.quantity}
                    </span>
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* 🧮 Total */}
        <div className="mt-6 flex justify-between font-semibold text-lg">
          <p>Total:</p>
          <p>
            ₹
            {selectedOrder.items
              ?.reduce((sum: number, i: any) => {
                const orderDate = new Date(selectedOrder.createdAt);
                const validSales = sales.filter((s) => {
                  const saleStart = new Date(s.startDate);
                  const saleEnd = new Date(s.endDate);
                  return saleStart <= orderDate && saleEnd >= orderDate;
                });
                const { finalPrice } = applySaleToProduct(i.product, validSales);
                return sum + finalPrice * i.quantity;
              }, 0)
              .toLocaleString("en-IN")}
          </p>
        </div>
      </div>
    );
  }

  // 🟢 Default list view
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
                <tr
                  key={order.id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="py-2">{order.id}</td>
                  <td className="py-2">{order.user?.name || "N/A"}</td>
                  <td className="py-2 text-gray-600">
                    {order.user?.email || "N/A"}
                  </td>
                  <td className="py-2 font-medium">
                    ₹{order.total?.toFixed(2) || "0.00"}
                  </td>
                  <td className="py-2">
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusChange(order.id, e.target.value)
                      }
                      className="border rounded px-2 py-1 text-sm"
                    >
                      {allowedStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
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
    </div>
  );
}
