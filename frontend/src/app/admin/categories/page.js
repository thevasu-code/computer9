"use client";
import React, { useEffect, useState } from "react";

const emptyForm = { name: "", slug: "", description: "", image: "", parent: "", isActive: true, order: 0 };

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const getAuthHeaders = (json = false) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
    if (!token) throw new Error("Admin token missing. Please login again.");
    return {
      ...(json ? { "Content-Type": "application/json" } : {}),
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Failed to load categories");
      setCategories(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const autoSlug = (name) => name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const handleInput = (e) => {
    const { name, value, type, checked } = e.target;
    const newForm = { ...form, [name]: type === "checkbox" ? checked : value };
    if (name === "name" && (!form.slug || form.slug === autoSlug(form.name))) {
      newForm.slug = autoSlug(value);
    }
    setForm(newForm);
  };

  const startEdit = (cat) => {
    setEditing(cat._id);
    setForm({
      name: cat.name || "",
      slug: cat.slug || "",
      description: cat.description || "",
      image: cat.image || "",
      parent: cat.parent?._id || cat.parent || "",
      isActive: cat.isActive !== false,
      order: cat.order || 0,
    });
    setError("");
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm(emptyForm);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = { ...form, parent: form.parent || null };
      const url = editing ? `/api/categories/${editing}` : "/api/categories";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(true),
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Save failed");
      cancelEdit();
      fetchCategories();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Delete failed");
      fetchCategories();
    } catch (err) {
      alert(err.message);
    }
  };

  const parentOptions = categories.filter((c) => c._id !== editing);

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Manage Categories</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded shadow p-6 mb-8 space-y-4">
        <h2 className="text-xl font-semibold">{editing ? "Edit Category" : "Add Category"}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="name" value={form.name} onChange={handleInput} placeholder="Category Name" className="border rounded px-3 py-2 w-full" required />
          <input name="slug" value={form.slug} onChange={handleInput} placeholder="Slug (auto-generated)" className="border rounded px-3 py-2 w-full" required />
          <select name="parent" value={form.parent} onChange={handleInput} className="border rounded px-3 py-2 w-full">
            <option value="">No Parent (Top Level)</option>
            {parentOptions.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
          <input name="order" value={form.order} onChange={handleInput} placeholder="Sort Order" type="number" className="border rounded px-3 py-2 w-full" />
          <input name="image" value={form.image} onChange={handleInput} placeholder="Image URL (optional)" className="border rounded px-3 py-2 w-full md:col-span-2" />
          <textarea name="description" value={form.description} onChange={handleInput} placeholder="Description (optional)" className="border rounded px-3 py-2 w-full md:col-span-2" rows={2} />
          <label className="flex items-center gap-2 text-sm">
            <input name="isActive" type="checkbox" checked={form.isActive} onChange={handleInput} />
            Active
          </label>
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="bg-primary text-white px-6 py-2 rounded font-medium hover:bg-primary/90 transition-colors disabled:opacity-60">
            {saving ? "Saving..." : editing ? "Update Category" : "Add Category"}
          </button>
          {editing && (
            <button type="button" onClick={cancelEdit} className="px-6 py-2 rounded border font-medium hover:bg-zinc-50">
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Table */}
      <table className="w-full border-collapse bg-white rounded shadow">
        <thead>
          <tr className="border-b bg-zinc-50">
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Slug</th>
            <th className="p-3 text-center">Parent</th>
            <th className="p-3 text-center">Order</th>
            <th className="p-3 text-center">Active</th>
            <th className="p-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat._id} className="border-b">
              <td className="p-3 font-medium">{cat.name}</td>
              <td className="p-3 text-zinc-500">{cat.slug}</td>
              <td className="p-3 text-center">{cat.parent?.name || "—"}</td>
              <td className="p-3 text-center">{cat.order}</td>
              <td className="p-3 text-center">{cat.isActive ? "✓" : "✗"}</td>
              <td className="p-3 text-center">
                <button onClick={() => startEdit(cat)} className="text-primary hover:underline mr-3">Edit</button>
                <button onClick={() => handleDelete(cat._id)} className="text-red-500 hover:underline">Delete</button>
              </td>
            </tr>
          ))}
          {categories.length === 0 && (
            <tr>
              <td colSpan={6} className="p-6 text-center text-zinc-500">No categories yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
