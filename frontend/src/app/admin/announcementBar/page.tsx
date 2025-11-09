"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react"; // ✅ Lucide icons (already used in your project)

type Announcement = {
  id: number;
  message: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function AnnouncementBarPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // 🔹 Fetch announcements
  const fetchAnnouncements = async () => {
    try {
      const res = await fetch(`${API_URL}/api/announcement`);
      const data = await res.json();
      setAnnouncements(Array.isArray(data) ? data : [data]);
    } catch (err) {
      console.error("Error fetching announcements:", err);
      alert("Failed to fetch announcements");
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // 🔹 Create or Update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return alert("Please enter a message before publishing!");

    setLoading(true);
    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `${API_URL}/api/announcement/${editingId}`
        : `${API_URL}/api/announcement`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, isActive: true }),
      });

      if (res.ok) {
        alert(editingId ? "Announcement updated!" : "Announcement published!");
        setMessage("");
        setEditingId(null);
        fetchAnnouncements();
      } else {
        const errText = await res.text();
        console.error("Server Response:", errText);
        alert(`Failed to save announcement: ${res.status} - ${errText}`);
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Server error while saving announcement");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Edit existing
  const handleEdit = (id: number, text: string) => {
    setEditingId(id);
    setMessage(text);
  };

  // 🔹 Delete
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;

    try {
      const res = await fetch(`${API_URL}/api/announcement/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("Announcement deleted successfully!");
        fetchAnnouncements();
      } else {
        const errText = await res.text();
        console.error("Server Response:", errText);
        alert(`Failed to delete: ${res.status} - ${errText}`);
      }
    } catch (err) {
      console.error("Error deleting:", err);
      alert("Server error while deleting announcement");
    }
  };

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-semibold text-black">
   Announcement Bar Management
</h1>

   

      {/* Create / Edit Form */}
      <form
        onSubmit={handleSubmit}
        className="flex gap-4 items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200"
      >
        <input
          type="text"
          placeholder={
            editingId
              ? "Edit announcement message..."
              : "Enter announcement message..."
          }
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 flex-1 text-sm focus:ring-2 focus:ring-[#025a6a] outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-[#025a6a] text-white px-5 py-2 rounded-md hover:bg-[#4a9eb3] disabled:opacity-50 transition-all duration-200"
        >
          {loading ? "Saving..." : editingId ? "Update" : "Publish"}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setMessage("");
            }}
            className="bg-gray-300 text-gray-900 px-4 py-2 rounded-md hover:bg-gray-400 transition-all duration-200"
          >
            Cancel
          </button>
        )}
      </form>

      {/* Active Announcement */}
      {announcements.length > 0 && announcements[0]?.message && (
        <div className="border border-green-300 rounded-lg p-4 bg-green-50">
          <p className="text-lg font-medium text-[#025a6a] mb-1">
            Active Announcement:
          </p>
          <div className="flex justify-between items-center">
            <p className="text-gray-800">{announcements[0].message}</p>
            <div className="flex gap-3">
              <button
                onClick={() =>
                  handleEdit(announcements[0].id, announcements[0].message)
                }
                title="Edit"
                className="text-blue-700 hover:text-blue-900 transition-colors"
              >
                <Pencil size={18} />
              </button>
              <button
                onClick={() => handleDelete(announcements[0].id)}
                title="Delete"
                className="text-red-600 hover:text-red-800 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Previous Announcements */}
      {announcements.length > 1 && (
        <div>
          <h2 className="text-lg font-semibold text-[#025a6a] mb-2">
            Previous Announcements
          </h2>
          <div className="space-y-2">
            {announcements.slice(1).map((a) => (
              <div
                key={a.id}
                className="p-3 border border-gray-200 rounded-md text-sm text-gray-700 bg-gray-50 flex justify-between items-center"
              >
                <div>
                  <p>{a.message}</p>
                  <p className="text-xs text-gray-500">
                    Last updated: {new Date(a.updatedAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleEdit(a.id, a.message)}
                    title="Edit"
                    className="text-blue-700 hover:text-blue-900 transition-colors"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    title="Delete"
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
