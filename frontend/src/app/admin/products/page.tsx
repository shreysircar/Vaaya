"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/utils/api";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
  categoryName: string;
  imageUrl: string;
}

interface Category {
  id: string;
  name: string;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    stock: 0,
    categoryId: "",
    imageUrl: "",
  });

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchProducts = () => {
    if (!token) return;
    fetch(`${API_URL}/api/products`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data: Product[]) => setProducts(data))
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
    setFormData({ name: "", description: "", price: 0, stock: 0, categoryId: "", imageUrl: "" });
    setModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || "",
      description: product.description || "",
      price: product.price || 0,
      stock: product.stock || 0,
      categoryId: product.categoryId || "",
      imageUrl: product.imageUrl || "",
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
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to save product");

      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("Error saving product");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-gray-900">Products</h1>

      <button
        className="mb-4 px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        onClick={openAddModal}
      >
        + Add Product
      </button>

      <div className="overflow-x-auto">
        <table className="w-full bg-white border border-gray-200 text-sm rounded-md">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left border-b text-gray-700">ID</th>
              <th className="px-4 py-2 text-left border-b text-gray-700">Image</th>
              <th className="px-4 py-2 text-left border-b text-gray-700">Name</th>
              <th className="px-4 py-2 text-left border-b text-gray-700">Price</th>
              <th className="px-4 py-2 text-left border-b text-gray-700">Stock</th>
              <th className="px-4 py-2 text-left border-b text-gray-700">Category</th>
              <th className="px-4 py-2 text-right border-b text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, idx) => (
              <tr
                key={p.id}
                className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100`}
              >
                <td className="px-4 py-2 truncate">{p.id}</td>
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
                <td className="px-4 py-2 font-medium text-gray-800">{p.name}</td>
                <td className="px-4 py-2 text-gray-800">${p.price.toFixed(2)}</td>
                <td className="px-4 py-2 text-gray-800">{p.stock}</td>
                <td className="px-4 py-2 text-gray-800">
                  {categories.find(c => c.id === p.categoryId)?.name || "N/A"}
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
                <td colSpan={7} className="text-center py-4 text-gray-400 italic">
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-5 rounded shadow w-80">
            <h2 className="text-lg font-bold mb-3">
              {editingProduct ? "Edit Product" : "Add Product"}
            </h2>
            <form onSubmit={handleFormSubmit} className="space-y-2 text-sm">
              <div>
                <label className="block mb-1 font-medium">Name</label>
                <input
                  type="text"
                  placeholder="Product name"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border px-2 py-1 rounded"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Description</label>
                <textarea
                  placeholder="Description"
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border px-2 py-1 rounded"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Price ($)</label>
                <input
                  type="number"
                  placeholder="Price"
                  value={formData.price || 0}
                  onChange={(e) => setFormData({ ...formData, price: +e.target.value })}
                  className="w-full border px-2 py-1 rounded"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Stock</label>
                <input
                  type="number"
                  placeholder="Stock"
                  value={formData.stock || 0}
                  onChange={(e) => setFormData({ ...formData, stock: +e.target.value })}
                  className="w-full border px-2 py-1 rounded"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Category</label>
                <select
                  value={formData.categoryId || ""}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
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
                <label className="block mb-1 font-medium">Image URL</label>
                <input
                  type="text"
                  placeholder="Image URL"
                  value={formData.imageUrl || ""}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full border px-2 py-1 rounded"
                />
              </div>

              <div className="flex justify-end space-x-1 mt-2">
                <button
                  type="button"
                  className="px-2 py-1 rounded border hover:bg-gray-100 transition"
                  onClick={() => setModalOpen(false)}
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
