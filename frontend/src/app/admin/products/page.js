"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2, Edit, Package } from "lucide-react";

const PRODUCTS_PER_PAGE = 30;

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProducts = async (pageNumber) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/products?page=${pageNumber}&limit=${PRODUCTS_PER_PAGE}`);
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setProducts(Array.isArray(data.items) ? data.items : []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(page); }, [page]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Delete failed");
      fetchProducts(page);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="text-xl font-bold text-gray-900">Products</h1>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Add Product
        </Link>
      </div>

      {error && <div className="text-sm text-red-600 mb-4">{error}</div>}

      {loading ? (
        <div className="p-12 text-center text-gray-400">Loading products...</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="hidden md:grid grid-cols-[2fr_0.8fr_0.6fr_1fr_0.8fr_100px] gap-2 px-5 py-3 bg-gray-50 border-b border-gray-100 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            <span>Product</span><span>Price</span><span>Stock</span><span>Category</span><span>Brand</span><span>Actions</span>
          </div>

          {products.length === 0 ? (
            <div className="p-12 text-center text-gray-400">No products found.</div>
          ) : (
            products.map((p) => (
              <div key={p._id} className="grid grid-cols-1 md:grid-cols-[2fr_0.8fr_0.6fr_1fr_0.8fr_100px] gap-2 px-5 py-3.5 items-center border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                    {p.images?.[0]?.startsWith("http") ? (
                      <img src={p.images[0]} alt="" className="w-full h-full object-contain" />
                    ) : (
                      <Package size={16} className="text-gray-300" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-800 truncate">{p.name}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">₹{p.price?.toLocaleString("en-IN")}</span>
                <span className={`text-sm font-medium ${p.stock > 0 ? "text-green-600" : "text-red-500"}`}>
                  {p.stock || 0}
                </span>
                <span className="text-xs text-gray-500">{p.category || "—"}</span>
                <span className="text-xs text-gray-500">{p.brand || "—"}</span>
                <div className="flex items-center gap-2">
                  <Link href={`/admin/products/${p._id}/edit`} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit size={15} />
                  </Link>
                  <button onClick={() => handleDelete(p._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-1.5">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-3 py-1.5 text-sm rounded-lg border ${
                page === p ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
