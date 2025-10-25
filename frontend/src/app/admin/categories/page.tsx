"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/utils/api";

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
}

interface Category {
  id: string; // string matches Prisma cuid()
  name: string;
  products: Product[];
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchCategories = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [token]);

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const res = await fetch(`${API_URL}/api/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newCategoryName }),
      });
      if (!res.ok) throw new Error("Failed to create category");
      setNewCategoryName("");
      fetchCategories();
    } catch {
      alert("Error creating category");
    }
  };

  const handleUpdateCategory = async () => {
    if (!selectedCategory || !editingCategoryName.trim()) return;
    try {
      const res = await fetch(`${API_URL}/api/categories/${selectedCategory.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: editingCategoryName }),
      });
      if (!res.ok) throw new Error("Failed to update category");
      setEditingCategoryName("");
      fetchCategories();
    } catch {
      alert("Error updating category");
    }
  };

  const handleDeleteCategory = async (catId: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      const res = await fetch(`${API_URL}/api/categories/${catId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to delete category");
      if (selectedCategory?.id === catId) setSelectedCategory(null);
      fetchCategories();
    } catch {
      alert("Error deleting category");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Categories</h1>

      {/* ADD CATEGORY SECTION - completely separate */}
      <div className="mb-6 flex gap-2 max-w-md">
        <input
          type="text"
          placeholder="New category"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          className="border rounded px-2 py-1 flex-1"
        />
        <button
          onClick={handleCreateCategory}
          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
        >
          Add Category
        </button>
      </div>

      <div className="flex gap-6">
        {/* Category list */}
        <div className="w-1/4 bg-white p-4 rounded-xl shadow-md flex flex-col h-[80vh]">
          <h2 className="text-xl font-semibold mb-4">All Categories</h2>

          {/* Scrollable category list */}
          <ul className="space-y-2 overflow-y-auto flex-1">
            {categories.map((cat) => (
              <li
                key={cat.id}
                className={`cursor-pointer p-2 rounded flex justify-between items-center ${
                  selectedCategory?.id === cat.id ? "bg-blue-100 font-semibold" : "hover:bg-gray-100"
                }`}
              >
                <span onClick={() => setSelectedCategory(cat)}>{cat.name}</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setEditingCategoryName(cat.name);
                      setSelectedCategory(cat);
                    }}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="text-red-600 hover:underline text-sm"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Category details */}
        <div className="flex-1 bg-white p-4 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">
            {selectedCategory ? `Products in "${selectedCategory.name}"` : "Select a category"}
          </h2>

          {editingCategoryName && selectedCategory && (
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={editingCategoryName}
                onChange={(e) => setEditingCategoryName(e.target.value)}
                className="border rounded px-2 py-1 flex-1"
              />
              <button
                onClick={handleUpdateCategory}
                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
              >
                Save
              </button>
            </div>
          )}

          {selectedCategory?.products.length ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b text-gray-600">
                  <th className="py-2">Product</th>
                  <th className="py-2">Price</th>
                </tr>
              </thead>
              <tbody>
                {selectedCategory.products.map((prod) => (
                  <tr key={prod.id} className="border-b hover:bg-gray-50 transition">
                    <td className="py-2">{prod.name}</td>
                    <td className="py-2">${prod.price.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500 italic">No products in this category</p>
          )}
        </div>
      </div>
    </div>
  );
}
