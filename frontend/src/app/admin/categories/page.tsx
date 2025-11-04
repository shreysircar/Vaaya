"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function CategoriesPage() {
  const [parents, setParents] = useState<any[]>([]);
  const [subs, setSubs] = useState<any[]>([]);
  const [selectedParent, setSelectedParent] = useState<string>("");
  const [newParentName, setNewParentName] = useState("");
  const [newParentDesc, setNewParentDesc] = useState("");
  const [newParentImageUrl, setNewParentImageUrl] = useState(""); // 🆕
  const [newSubName, setNewSubName] = useState("");
  const [newSubDesc, setNewSubDesc] = useState("");
  const [loading, setLoading] = useState(false);

  const [editingParent, setEditingParent] = useState<string | null>(null);
  const [editingSub, setEditingSub] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editImageUrl, setEditImageUrl] = useState(""); // 🆕 new edit field

  const API = "http://localhost:5000/api/categories";

  const fetchParents = async () => {
    try {
      const res = await axios.get(API);
      setParents(res.data);
    } catch (err) {
      console.error("Error fetching parents:", err);
    }
  };

  const fetchSubs = async (parentCategoryId?: string) => {
    try {
      const url = parentCategoryId
        ? `${API}/sub?parentCategoryId=${parentCategoryId}`
        : `${API}/sub`;
      const res = await axios.get(url);
      setSubs(res.data);
    } catch (err) {
      console.error("Error fetching subcategories:", err);
    }
  };

  useEffect(() => {
    fetchParents();
    fetchSubs();
  }, []);

  /* 🧩 Add Parent Category */
  const handleAddParent = async () => {
    if (!newParentName.trim()) return alert("Enter a parent category name");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        API,
        {
          name: newParentName,
          description: newParentDesc,
          imageUrl: newParentImageUrl || null, // 🆕 include imageUrl
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewParentName("");
      setNewParentDesc("");
      setNewParentImageUrl(""); // 🆕 reset imageUrl field
      fetchParents();
    } catch (err: any) {
      alert(err.response?.data?.message || "Error adding category");
    } finally {
      setLoading(false);
    }
  };

  /* 🧩 Add Subcategory */
  const handleAddSub = async () => {
    if (!selectedParent) return alert("Select a parent category first");
    if (!newSubName.trim()) return alert("Enter subcategory name");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        API,
        {
          name: newSubName,
          description: newSubDesc,
          parentCategoryId: selectedParent,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewSubName("");
      setNewSubDesc("");
      fetchSubs(selectedParent);
      fetchParents();
    } catch (err: any) {
      alert(err.response?.data?.message || "Error adding subcategory");
    } finally {
      setLoading(false);
    }
  };

  /* ✏️ Update category or subcategory */
  const handleUpdate = async (
    id: string,
    type: "parent" | "sub",
    parentCategoryId?: string
  ) => {
    if (!editName.trim()) return alert("Enter a valid name");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API}/${id}`,
        {
          name: editName,
          description: editDesc,
          ...(type === "parent" ? { imageUrl: editImageUrl || null } : {}), // 🆕
          ...(type === "sub" ? { parentCategoryId } : {}),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setEditingParent(null);
      setEditingSub(null);
      setEditName("");
      setEditDesc("");
      setEditImageUrl(""); // 🆕 reset

      fetchParents();
      if (selectedParent) fetchSubs(selectedParent);
    } catch (err: any) {
      alert(err.response?.data?.message || "Error updating category");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, type: "parent" | "sub") => {
    if (!confirm(`Delete this ${type} category?`)) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API}/${id}?type=${type}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchParents();
      if (type === "sub") fetchSubs(selectedParent);
    } catch (err: any) {
      alert(err.response?.data?.message || "Error deleting category");
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">Manage Categories</h1>

      {/* 🆕 Add Parent Category */}
      <div className="p-4 bg-white rounded-xl shadow border space-y-3">
        <h2 className="font-semibold text-gray-700">Add Parent Category</h2>
        <input
          type="text"
          placeholder="Parent category name"
          value={newParentName}
          onChange={(e) => setNewParentName(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={newParentDesc}
          onChange={(e) => setNewParentDesc(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <input
          type="text"
          placeholder="Image URL (optional)" // 🆕 image URL input
          value={newParentImageUrl}
          onChange={(e) => setNewParentImageUrl(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <button
          onClick={handleAddParent}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Adding..." : "Add Parent"}
        </button>
      </div>

      {/* Parent Selector + Subcategory Logic (unchanged) */}
      {/* ... existing code stays exactly as is ... */}

      {/* 🆕 Show image URL field when editing parent */}
      <div className="p-4 bg-white rounded-xl shadow border">
        <h2 className="font-semibold text-gray-700 mb-4">All Categories</h2>
        {parents.length === 0 ? (
          <p className="text-gray-500">No categories yet.</p>
        ) : (
          <div className="space-y-4">
            {parents.map((parent) => (
              <div key={parent.id} className="border-b pb-3">
                <div className="flex justify-between items-center">
                  {editingParent === parent.id ? (
                    <div className="flex flex-col w-full mr-3">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="border p-1 rounded mb-1"
                      />
                      <input
                        type="text"
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        className="border p-1 rounded mb-1"
                      />
                      <input
                        type="text"
                        value={editImageUrl}
                        onChange={(e) => setEditImageUrl(e.target.value)}
                        className="border p-1 rounded"
                        placeholder="Image URL (optional)"
                      />
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">
                        {parent.name}
                      </h3>
                      {parent.imageUrl && (
                        <img
                          src={parent.imageUrl}
                          alt={parent.name}
                          className="mt-2 w-20 h-20 object-cover rounded-lg border"
                        />
                      )}
                    </div>
                  )}

                  <div className="flex gap-3">
                    {editingParent === parent.id ? (
                      <>
                        <button
                          onClick={() => handleUpdate(parent.id, "parent")}
                          className="text-green-600 hover:text-green-800"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingParent(null)}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditingParent(parent.id);
                            setEditName(parent.name);
                            setEditDesc(parent.description || "");
                            setEditImageUrl(parent.imageUrl || ""); // 🆕 prefill
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(parent.id, "parent")}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Subcategories (unchanged) */}
                {parent.subcategories?.length > 0 && (
                  <ul className="pl-6 mt-2 space-y-1 list-disc">
                    {parent.subcategories.map((sub: any) => (
                      <li key={sub.id} className="flex justify-between items-center text-gray-700">
                        {editingSub === sub.id ? (
                          <div className="flex flex-col w-full mr-3">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="border p-1 rounded mb-1"
                            />
                            <input
                              type="text"
                              value={editDesc}
                              onChange={(e) => setEditDesc(e.target.value)}
                              className="border p-1 rounded"
                            />
                          </div>
                        ) : (
                          <span>{sub.name}</span>
                        )}

                        <div className="flex gap-2">
                          {editingSub === sub.id ? (
                            <>
                              <button
                                onClick={() =>
                                  handleUpdate(sub.id, "sub", parent.id)
                                }
                                className="text-green-600 hover:text-green-800"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingSub(null)}
                                className="text-gray-600 hover:text-gray-800"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setEditingSub(sub.id);
                                  setEditName(sub.name);
                                  setEditDesc(sub.description || "");
                                }}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() =>
                                  handleDelete(sub.id, "sub")
                                }
                                className="text-sm text-red-500 hover:text-red-700"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
