"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/utils/api";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  imageUrls?: string[]; // ✅ NEW
  parentCategoryId?: string;
  subCategoryId?: string;
  parentCategory?: { name: string };
  subCategory?: { name: string };
}

interface Subcategory {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  subcategories?: Subcategory[];
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    stock: 0,
    parentCategoryId: "",
    subCategoryId: "",
    imageUrl: "",
    imageUrls: [] as string[], // ✅ NEW
  });

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchProducts = () => {
    if (!token) return;
    fetch(`${API_URL}/api/products`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("🧩 Products API response:", data);
        if (Array.isArray(data)) setProducts(data);
        else {
          console.error("❌ Expected array but got:", data);
          setProducts([]);
        }
      })
      .catch(console.error);
  };

  const fetchCategories = () => {
    if (!token) return;
    fetch(`${API_URL}/api/categories`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data: Category[]) => setCategories(data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [token]);

  const handleDelete = async (id: string) => {
    if (!token) return;
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`${API_URL}/api/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete product");

      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("Error deleting product");
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      price: 0,
      stock: 0,
      parentCategoryId: "",
      subCategoryId: "",
      imageUrl: "",
      imageUrls: [], // ✅ reset
    });
    setSelectedCategoryId("");
    setModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);

    let parentId = product.parentCategoryId || "";
    if (!parentId) {
      for (const cat of categories) {
        if (cat.subcategories?.some((s) => s.id === product.subCategoryId)) {
          parentId = cat.id;
          break;
        }
      }
    }

    setSelectedCategoryId(parentId);

    setFormData({
      name: product.name || "",
      description: product.description || "",
      price: product.price || 0,
      stock: product.stock || 0,
      parentCategoryId: parentId,
      subCategoryId: product.subCategoryId || "",
      imageUrl: product.imageUrl || "",
      imageUrls: product.imageUrls || [], // ✅ populate existing URLs
    });
    setModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const method = editingProduct ? "PUT" : "POST";
      const url = editingProduct
        ? `${API_URL}/api/products/${editingProduct.id}`
        : `${API_URL}/api/products`;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: formData.price,
          stock: formData.stock,
          parentCategoryId: selectedCategoryId,
          subCategoryId: formData.subCategoryId,
          imageUrl: formData.imageUrl,
          imageUrls: formData.imageUrls, // ✅ send to backend
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ API Error:", res.status, errorText);
        throw new Error("Failed to save product");
      }

      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("Error saving product");
    }
  };

  const selectedCategory = categories.find(
    (c) => c.id === selectedCategoryId
  );

  /* ✅ Helpers for handling multiple image URLs */
  const addImageUrlField = () => {
    setFormData({
      ...formData,
      imageUrls: [...formData.imageUrls, ""],
    });
  };

  const removeImageUrlField = (index: number) => {
    const updated = [...formData.imageUrls];
    updated.splice(index, 1);
    setFormData({ ...formData, imageUrls: updated });
  };

  const updateImageUrlField = (index: number, value: string) => {
    const updated = [...formData.imageUrls];
    updated[index] = value;
    setFormData({ ...formData, imageUrls: updated });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Products</h1>

      <button
        className="mb-5 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        onClick={openAddModal}
      >
        + Add Product
      </button>

      <div className="overflow-x-auto shadow border border-gray-200 rounded-md bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-2 text-left border-b">Image</th>
              <th className="px-4 py-2 text-left border-b">Name</th>
              <th className="px-4 py-2 text-left border-b">Price</th>
              <th className="px-4 py-2 text-left border-b">Stock</th>
              <th className="px-4 py-2 text-left border-b">Category</th>
              <th className="px-4 py-2 text-left border-b">Subcategory</th>
              <th className="px-4 py-2 text-right border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, idx) => (
              <tr
                key={p.id}
                className={`${
                  idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                } hover:bg-gray-100`}
              >
                <td className="px-4 py-2">
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="h-10 w-10 object-cover rounded"
                    />
                  ) : (
                    <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                      N/A
                    </div>
                  )}
                </td>
                <td className="px-4 py-2 font-medium text-gray-800">
                  {p.name}
                </td>
                <td className="px-4 py-2 text-gray-800">
                  ${p.price.toFixed(2)}
                </td>
                <td className="px-4 py-2 text-gray-800">{p.stock}</td>
                <td className="px-4 py-2 text-gray-800">
                  {p.parentCategory?.name || "N/A"}
                </td>
                <td className="px-4 py-2 text-gray-800">
                  {p.subCategory?.name || "N/A"}
                </td>
                <td className="px-4 py-2 flex justify-end space-x-1">
                  <button
                    className="px-2 py-0.5 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-xs"
                    onClick={() => openEditModal(p)}
                  >
                    Edit
                  </button>
                  <button
                    className="px-2 py-0.5 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                    onClick={() => handleDelete(p.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-4 text-gray-400 italic"
                >
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-96 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">
              {editingProduct ? "Edit Product" : "Add Product"}
            </h2>

            <form onSubmit={handleFormSubmit} className="space-y-3 text-sm">
              {/* Existing fields remain unchanged */}
              <div>
                <label className="block mb-1 font-medium">Name</label>
                <input
                  type="text"
                  placeholder="Product name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full border px-2 py-1 rounded"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Description</label>
                <textarea
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full border px-2 py-1 rounded"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1 font-medium">Price ($)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: +e.target.value })
                    }
                    className="w-full border px-2 py-1 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Stock</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: +e.target.value })
                    }
                    className="w-full border px-2 py-1 rounded"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-medium">Category</label>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => {
                    setSelectedCategoryId(e.target.value);
                    setFormData({
                      ...formData,
                      parentCategoryId: e.target.value,
                      subCategoryId: "",
                    });
                  }}
                  className="w-full border px-2 py-1 rounded"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 font-medium">Subcategory</label>
                <select
                  value={formData.subCategoryId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      subCategoryId: e.target.value,
                    })
                  }
                  className="w-full border px-2 py-1 rounded"
                  required
                  disabled={!selectedCategory}
                >
                  <option value="">Select Subcategory</option>
                  {selectedCategory?.subcategories?.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Existing single image input */}
              <div>
                <label className="block mb-1 font-medium">Main Image URL</label>
                <input
                  type="text"
                  placeholder="Main Image URL"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  className="w-full border px-2 py-1 rounded"
                />
              </div>

              {/* ✅ NEW: Multiple Image URLs */}
              <div>
                <label className="block mb-1 font-medium">
                  Additional Image URLs
                </label>
                {formData.imageUrls.map((url, idx) => (
                  <div key={idx} className="flex items-center mb-2 space-x-2">
                    <input
                      type="text"
                      placeholder={`Image URL ${idx + 1}`}
                      value={url}
                      onChange={(e) =>
                        updateImageUrlField(idx, e.target.value)
                      }
                      className="w-full border px-2 py-1 rounded"
                    />
                    <button
                      type="button"
                      onClick={() => removeImageUrlField(idx)}
                      className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addImageUrlField}
                  className="mt-1 text-blue-600 text-xs hover:underline"
                >
                  + Add another image
                </button>
              </div>

              <div className="flex justify-end space-x-2 mt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1 rounded border hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  {editingProduct ? "Save" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
