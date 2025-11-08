"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/utils/api";
import { notify } from "@/utils/notify";

interface Sale {
  id: string;
  title: string;
  description?: string | null;
  discountType: "percentage" | "fixed";
  discountValue: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  bannerImageUrl?: string | null;
  bannerText?: string | null;
  parentCategoryId?: string | null;
  subCategoryId?: string | null;
  productId?: string | null;
}

interface SaleFormData {
  title: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: string | number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  bannerImageUrl: string;
  bannerText: string;
  parentCategoryId?: string;
  subCategoryId?: string;
  productId?: string;
}

export default function SalesAdminPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);

  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  const [formData, setFormData] = useState<SaleFormData>({
    title: "",
    description: "",
    discountType: "percentage",
    discountValue: "",
    startDate: "",
    endDate: "",
    isActive: true,
    bannerImageUrl: "",
    bannerText: "",
  });

  /* -------------------- FETCH DATA -------------------- */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      notify.error("You are not logged in as admin");
      setLoading(false);
      return;
    }

    fetchSales(token);
    fetchFilters();
  }, []);

  const fetchFilters = async () => {
    try {
      const [cats, subs, prods] = await Promise.all([
        apiRequest<any[]>("/api/categories", { method: "GET" }),
        apiRequest<any[]>("/api/categories/sub", { method: "GET" }), // ✅ fixed route
        apiRequest<any[]>("/api/products", { method: "GET" }),
      ]);
      setCategories(cats || []);
      setSubcategories(subs || []);
      setProducts(prods || []);
      console.log("🐱 Categories:", cats);
      console.log("📂 Subcategories:", subs);
      console.log("📦 Products:", prods);
    } catch (err) {
      console.error("❌ Filter fetch error:", err);
      notify.error("Failed to load dropdown data");
    }
  };

  const fetchSales = async (token: string) => {
    try {
      setLoading(true);
      const data = await apiRequest<Sale[]>("/api/sales", { method: "GET", token });
      setSales(data);
    } catch (err) {
      console.error("❌ fetchSales error:", err);
      notify.error("Failed to fetch sales");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- MODAL HANDLERS -------------------- */
  const openModal = (sale: Sale | null = null) => {
    if (sale) {
      setEditingSale(sale);
      setFormData({
        title: sale.title,
        description: sale.description || "",
        discountType: sale.discountType,
        discountValue: sale.discountValue,
        startDate: sale.startDate.split("T")[0],
        endDate: sale.endDate.split("T")[0],
        isActive: sale.isActive,
        bannerImageUrl: sale.bannerImageUrl || "",
        bannerText: sale.bannerText || "",
        parentCategoryId: sale.parentCategoryId || "",
        subCategoryId: sale.subCategoryId || "",
        productId: sale.productId || "",
      });
    } else {
      setEditingSale(null);
      setFormData({
        title: "",
        description: "",
        discountType: "percentage",
        discountValue: "",
        startDate: "",
        endDate: "",
        isActive: true,
        bannerImageUrl: "",
        bannerText: "",
      });
    }
    setModalOpen(true);
  };

  /* -------------------- SUBMIT -------------------- */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const method = editingSale ? "PUT" : "POST";
      const url = editingSale ? `/api/sales/${editingSale.id}` : "/api/sales";

      await apiRequest<Sale>(url, { method, body: formData, token });
      notify.success(editingSale ? "Sale updated successfully" : "Sale created");
      setModalOpen(false);
      fetchSales(token!);
    } catch (err) {
      console.error("❌ Error saving sale:", err);
      notify.error("Failed to save sale");
    }
  };

  /* -------------------- DELETE -------------------- */
  const deleteSale = async (id: string) => {
    if (!confirm("Are you sure you want to delete this sale?")) return;
    try {
      const token = localStorage.getItem("token");
      await apiRequest(`/api/sales/${id}`, { method: "DELETE", token });
      notify.success("Sale deleted");
      fetchSales(token!);
    } catch (err) {
      notify.error("Failed to delete sale");
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  /* -------------------- RENDER -------------------- */
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Sales & Discounts</h1>
        <button
          onClick={() => openModal()}
          className="px-4 py-2 rounded-lg bg-[#025a6a] text-white hover:bg-[#4a9eb3] transition"
        >
          + Add Sale
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading sales...</p>
      ) : sales.length === 0 ? (
        <p className="text-gray-400">No sales found.</p>
      ) : (
        <div className="overflow-x-auto border rounded-lg shadow-sm">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 font-semibold">Title</th>
                <th className="p-3 font-semibold">Type</th>
                <th className="p-3 font-semibold">Value</th>
                <th className="p-3 font-semibold">Start</th>
                <th className="p-3 font-semibold">End</th>
                <th className="p-3 font-semibold">Active</th>
                <th className="p-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{sale.title}</td>
                  <td className="p-3 capitalize">{sale.discountType}</td>
                  <td className="p-3">
                    {sale.discountType === "percentage"
                      ? `${sale.discountValue}%`
                      : `₹${sale.discountValue}`}
                  </td>
                  <td className="p-3">{formatDate(sale.startDate)}</td>
                  <td className="p-3">{formatDate(sale.endDate)}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        sale.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {sale.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-3 space-x-3">
                    <button onClick={() => openModal(sale)} className="text-blue-600 hover:underline">
                      Edit
                    </button>
                    <button onClick={() => deleteSale(sale.id)} className="text-red-600 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-[500px] p-6">
            <h2 className="text-lg font-semibold mb-4">{editingSale ? "Edit Sale" : "Create Sale"}</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              {/* Discount Type & Value */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium">Discount Type</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountType: e.target.value as "percentage" | "fixed",
                      })
                    }
                    className="w-full p-2 border rounded"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed</option>
                  </select>
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium">Discount Value</label>
                  <input
                    type="number"
                    value={String(formData.discountValue)}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
              </div>

              {/* Apply Target */}
              <div>
                <label className="block text-sm font-medium mb-1">Apply To</label>
                <select
                  value={
                    formData.productId
                      ? `product:${formData.productId}`
                      : formData.subCategoryId
                      ? `sub:${formData.subCategoryId}`
                      : formData.parentCategoryId
                      ? `cat:${formData.parentCategoryId}`
                      : ""
                  }
                  onChange={(e) => {
                    const [type, id] = e.target.value.split(":");
                    setFormData({
                      ...formData,
                      parentCategoryId: type === "cat" ? id : "",
                      subCategoryId: type === "sub" ? id : "",
                      productId: type === "product" ? id : "",
                    });
                  }}
                  className="w-full p-2 border rounded"
                >
                  <option value="">-- None (Global Sale) --</option>
                  <optgroup label="Categories">
                    {categories.map((cat) => (
                      <option key={cat.id} value={`cat:${cat.id}`}>
                        🏷️ {cat.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Subcategories">
                    {subcategories.map((sub) => (
                      <option key={sub.id} value={`sub:${sub.id}`}>
                        ↳ {sub.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Products">
                    {products.map((p) => (
                      <option key={p.id} value={`product:${p.id}`}>
                        📦 {p.name}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Active toggle */}
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <label className="text-sm font-medium">Active Sale</label>
              </div>

              {/* Banner fields */}
              <div>
                <label className="block text-sm font-medium">Banner Image URL</label>
                <input
                  type="text"
                  value={formData.bannerImageUrl}
                  onChange={(e) => setFormData({ ...formData, bannerImageUrl: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Banner Text</label>
                <input
                  type="text"
                  value={formData.bannerText}
                  onChange={(e) => setFormData({ ...formData, bannerText: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#025a6a] text-white rounded-lg hover:bg-[#4a9eb3]"
                >
                  {editingSale ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
