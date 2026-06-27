"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Plus, Trash2, ChevronDown, ChevronUp, Eye, ImageIcon, Tag, FileText, Search, Settings2 } from "lucide-react";

const ImageUpload = dynamic(() => import("./ImageUpload"), { ssr: false });

const getInitialForm = () => ({
  name: "",
  price: "",
  originalPrice: "",
  category: "",
  brand: "",
  stock: "",
  description: "",
  image: "",
  tags: [],
  discount: 0,
  specs: [{ key: "", value: "" }],
  images: [],
  richDescription: "",
  seo: {
    metaTitle: "",
    metaDescription: "",
    keywords: [],
    ogImage: "",
    canonicalUrl: "",
    noIndex: false,
  },
});

export default function ProductForm({ mode = "create", productId }) {
  const router = useRouter();
  const [form, setForm] = useState(getInitialForm);
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);
  const [openSections, setOpenSections] = useState({
    basic: true,
    media: true,
    description: true,
    pricing: true,
    specs: true,
    seo: false,
  });

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (mode !== "edit" || !productId) return;
    fetch(`/api/products/${productId}`)
      .then((r) => { if (!r.ok) throw new Error("Failed to load"); return r.json(); })
      .then((p) => {
        setForm({
          name: p.name || "",
          price: p.price || "",
          originalPrice: p.originalPrice || "",
          category: p.category || "",
          brand: p.brand || "",
          stock: p.stock || "",
          description: p.description || "",
          image: p.image || "",
          tags: p.tags || [],
          discount: p.discount || 0,
          specs: p.specs?.length ? p.specs : [{ key: "", value: "" }],
          images: p.images || [],
          richDescription: p.richDescription || "",
          seo: {
            metaTitle: p.seo?.metaTitle || "",
            metaDescription: p.seo?.metaDescription || "",
            keywords: p.seo?.keywords || [],
            ogImage: p.seo?.ogImage || "",
            canonicalUrl: p.seo?.canonicalUrl || "",
            noIndex: Boolean(p.seo?.noIndex),
          },
        });
        setLoading(false);
      })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, [mode, productId]);

  const getAuthHeaders = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
    if (!token) throw new Error("Admin token missing.");
    return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
  };

  const handleInput = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSeoInput = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "keywords") {
      setForm({ ...form, seo: { ...form.seo, keywords: value.split(",").map((k) => k.trim()).filter(Boolean) } });
      return;
    }
    setForm({ ...form, seo: { ...form.seo, [name]: type === "checkbox" ? checked : value } });
  };

  const handleImageUpload = (urls) => setForm({ ...form, images: [...form.images, ...urls] });

  const removeImage = (idx) => setForm({ ...form, images: form.images.filter((_, i) => i !== idx) });

  const moveImage = (idx, dir) => {
    const imgs = [...form.images];
    const target = idx + dir;
    if (target < 0 || target >= imgs.length) return;
    [imgs[idx], imgs[target]] = [imgs[target], imgs[idx]];
    setForm({ ...form, images: imgs });
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const endpoint = mode === "edit" ? `/api/products/${productId}` : "/api/products";
      const method = mode === "edit" ? "PUT" : "POST";
      const res = await fetch(endpoint, { method, headers: getAuthHeaders(), body: JSON.stringify(form) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Save failed");
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleSection = (key) => setOpenSections({ ...openSections, [key]: !openSections[key] });

  if (loading) return <div className="p-8 text-center text-gray-400">Loading product...</div>;

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/products" className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{mode === "edit" ? "Edit Product" : "Add New Product"}</h1>
            <p className="text-xs text-gray-400 mt-0.5">{mode === "edit" ? "Update product details" : "Fill in the product information"}</p>
          </div>
        </div>
        <button
          onClick={submitForm}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors shadow-sm"
        >
          <Save size={16} />
          {saving ? "Saving..." : mode === "edit" ? "Update" : "Publish"}
        </button>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <form onSubmit={submitForm} className="space-y-4">
        {/* Basic Info */}
        <Section title="Basic Information" icon={<FileText size={16} />} isOpen={openSections.basic} onToggle={() => toggleSection("basic")}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Product Title *</label>
              <textarea
                name="name"
                value={form.name}
                onChange={handleInput}
                placeholder="e.g. Dell Inspiron 15 Laptop Intel Core i5 12th Gen"
                rows={2}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
              />
              <p className="text-[10px] text-gray-400 mt-1">{form.name.length} characters — keep under 200 for best SEO</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Category *</label>
                <select name="category" value={form.category} onChange={handleInput} required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white">
                  <option value="">Select category</option>
                  {categories.map((cat) => <option key={cat._id} value={cat.name}>{cat.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Brand</label>
                <input name="brand" value={form.brand} onChange={handleInput} placeholder="e.g. Dell, HP, ASUS"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Tags</label>
              <input
                value={form.tags.join(", ")}
                onChange={(e) => setForm({ ...form, tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })}
                placeholder="gaming, laptop, 12th gen (comma separated)"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
              />
            </div>
          </div>
        </Section>

        {/* Pricing & Stock */}
        <Section title="Pricing & Inventory" icon={<Tag size={16} />} isOpen={openSections.pricing} onToggle={() => toggleSection("pricing")}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Selling Price *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                <input name="price" value={form.price} onChange={handleInput} type="number" required placeholder="0"
                  className="w-full pl-7 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">MRP (Original)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                <input name="originalPrice" value={form.originalPrice} onChange={handleInput} type="number" placeholder="0"
                  className="w-full pl-7 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Discount %</label>
              <input name="discount" value={form.discount} onChange={handleInput} type="number" placeholder="0"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Stock Qty</label>
              <input name="stock" value={form.stock} onChange={handleInput} type="number" placeholder="0"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white" />
            </div>
          </div>
          {form.price && form.originalPrice && Number(form.originalPrice) > Number(form.price) && (
            <p className="mt-2 text-xs text-green-600 font-medium">
              Effective discount: {Math.round((1 - form.price / form.originalPrice) * 100)}% off
            </p>
          )}
        </Section>

        {/* Media */}
        <Section title="Product Images" icon={<ImageIcon size={16} />} isOpen={openSections.media} onToggle={() => toggleSection("media")}>
          <ImageUpload onUpload={handleImageUpload} />
          {form.images.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-gray-400 mb-2">Drag order: first image = main thumbnail. {form.images.length} image(s)</p>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {form.images.map((img, idx) => (
                  <div key={idx} className="relative group rounded-lg border border-gray-200 overflow-hidden bg-white aspect-square flex items-center justify-center">
                    <img src={img.startsWith("http") ? img : "/logo.svg"} alt="" className="max-h-full max-w-full object-contain p-2" />
                    {idx === 0 && (
                      <span className="absolute top-1 left-1 text-[8px] font-bold bg-blue-600 text-white px-1.5 py-0.5 rounded">MAIN</span>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                      {idx > 0 && (
                        <button type="button" onClick={() => moveImage(idx, -1)} className="w-6 h-6 bg-white rounded text-xs flex items-center justify-center">←</button>
                      )}
                      {idx < form.images.length - 1 && (
                        <button type="button" onClick={() => moveImage(idx, 1)} className="w-6 h-6 bg-white rounded text-xs flex items-center justify-center">→</button>
                      )}
                      <button type="button" onClick={() => removeImage(idx)} className="w-6 h-6 bg-red-500 text-white rounded text-xs flex items-center justify-center">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Section>

        {/* Description */}
        <Section title="Description" icon={<FileText size={16} />} isOpen={openSections.description} onToggle={() => toggleSection("description")}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Short Description</label>
              <textarea name="description" value={form.description} onChange={handleInput} rows={5} placeholder="Concise product description shown on the product page..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Rich Description (HTML)</label>
              <textarea name="richDescription" value={form.richDescription} onChange={handleInput} rows={6} placeholder="<h3>Features</h3><ul><li>...</li></ul>"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white" />
            </div>
          </div>
        </Section>

        {/* Specifications */}
        <Section title="Specifications" icon={<Settings2 size={16} />} isOpen={openSections.specs} onToggle={() => toggleSection("specs")}>
          <div className="space-y-2">
            {form.specs.map((spec, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input
                  value={spec.key}
                  onChange={(e) => { const s = [...form.specs]; s[idx].key = e.target.value; setForm({ ...form, specs: s }); }}
                  placeholder="e.g. Processor"
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
                />
                <input
                  value={spec.value}
                  onChange={(e) => { const s = [...form.specs]; s[idx].value = e.target.value; setForm({ ...form, specs: s }); }}
                  placeholder="e.g. Intel Core i5-12500H"
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
                />
                <button type="button" onClick={() => setForm({ ...form, specs: form.specs.filter((_, i) => i !== idx) })}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => setForm({ ...form, specs: [...form.specs, { key: "", value: "" }] })}
              className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-medium hover:text-blue-700 mt-1">
              <Plus size={14} /> Add Specification
            </button>
          </div>
        </Section>

        {/* SEO */}
        <Section title="SEO & Search" icon={<Search size={16} />} isOpen={openSections.seo} onToggle={() => toggleSection("seo")}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Meta Title</label>
              <input name="metaTitle" value={form.seo.metaTitle} onChange={handleSeoInput} maxLength={70} placeholder="Page title for Google (max 70 chars)"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white" />
              <p className={`text-[10px] mt-1 ${form.seo.metaTitle.length > 60 ? "text-amber-600" : "text-gray-400"}`}>{form.seo.metaTitle.length}/70</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Meta Description</label>
              <textarea name="metaDescription" value={form.seo.metaDescription} onChange={handleSeoInput} maxLength={160} rows={3} placeholder="Short description for search results (max 160 chars)"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white" />
              <p className={`text-[10px] mt-1 ${form.seo.metaDescription.length > 150 ? "text-amber-600" : "text-gray-400"}`}>{form.seo.metaDescription.length}/160</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Keywords</label>
              <input name="keywords" value={form.seo.keywords.join(", ")} onChange={handleSeoInput} placeholder="laptop, dell, i5, 12th gen (comma separated)"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Canonical URL</label>
                <input name="canonicalUrl" value={form.seo.canonicalUrl} onChange={handleSeoInput} placeholder="https://..."
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">OG Image URL</label>
                <input name="ogImage" value={form.seo.ogImage} onChange={handleSeoInput} placeholder="https://..."
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white" />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input name="noIndex" type="checkbox" checked={form.seo.noIndex} onChange={handleSeoInput} className="w-4 h-4 text-blue-600 rounded" />
              Hide from search engines (noindex)
            </label>

            {/* Google Preview */}
            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-2 flex items-center gap-1.5">
                <Eye size={12} /> Google Preview
              </p>
              <p className="text-xs text-green-700 truncate">{form.seo.canonicalUrl || `computer9.in/product/${productId || "..."}`}</p>
              <p className="text-base text-blue-700 truncate leading-tight mt-0.5">
                {form.seo.metaTitle || (form.name ? `${form.name} | Computer9` : "Product Title | Computer9")}
              </p>
              <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">
                {form.seo.metaDescription || form.description || "Product description will appear here in search results."}
              </p>
            </div>
          </div>
        </Section>

        {/* Bottom Action Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <Link href="/admin/products" className="text-sm text-gray-500 hover:text-gray-700">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors shadow-sm"
          >
            <Save size={16} />
            {saving ? "Saving..." : mode === "edit" ? "Update Product" : "Publish Product"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Section({ title, icon, isOpen, onToggle, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50/50 transition-colors"
      >
        <span className="flex items-center gap-2.5 text-sm font-bold text-gray-900">
          <span className="text-gray-400">{icon}</span>
          {title}
        </span>
        {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>
      {isOpen && (
        <div className="px-5 pb-5 border-t border-gray-100 pt-4">
          {children}
        </div>
      )}
    </div>
  );
}
