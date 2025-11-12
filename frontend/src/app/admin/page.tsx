"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/utils/api";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

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

interface AnalyticsData {
  totalOrders: number;
  totalRevenue: number;
  deliveredOrders: number;
  cancelledOrders: number;
  statusData: { status: string; count: number }[];
  trend30Days: { date: string; revenue: number; orders: number }[];
  revenueByMonth: { month: string; revenue: number; orders: number }[];
  topProducts: { name: string; quantity: number }[];
  categorySales: { category: string; revenue: number; total_items: number }[];
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) return;

    // Fetch analytics summary
    fetch(`${API_URL}/api/orders/analytics/summary`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setAnalytics(data))
      .catch(console.error);

    // Fetch recent orders (latest 5)
    fetch(`${API_URL}/api/orders`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data: Order[]) => setRecentOrders(data.slice(0, 5)))
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
      {/* Header */}
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
      {analytics ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <Card title="Total Orders" value={analytics.totalOrders} />
          <Card title="Delivered Orders" value={analytics.deliveredOrders} />
          <Card title="Cancelled Orders" value={analytics.cancelledOrders} />
          <Card
            title="Total Revenue"
            value={`$${analytics.totalRevenue.toFixed(2)}`}
            color="text-green-600"
          />
        </div>
      ) : (
        <p className="text-gray-400 mb-6">Loading analytics...</p>
      )}

      {/* Charts Section */}
      {analytics && (
        <>
          {/* Orders & Revenue (Last 30 Days) */}
          <div className="bg-white p-6 rounded-xl shadow-md mb-10">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Orders & Revenue (Last 30 Days)
            </h2>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart
                data={analytics.trend30Days.map((d) => ({
                  ...d,
                  label: new Date(d.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  }),
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={2} />
                <YAxis yAxisId="left" orientation="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip
                  formatter={(value, name) =>
                    name === "Revenue" ? `$${value}` : value
                  }
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="orders"
                  stroke="#4a9eb3"
                  strokeWidth={2}
                  name="Orders"
                  dot={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#025a6a"
                  strokeWidth={2}
                  name="Revenue"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Orders & Revenue (This Year) — Line Chart */}
          <div className="bg-white p-6 rounded-xl shadow-md mb-10">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Monthly Orders & Revenue (This Year)
            </h2>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart
                data={analytics.revenueByMonth.map((m) => ({
                  ...m,
                  month: m.month.slice(0, 3),
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" orientation="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip
                  formatter={(value, name) =>
                    name === "Revenue" ? `$${value}` : value
                  }
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="orders"
                  stroke="#4a9eb3"
                  strokeWidth={2}
                  name="Orders"
                  dot
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#025a6a"
                  strokeWidth={2}
                  name="Revenue"
                  dot
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Orders by Status */}
          <div className="bg-white p-6 rounded-xl shadow-md mb-10">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Orders by Status
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#4a9eb3" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue by Parent Category */}
          <div className="bg-white p-6 rounded-xl shadow-md mb-10">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Revenue by Parent Category
            </h2>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={analytics.categorySales}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="category" type="category" />
                <Tooltip />
                <Bar dataKey="revenue" fill="#025a6a" radius={[0, 10, 10, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Products */}
          <div className="bg-white p-6 rounded-xl shadow-md mb-10">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Top 5 Selling Products
            </h2>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b text-gray-600">
                  <th className="py-2">Product</th>
                  <th className="py-2">Quantity Sold</th>
                </tr>
              </thead>
              <tbody>
                {analytics.topProducts.map((p) => (
                  <tr key={p.name} className="border-b hover:bg-gray-50">
                    <td className="py-2">{p.name}</td>
                    <td className="py-2">{p.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Recent Orders */}
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

      {/* Settings Modal */}
      {settingsOpen && adminInfo && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow w-96">
            <h2 className="text-xl font-bold mb-4">Admin Settings</h2>
            <div className="space-y-2 text-gray-700">
              <p>
                <strong>Name:</strong> {adminInfo.name}
              </p>
              <p>
                <strong>Email:</strong> {adminInfo.email}
              </p>
              <p>
                <strong>Role:</strong> {adminInfo.isAdmin ? "Admin" : "User"}
              </p>
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

function Card({
  title,
  value,
  color = "text-gray-900",
}: {
  title: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
      <h2 className="text-gray-500 font-medium">{title}</h2>
      <p className={`text-3xl font-semibold mt-2 ${color}`}>{value}</p>
    </div>
  );
}
