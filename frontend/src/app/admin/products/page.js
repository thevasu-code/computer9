"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
const ImageUpload = dynamic(() => import("./ImageUpload"), { ssr: false });

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    brand: "",
    stock: "",
    description: "",
    image: "",
    tags: [],
    discount: 0,
    specs: [{ key: "", value: "" }],
    images: [],
    richDescription: ""
  });
  const [uploadedImage, setUploadedImage] = useState("");
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    price: "",
    category: "",
    brand: "",
    stock: "",
    description: "",
    image: "",
    tags: [],
    discount: 0,
    specs: [{ key: "", value: "" }],
    images: [],
    richDescription: ""
  });
  const [editUploadedImage, setEditUploadedImage] = useState("");
    const handleEditInput = (e) => {
      setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };
    const handleEditImageUpload = (urls) => {
      setEditForm({ ...editForm, images: [...editForm.images, ...urls] });
    };

    const handleEdit = (product) => {
      setEditId(product._id);
      setEditForm({
        name: product.name,
        price: product.price,
        category: product.category,
        brand: product.brand,
        stock: product.stock,
        description: product.description,
        image: product.image,
        tags: product.tags || [],
        discount: product.discount || 0,
        specs: product.specs || [{ key: "", value: "" }],
        images: product.images || [],
        richDescription: product.richDescription || ""
      });
      setEditUploadedImage("");
    };

    const handleUpdate = async (e) => {
      e.preventDefault();
      setError("");
      try {
        const payload = { ...editForm };
        if (editUploadedImage) payload.image = editUploadedImage;
        const res = await fetch(`http://localhost:4000/products/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Update failed");
        setProducts(products.map(p => p._id === editId ? data : p));
        setEditId(null);
        setEditUploadedImage("");
      } catch (err) {
        setError(err.message);
      }
    };
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:4000/products")
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      });
  }, []);

  const handleInput = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleImageUpload = (urls) => {
    setForm({ ...form, images: [...form.images, ...urls] });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = { ...form };
      if (uploadedImage) payload.image = uploadedImage;
      const res = await fetch("http://localhost:4000/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Add failed");
      setProducts([...products, data]);
      setShowForm(false);
      setForm({ name: "", price: "", category: "", brand: "", stock: "", description: "", image: "" });
      setUploadedImage("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      const res = await fetch(`http://localhost:4000/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setProducts(products.filter(p => p._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Manage Products</h1>
      <button
        className="mb-6 bg-primary text-white px-6 py-2 rounded font-medium hover:bg-primary/90 transition-colors"
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? "Cancel" : "Add Product"}
      </button>
      {showForm && (
        <form className="bg-white rounded shadow p-6 mb-8 space-y-4 max-w-lg mx-auto" onSubmit={handleAdd}>
          <input name="name" value={form.name} onChange={handleInput} placeholder="Name" className="w-full border rounded px-3 py-2" required />
          <input name="price" value={form.price} onChange={handleInput} placeholder="Price" type="number" className="w-full border rounded px-3 py-2" required />
          <input name="category" value={form.category} onChange={handleInput} placeholder="Category" className="w-full border rounded px-3 py-2" />
          <input name="brand" value={form.brand} onChange={handleInput} placeholder="Brand" className="w-full border rounded px-3 py-2" />
          <input name="stock" value={form.stock} onChange={handleInput} placeholder="Stock" type="number" className="w-full border rounded px-3 py-2" />
          <ImageUpload onUpload={handleImageUpload} />
          {form.images.length > 0 && (
            <div className="flex gap-2 flex-wrap justify-center">
              {form.images.map((img, idx) => (
                <Image key={idx} src={`http://localhost:4000${img}`} alt={`Product ${idx + 1}`} width={96} height={96} className="object-contain rounded border" unoptimized />
              ))}
            </div>
          )}
          <input name="image" value={form.image} onChange={handleInput} placeholder="Main Image URL (optional)" className="w-full border rounded px-3 py-2" />
          <textarea name="description" value={form.description} onChange={handleInput} placeholder="Description" className="w-full border rounded px-3 py-2" />
          <input name="discount" value={form.discount} onChange={handleInput} placeholder="Discount (%)" type="number" className="w-full border rounded px-3 py-2" />
          <input name="tags" value={form.tags.join(", ")} onChange={e => setForm({ ...form, tags: e.target.value.split(",").map(t => t.trim()) })} placeholder="Tags (comma separated)" className="w-full border rounded px-3 py-2" />
          <textarea name="richDescription" value={form.richDescription} onChange={handleInput} placeholder="Rich Description (HTML allowed)" className="w-full border rounded px-3 py-2" />
          <div className="mt-4">
            <label className="font-semibold mb-2 block">Technical Specs</label>
            <table className="w-full border rounded mb-2">
              <thead>
                <tr className="bg-zinc-100">
                  <th className="p-2">Key</th>
                  <th className="p-2">Value</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {form.specs.map((spec, idx) => (
                  <tr key={idx}>
                    <td className="p-2"><input value={spec.key} onChange={e => {
                      const specs = [...form.specs];
                      specs[idx].key = e.target.value;
                      setForm({ ...form, specs });
                    }} className="border rounded px-2 w-full" /></td>
                    <td className="p-2"><input value={spec.value} onChange={e => {
                      const specs = [...form.specs];
                      specs[idx].value = e.target.value;
                      setForm({ ...form, specs });
                    }} className="border rounded px-2 w-full" /></td>
                    <td className="p-2">
                      <button type="button" className="text-red-500" onClick={() => {
                        setForm({ ...form, specs: form.specs.filter((_, i) => i !== idx) });
                      }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button type="button" className="bg-primary text-white px-2 py-1 rounded" onClick={() => setForm({ ...form, specs: [...form.specs, { key: "", value: "" }] })}>Add Spec</button>
          </div>
          {error && <div className="text-red-500">{error}</div>}
          <button type="submit" className="w-full bg-primary text-white py-3 rounded font-medium text-lg hover:bg-primary/90 transition-colors">Add</button>
        </form>
      )}
      <table className="w-full border-collapse bg-white rounded shadow mt-8">
        <thead>
          <tr className="border-b">
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-center">Price</th>
            <th className="p-2 text-center">Stock</th>
            <th className="p-2 text-center">Category</th>
            <th className="p-2 text-center">Brand</th>
            <th className="p-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p._id} className="border-b">
              {editId === p._id ? (
                <>
                  <td className="p-2"><input name="name" value={editForm.name} onChange={handleEditInput} className="border rounded px-2 w-full" /></td>
                  <td className="p-2 text-center"><input name="price" value={editForm.price} onChange={handleEditInput} type="number" className="border rounded px-2 w-20 text-center" /></td>
                  <td className="p-2 text-center"><input name="stock" value={editForm.stock} onChange={handleEditInput} type="number" className="border rounded px-2 w-16 text-center" /></td>
                  <td className="p-2 text-center"><input name="category" value={editForm.category} onChange={handleEditInput} className="border rounded px-2 w-24 text-center" /></td>
                  <td className="p-2 text-center"><input name="brand" value={editForm.brand} onChange={handleEditInput} className="border rounded px-2 w-24 text-center" /></td>
                  <td className="p-2 align-top">
                    <div className="bg-white shadow-lg rounded-xl p-6 flex flex-wrap gap-6 border border-zinc-200 min-w-[700px] max-w-[1200px] mx-auto">
                      <div className="flex flex-col gap-2 w-[180px] min-w-[150px]">
                        <label className="text-xs font-semibold text-zinc-600">Name</label>
                        <input
                          type="text"
                          name="name"
                          value={editForm.name}
                          onChange={handleEditInput}
                          className="border border-zinc-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                          placeholder="Product Name"
                        />
                        <label className="text-xs font-semibold text-zinc-600 mt-2">Price</label>
                        <input
                          type="number"
                          name="price"
                          value={editForm.price}
                          onChange={handleEditInput}
                          className="border border-zinc-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                          placeholder="Price"
                        />
                        <label className="text-xs font-semibold text-zinc-600 mt-2">Stock</label>
                        <input
                          type="number"
                          name="stock"
                          value={editForm.stock}
                          onChange={handleEditInput}
                          className="border border-zinc-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                          placeholder="Stock"
                        />
                        <label className="text-xs font-semibold text-zinc-600 mt-2">Category</label>
                        <input
                          type="text"
                          name="category"
                          value={editForm.category}
                          onChange={handleEditInput}
                          className="border border-zinc-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                          placeholder="Category"
                        />
                        <label className="text-xs font-semibold text-zinc-600 mt-2">Brand</label>
                        <input
                          type="text"
                          name="brand"
                          value={editForm.brand}
                          onChange={handleEditInput}
                          className="border border-zinc-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                          placeholder="Brand"
                        />
                      </div>
                      <div className="flex flex-col gap-2 flex-1 min-w-[220px]">
                        <label className="text-xs font-semibold text-zinc-600">Description</label>
                        <textarea
                          name="description"
                          value={editForm.description}
                          onChange={handleEditInput}
                          placeholder="Product description..."
                          className="w-full min-h-[160px] border border-zinc-300 rounded-lg px-3 py-3 text-zinc-700 focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-sm transition-all resize-none text-base"
                        />
                        <label className="text-xs font-semibold text-zinc-600 mt-2">Images</label>
                        <ImageUpload onUpload={handleEditImageUpload} />
                        {editForm.images && editForm.images.length > 0 && (
                          <div className="flex gap-3 flex-wrap justify-start mt-2">
                            {editForm.images.slice(0, 5).map((img, idx) => (
                              <div key={idx} className="relative inline-block group">
                                <Image src={`http://localhost:4000${img}`} alt={`Product ${idx + 1}`} width={80} height={80} className="object-contain rounded-lg border border-zinc-300 shadow-sm transition-transform group-hover:scale-105" unoptimized />
                                <button
                                  type="button"
                                  className="absolute top-1 right-1 bg-gradient-to-tr from-red-600 to-pink-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-base shadow-md opacity-80 hover:opacity-100 transition-opacity"
                                  onClick={() => {
                                    const newImages = editForm.images.filter((_, i) => i !== idx);
                                    setEditForm({ ...editForm, images: newImages });
                                  }}
                                  aria-label="Remove image"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="w-full flex justify-end gap-3 mt-4">
                          <button className="bg-gradient-to-r from-primary to-blue-600 text-white px-5 py-2 rounded-lg font-semibold shadow hover:from-blue-700 hover:to-primary transition-colors" onClick={handleUpdate}>Save</button>
                          <button className="bg-zinc-100 text-zinc-600 px-5 py-2 rounded-lg font-semibold shadow hover:bg-zinc-200 transition-colors" onClick={() => setEditId(null)}>Cancel</button>
                        </div>
                      </div>
                    </div>
                  </td>
                </>
              ) : (
                <>
                  <td className="p-2">{p.name}</td>
                  <td className="p-2 text-center">₹{p.price}</td>
                  <td className="p-2 text-center">{p.stock}</td>
                  <td className="p-2 text-center">{p.category}</td>
                  <td className="p-2 text-center">{p.brand}</td>
                  <td className="p-2 text-center">
                    {(p.images && p.images.length > 0) ? (
                      <Image src={`http://localhost:4000${p.images[0]}`} alt={p.name} width={64} height={64} className="object-contain rounded border" unoptimized />
                    ) : (
                      <span className="text-zinc-400">No image</span>
                    )}
                    <button className="text-primary hover:underline mr-2 ml-2" onClick={() => handleEdit(p)}>Edit</button>
                    <button className="text-red-500 hover:underline ml-2" onClick={() => handleDelete(p._id)}>Delete</button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
