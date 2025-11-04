"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Edit3, RefreshCcw } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

interface ParentCategory {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
}

interface HomepageSection {
  id: string;
  type: string;
  heading?: string;
  subheading?: string;
  description?: string;
  imageUrl?: string;
  imageUrls?: string[];
  linkedCategoryId?: string | null;
  categoryIds?: string[];
  linkedProductIds?: string[];
  orderIndex?: number;
  isActive: boolean;
}

export default function HomepageSectionsPage() {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [categories, setCategories] = useState<ParentCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]); // ✅ NEW
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<HomepageSection | null>(null);
  const [formData, setFormData] = useState({
    type: "",
    heading: "",
    subheading: "",
    description: "",
    imageUrl: "",
    imageUrls: [] as string[],
    linkedCategoryId: "",
    categoryIds: [] as string[],
    linkedProductIds: [] as string[],
    orderIndex: 0,
    isActive: true,
  });

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Fetch all sections
  const fetchSections = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/homepage-sections/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch homepage sections");
      const data = await res.json();
      setSections(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories for dropdowns
  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/categories`);
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  // ✅ Fetch products for "Trending Products" dropdown
  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/products`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  useEffect(() => {
    fetchSections();
    fetchCategories();
    fetchProducts(); // ✅ Added
  }, []);

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingSection ? "PUT" : "POST";
    const url = editingSection
      ? `${API_BASE}/api/homepage-sections/admin/${editingSection.id}`
      : `${API_BASE}/api/homepage-sections/admin`;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to save section");
      setModalOpen(false);
      setEditingSection(null);
      fetchSections();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEdit = (section: HomepageSection) => {
    setEditingSection(section);
    setFormData({
      type: section.type,
      heading: section.heading || "",
      subheading: section.subheading || "",
      description: section.description || "",
      imageUrl: section.imageUrl || "",
      imageUrls: section.imageUrls || [],
      linkedCategoryId: section.linkedCategoryId || "",
      categoryIds: section.categoryIds || [],
      linkedProductIds: section.linkedProductIds || [],
      orderIndex: section.orderIndex || 0,
      isActive: section.isActive,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this section?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/homepage-sections/admin/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete section");
      setSections((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <p>Loading sections...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Homepage Sections</h1>
        <div className="flex gap-3">
          <button
            onClick={fetchSections}
            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <RefreshCcw size={16} /> Refresh
          </button>
          <button
            onClick={() => {
              setEditingSection(null);
              setFormData({
                type: "",
                heading: "",
                subheading: "",
                description: "",
                imageUrl: "",
                imageUrls: [],
                linkedCategoryId: "",
                categoryIds: [],
                linkedProductIds: [],
                orderIndex: 0,
                isActive: true,
              });
              setModalOpen(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={16} /> Add Section
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
              <th className="p-3 border-b">Type</th>
              <th className="p-3 border-b">Heading</th>
              <th className="p-3 border-b">Subheading</th>
              <th className="p-3 border-b">Order</th>
              <th className="p-3 border-b">Active</th>
              <th className="p-3 border-b text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sections.map((section) => (
              <tr key={section.id} className="border-b hover:bg-gray-50 text-sm">
                <td className="p-3 font-medium text-gray-800">{section.type}</td>
                <td className="p-3">{section.heading || "-"}</td>
                <td className="p-3">{section.subheading || "-"}</td>
                <td className="p-3">{section.orderIndex}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      section.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {section.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="p-3 text-right flex justify-end gap-3">
                  <button onClick={() => handleEdit(section)} className="text-blue-600 hover:text-blue-800">
                    <Edit3 size={18} />
                  </button>
                  <button onClick={() => handleDelete(section.id)} className="text-red-600 hover:text-red-800">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
            <h2 className="text-xl font-semibold mb-4">
              {editingSection ? "Edit Section" : "Add New Section"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Type */}
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-2"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                >
                  <option value="">Select type</option>
                  <option value="featured_categories">Featured Categories</option>
                  <option value="trending_products">Trending Products</option>
                  <option value="brand_story">Brand Story</option>
                </select>
              </div>

              {/* Common Fields */}
              {formData.type && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Heading</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg p-2"
                      value={formData.heading}
                      onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Subheading</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg p-2"
                      value={formData.subheading}
                      onChange={(e) => setFormData({ ...formData, subheading: e.target.value })}
                    />
                  </div>

                  {/* Featured Categories */}
                  {formData.type === "featured_categories" && (
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Select Categories (Ctrl/Cmd + Click to select multiple)
                      </label>
                      <select
                        multiple
                        className="w-full border border-gray-300 rounded-lg p-2 h-32"
                        value={formData.categoryIds}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            categoryIds: Array.from(e.target.selectedOptions, (opt) => opt.value),
                          })
                        }
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* ✅ Trending Products */}
                  {formData.type === "trending_products" && (
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Select Products (Ctrl/Cmd + Click to select multiple)
                      </label>
                      <select
                        multiple
                        className="w-full border border-gray-300 rounded-lg p-2 h-32"
                        value={formData.linkedProductIds}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            linkedProductIds: Array.from(e.target.selectedOptions, (opt) => opt.value),
                          })
                        }
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

              {formData.type === "brand_story" && (
  <>
    <div>
      <label className="block text-sm font-medium mb-1">Description</label>
      <textarea
        className="w-full border border-gray-300 rounded-lg p-2"
        rows={3}
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
      />
    </div>

    <div>
      <label className="block text-sm font-medium mb-1">
        Brand Story Image URLs (comma-separated)
      </label>
      <input
        type="text"
        className="w-full border border-gray-300 rounded-lg p-2"
        value={formData.imageUrls.join(",")}
        onChange={(e) =>
          setFormData({
            ...formData,
            imageUrls: e.target.value.split(",").map((s) => s.trim()),
          })
        }
      />
      <p className="text-xs text-gray-500 mt-1">
        Example: /images/story1.jpg, /images/story2.jpg, /images/story3.jpg
      </p>
    </div>
  </>
)}

                </>
              )}

              {/* Order + Active */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Order Index</label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-lg p-2"
                    value={Number.isNaN(formData.orderIndex) ? "" : formData.orderIndex ?? ""}
                    onChange={(e) =>
                      setFormData({ ...formData, orderIndex: parseInt(e.target.value || "0", 10) })
                    }
                  />
                </div>

                <div className="flex items-center gap-2 mt-6">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <label className="text-sm">Active</label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                  {editingSection ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
