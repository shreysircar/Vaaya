/*"use client";

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
*/
"use client";

import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

// Defined color palette
const DEEP_CHARCOAL = "#292524";
const SLATE_TEAL = "#025a6a";
const WARM_SANDSTONE = "#F5F5F4";

const ProfileDetails = ({ user }: { user: any }) => (
  <div className="space-y-6">
    <h2
      className="text-3xl font-bold border-b pb-2 mb-4"
      style={{ color: DEEP_CHARCOAL }}
    >
      Account Overview
    </h2>

    {/* Account Info Card */}
    <div
      className="bg-white p-6 rounded-lg shadow-md border border-gray-100"
    >
      <h3
        className="text-xl font-semibold mb-4"
        style={{ color: DEEP_CHARCOAL }}
      >
        Personal Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
        <div>
          <p className="font-medium text-sm text-gray-500">Full Name</p>
          <p className="font-semibold text-base">{user.name}</p>
        </div>
        <div>
          <p className="font-medium text-sm text-gray-500">Email Address</p>
          <p className="font-semibold text-base">{user.email}</p>
        </div>
        <div>
          <p className="font-medium text-sm text-gray-500">User Role</p>
          <p className="font-semibold text-base capitalize">{user.role}</p>
        </div>
      </div>

      <button
        className="mt-6 text-sm font-semibold text-white px-4 py-2 rounded-md hover:bg-[#014755] transition"
        style={{ backgroundColor: SLATE_TEAL }}
      >
        Edit Details
      </button>
    </div>

    {/* Recent Orders Overview */}
    <div
      className="bg-white p-6 rounded-lg shadow-md border border-gray-100"
    >
      <h3
        className="text-xl font-semibold mb-4"
        style={{ color: DEEP_CHARCOAL }}
      >
        Recent Orders
      </h3>
      <p className="text-gray-500">
        You have 3 recent orders. View full history in the Orders tab.
      </p>
    </div>
  </div>
);

const OrdersView = () => (
  <div className="space-y-6">
    <h2
      className="text-3xl font-bold border-b pb-2 mb-4"
      style={{ color: DEEP_CHARCOAL }}
    >
      Order History
    </h2>
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
      <p className="text-gray-700">
        Your last order: #2024-5432 placed on October 20, 2024.
      </p>
    </div>
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
      <p className="text-gray-700">No pending shipments at this time.</p>
    </div>
  </div>
);

export default function ProfilePage() {
  const { user, logout, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  if (loading)
    return (
      <p
        className="text-center mt-20"
        style={{ color: DEEP_CHARCOAL }}
      >
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
        return <p className="text-gray-600 p-4">Manage your saved addresses here.</p>;
      default:
        return <ProfileDetails user={user} />;
    }
  };

  return (
    <div
      className="min-h-screen py-12 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: WARM_SANDSTONE }}
    >
      <div className="max-w-7xl mx-auto">
        <h1
          className="text-4xl font-extrabold mb-10"
          style={{ color: DEEP_CHARCOAL }}
        >
          My Dashboard
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4 bg-white p-6 rounded-xl shadow-lg h-fit">
            <nav className="space-y-2">
              {["Profile", "Orders", "Addresses"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab.toLowerCase())}
                  className={`w-full text-left px-4 py-3 rounded-lg text-lg font-medium transition duration-150`}
                  style={
                    activeTab === tab.toLowerCase()
                      ? { backgroundColor: SLATE_TEAL, color: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }
                      : { color: DEEP_CHARCOAL }
                  }
                >
                  {tab}
                </button>
              ))}
            </nav>

            {/* Logout Button */}
            <div className="pt-6 border-t border-gray-100">
              <button
                onClick={logout}
                className="w-full text-center bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition font-medium shadow-md"
              >
                Log Out
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
}
