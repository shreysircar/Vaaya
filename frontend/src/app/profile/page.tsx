"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import OrderTracker from "@/components/OrderTracker";


const DEEP_CHARCOAL = "#292524";
const SLATE_TEAL = "#025a6a";
const WARM_SANDSTONE = "#F5F5F4";

const ProfileDetails = ({ user }: { user: any }) => (
  <div className="flex flex-col gap-6">
    {/* Welcome Banner */}
    <div
      className="rounded-xl p-6 shadow-sm border border-gray-200 bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between"
      style={{ backgroundColor: "#ffffff" }}
    >
      <div>
        <h1 className="text-2xl font-bold mb-1" style={{ color: DEEP_CHARCOAL }}>
          Welcome back, <span className="text-[#025a6a]">{user.name}</span> 👋
        </h1>
        <p className="text-gray-500 text-sm">
          Here’s a quick overview of your account and recent activity.
        </p>
      </div>
    </div>

    {/* Personal Info Card */}
    <div className="p-6 rounded-lg border border-gray-200 shadow-sm max-w-3xl bg-white">
      <h2 className="text-2xl font-semibold border-b pb-2 mb-4" style={{ color: DEEP_CHARCOAL }}>
        Account Information
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
        <div>
          <p className="font-medium text-sm text-gray-500">Full Name</p>
          <p className="font-semibold text-base">{user.name}</p>
        </div>
        <div>
          <p className="font-medium text-sm text-gray-500">Email Address</p>
          <p className="font-semibold text-base">{user.email}</p>
        </div>
      </div>
    </div>

    {/* Recent Orders Card */}
    <div className="p-6 rounded-lg border border-gray-200 shadow-sm max-w-3xl bg-white">
      <h3 className="text-xl font-semibold mb-4" style={{ color: DEEP_CHARCOAL }}>
        Recent Orders
      </h3>
      <p className="text-gray-500">
        You have 3 recent orders. View your full order history in the Orders tab.
      </p>
    </div>
  </div>
);

/* ------------------------- UPDATED ORDERS TAB ------------------------- */
const OrdersView = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Parse JSON safely
        const data = await res.json();

        // ✅ Guarantee array format
        if (Array.isArray(data)) {
          setOrders(data);
        } else {
          console.warn("Unexpected response format:", data);
          setOrders([]);
        }
      } catch (err) {
        console.error("Error fetching user orders:", err);
        setOrders([]); // fallback
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <h2 className="text-3xl font-bold border-b pb-2 mb-4" style={{ color: DEEP_CHARCOAL }}>
        Order History
      </h2>

      {loading ? (
        <p className="text-gray-500">Loading your orders...</p>
      ) : orders.length === 0 ? (
        <div className="p-6 rounded-lg border border-gray-200 shadow-sm bg-white">
          <p className="text-gray-500">You haven’t placed any orders yet.</p>
        </div>
      ) : (
        orders.map((order) => (
          <div
            key={order.id}
            className="p-6 rounded-lg border border-gray-200 shadow-sm bg-white hover:shadow transition"
          >
            <div className="flex justify-between items-center mb-3">
              <p className="font-semibold text-gray-800">
                Order ID: <span className="text-gray-600">{order.id}</span>
              </p>
              <span
                className={`text-sm px-3 py-1 rounded-full ${
                  order.status === "delivered"
                    ? "bg-green-100 text-green-700"
                    : order.status === "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : order.status === "shipped"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
              </span>
            </div>

            <p className="text-gray-700 text-sm mb-1">
              Placed on:{" "}
              <span className="font-medium">
                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </p>

            <p className="text-gray-700 text-sm mb-3">
              Total:{" "}
              <span className="font-semibold text-[#025a6a]">
                ₹{order.total?.toLocaleString("en-IN") || "0.00"}
              </span>
            </p>

            <div className="flex gap-3 flex-wrap">
              {order.items?.map((item: any) => (
                <div key={item.id} className="flex items-center gap-2">
                  <img
                    src={item.product?.imageUrl || "/placeholder.png"}
                    alt={item.product?.name}
                    className="w-12 h-12 object-cover rounded-md border"
                  />
                  <span className="text-gray-700 text-sm">{item.product?.name}</span>
                </div>
              ))}
            </div>
            <OrderTracker status={order.status} />
          </div>
        ))
      )}
    </div>
  );
};

/* ---------------------------------------------------------------------- */

export default function ProfilePage() {
  const { user, logout, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  if (loading)
    return (
      <p className="text-center mt-20" style={{ color: DEEP_CHARCOAL }}>
        Loading user profile...
      </p>
    );

  if (!user)
    return (
      <p className="text-center mt-20 text-red-500">
        Please log in to view your profile.
      </p>
    );

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileDetails user={user} />;
      case "orders":
        return <OrdersView />;
      case "addresses":
        return (
          <p className="text-gray-600 p-4 max-w-3xl bg-white rounded-lg border border-gray-200 shadow-sm">
            Manage your saved addresses here.
          </p>
        );
      default:
        return <ProfileDetails user={user} />;
    }
  };

  return (
    <div
      className="min-h-screen py-12 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: WARM_SANDSTONE }}
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Sidebar */}
        <div className="space-y-4 h-fit">
          <nav className="space-y-2">
            {["Profile", "Orders", "Addresses"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase())}
                className="w-full text-left px-4 py-3 rounded-lg text-lg font-medium transition duration-150"
                style={
                  activeTab === tab.toLowerCase()
                    ? {
                        backgroundColor: SLATE_TEAL,
                        color: "#fff",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      }
                    : { color: DEEP_CHARCOAL }
                }
              >
                {tab}
              </button>
            ))}
          </nav>

          <div className="pt-6">
            {/* 🖤 Logout button (black) */}
            <button
              onClick={logout}
              className="w-full text-center bg-black text-white px-4 py-3 rounded-lg hover:bg-gray-800 transition font-medium shadow-sm"
            >
              Log Out
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 flex flex-col gap-6">{renderContent()}</div>
      </div>
    </div>
  );
}
