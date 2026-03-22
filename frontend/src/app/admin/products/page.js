"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const PRODUCTS_PER_PAGE = 30;

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const getAuthHeaders = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
    if (!token) throw new Error("Admin token missing. Please login again.");
    return { Authorization: `Bearer ${token}` };
  };

  const fetchProducts = async (pageNumber) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/products?page=${pageNumber}&limit=${PRODUCTS_PER_PAGE}`);
      if (!res.ok) throw new Error("Failed to load products");
      const data = await res.json();
      setProducts(Array.isArray(data.items) ? data.items : []);
      setTotalPages(typeof data.totalPages === "number" ? Math.max(1, data.totalPages) : 1);
    } catch (err) {
      setError(err.message || "Failed to load products");
      setProducts([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(page);
  }, [page]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Delete failed");
      }
      const nextPage = products.length === 1 && page > 1 ? page - 1 : page;
      if (nextPage !== page) {
        setPage(nextPage);
      } else {
        fetchProducts(page);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="flex items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold">Manage Products</h1>
        <Link
          href="/admin/products/new"
          className="bg-primary text-white px-6 py-2 rounded font-medium hover:bg-primary/90 transition-colors"
        >
          Add Product
        </Link>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <table className="w-full border-collapse bg-white rounded shadow">
        <thead>
          <tr className="border-b bg-zinc-50">
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-center">Price</th>
            <th className="p-3 text-center">Stock</th>
            <th className="p-3 text-center">Category</th>
            <th className="p-3 text-center">Brand</th>
            <th className="p-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p._id} className="border-b">
              <td className="p-3">{p.name}</td>
              <td className="p-3 text-center">₹{p.price}</td>
              <td className="p-3 text-center">{p.stock}</td>
              <td className="p-3 text-center">{p.category}</td>
              <td className="p-3 text-center">{p.brand}</td>
              <td className="p-3 text-center">
                {(p.images && p.images.length > 0) ? (
                  <Image
                    src={p.images[0].startsWith("http") ? p.images[0] : "/no-image.png"}
                    alt={p.name}
                    width={56}
                    height={56}
                    className="object-contain rounded border inline-block"
                    unoptimized
                  />
                ) : (
                  <span className="text-zinc-400">No image</span>
                )}
                <Link href={`/admin/products/${p._id}/edit`} className="text-primary hover:underline ml-3">
                  Edit
                </Link>
                <button
                  className="text-red-500 hover:underline ml-3"
                  onClick={() => handleDelete(p._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr>
              <td colSpan={6} className="p-6 text-center text-zinc-500">No products found.</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="mt-6 flex items-center justify-center gap-2 flex-wrap">
        <button
          className="px-3 py-1 rounded border disabled:opacity-50"
          disabled={page === 1}
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
        >
          Prev
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            className={`px-3 py-1 rounded border ${page === p ? "bg-primary text-white border-primary" : "bg-white"}`}
            onClick={() => setPage(p)}
          >
            {p}
          </button>
        ))}
        <button
          className="px-3 py-1 rounded border disabled:opacity-50"
          disabled={page === totalPages}
          onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
        >
          Next
        </button>
      </div>
    </div>
  );
}
