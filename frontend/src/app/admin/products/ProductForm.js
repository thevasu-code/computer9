"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

const ImageUpload = dynamic(() => import("./ImageUpload"), { ssr: false });

const getInitialProductForm = () => ({
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

const isValidHttpUrl = (value) => {
  if (!value) return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

function SeoPreviewCard({ seo, fallbackTitle, fallbackDescription, fallbackPath }) {
  const title = seo?.metaTitle?.trim() || fallbackTitle;
  const description = seo?.metaDescription?.trim() || fallbackDescription;
  const displayUrl = seo?.canonicalUrl?.trim() || fallbackPath;

  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
      <p className="text-xs font-semibold text-zinc-600 mb-1">Google Preview</p>
      <p className="text-[12px] text-green-700 truncate">{displayUrl}</p>
      <p className="text-[18px] leading-tight text-blue-700 truncate">{title || "Untitled product"}</p>
      <p className="text-[13px] text-zinc-700 leading-snug line-clamp-2">{description || "No description provided."}</p>
    </div>
  );
}

export default function ProductForm({ mode = "create", productId }) {
  const router = useRouter();
  const [form, setForm] = useState(getInitialProductForm);
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (mode !== "edit" || !productId) return;

    fetch(`/api/products/${productId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load product");
        return res.json();
      })
      .then((product) => {
        setForm({
          name: product.name || "",
          price: product.price || "",
          category: product.category || "",
          brand: product.brand || "",
          stock: product.stock || "",
          description: product.description || "",
          image: product.image || "",
          tags: product.tags || [],
          discount: product.discount || 0,
          specs: product.specs?.length ? product.specs : [{ key: "", value: "" }],
          images: product.images || [],
          richDescription: product.richDescription || "",
          seo: {
            metaTitle: product.seo?.metaTitle || "",
            metaDescription: product.seo?.metaDescription || "",
            keywords: product.seo?.keywords || [],
            ogImage: product.seo?.ogImage || "",
            canonicalUrl: product.seo?.canonicalUrl || "",
            noIndex: Boolean(product.seo?.noIndex),
          },
        });
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [mode, productId]);

  const getAuthHeaders = (includeJson = false) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
    if (!token) throw new Error("Admin token missing. Please login again.");
    return {
      ...(includeJson ? { "Content-Type": "application/json" } : {}),
      Authorization: `Bearer ${token}`,
    };
  };

  const handleInput = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSeoInput = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "keywords") {
      setForm({
        ...form,
        seo: {
          ...form.seo,
          keywords: value.split(",").map((keyword) => keyword.trim()).filter(Boolean),
        },
      });
      return;
    }
    setForm({
      ...form,
      seo: { ...form.seo, [name]: type === "checkbox" ? checked : value },
    });
  };

  const handleImageUpload = (urls) => {
    setForm({ ...form, images: [...form.images, ...urls] });
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = { ...form };
      const endpoint = mode === "edit" ? `/api/products/${productId}` : "/api/products";
      const method = mode === "edit" ? "PUT" : "POST";
      const res = await fetch(endpoint, {
        method,
        headers: getAuthHeaders(true),
        body: JSON.stringify(payload),
      });
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

  const metaTitleLen = form.seo.metaTitle.length;
  const metaDescriptionLen = form.seo.metaDescription.length;
  const canonicalInvalid = !isValidHttpUrl(form.seo.canonicalUrl);
  const ogImageInvalid = !isValidHttpUrl(form.seo.ogImage);

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{mode === "edit" ? "Edit Product" : "Add Product"}</h1>
        <Link href="/admin/products" className="text-primary hover:underline">Back to Products</Link>
      </div>

      <form className="bg-white rounded shadow p-6 space-y-4" onSubmit={submitForm}>
        <textarea
          name="name"
          value={form.name}
          onChange={handleInput}
          placeholder="Product Title"
          className="w-full border rounded px-3 py-2 min-h-[84px] resize-y"
          rows={3}
          required
        />
        <input name="price" value={form.price} onChange={handleInput} placeholder="Price" type="number" className="w-full border rounded px-3 py-2" required />
        <input name="category" value={form.category} onChange={handleInput} placeholder="Category" className="w-full border rounded px-3 py-2" />
        <input name="brand" value={form.brand} onChange={handleInput} placeholder="Brand" className="w-full border rounded px-3 py-2" />
        <input name="stock" value={form.stock} onChange={handleInput} placeholder="Stock" type="number" className="w-full border rounded px-3 py-2" />
        <ImageUpload onUpload={handleImageUpload} />
        {form.images.length > 0 && (
          <div className="flex gap-2 flex-wrap justify-center">
            {form.images.map((img, idx) => (
              <Image key={idx} src={img.startsWith("http") ? img : "/no-image.png"} alt={`Product ${idx + 1}`} width={96} height={96} className="object-contain rounded border" unoptimized />
            ))}
          </div>
        )}
        <input name="image" value={form.image} onChange={handleInput} placeholder="Main Image URL (optional)" className="w-full border rounded px-3 py-2" />
        <textarea
          name="description"
          value={form.description}
          onChange={handleInput}
          placeholder="Description"
          className="w-full border rounded px-3 py-2 min-h-[180px] resize-y"
          rows={8}
        />
        <input name="discount" value={form.discount} onChange={handleInput} placeholder="Discount (%)" type="number" className="w-full border rounded px-3 py-2" />
        <input name="tags" value={form.tags.join(", ")} onChange={(e) => setForm({ ...form, tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })} placeholder="Tags (comma separated)" className="w-full border rounded px-3 py-2" />
        <textarea
          name="richDescription"
          value={form.richDescription}
          onChange={handleInput}
          placeholder="Rich Description (HTML allowed)"
          className="w-full border rounded px-3 py-2 min-h-[220px] resize-y"
          rows={10}
        />

        <div className="border rounded p-3 space-y-2">
          <p className="text-sm font-semibold">Google SEO</p>
          <textarea
            name="metaTitle"
            value={form.seo.metaTitle}
            onChange={handleSeoInput}
            placeholder="Meta Title (max 70 chars)"
            className="w-full border rounded px-3 py-2 min-h-[72px] resize-y"
            rows={2}
            maxLength={70}
          />
          <p className={`text-xs ${metaTitleLen > 60 ? "text-amber-600" : "text-zinc-400"}`}>{metaTitleLen}/70 characters</p>
          <textarea
            name="metaDescription"
            value={form.seo.metaDescription}
            onChange={handleSeoInput}
            placeholder="Meta Description (max 160 chars)"
            className="w-full border rounded px-3 py-2 min-h-[110px] resize-y"
            rows={4}
            maxLength={160}
          />
          <p className={`text-xs ${metaDescriptionLen > 150 ? "text-amber-600" : "text-zinc-400"}`}>{metaDescriptionLen}/160 characters</p>
          <input name="keywords" value={form.seo.keywords.join(", ")} onChange={handleSeoInput} placeholder="SEO Keywords (comma separated)" className="w-full border rounded px-3 py-2" />
          <input name="ogImage" value={form.seo.ogImage} onChange={handleSeoInput} placeholder="Social Share Image URL (optional)" className="w-full border rounded px-3 py-2" />
          {ogImageInvalid && <p className="text-xs text-red-600">Enter a valid http/https image URL.</p>}
          <input name="canonicalUrl" value={form.seo.canonicalUrl} onChange={handleSeoInput} placeholder="Canonical URL (optional)" className="w-full border rounded px-3 py-2" />
          {canonicalInvalid && <p className="text-xs text-red-600">Enter a valid http/https canonical URL.</p>}
          <label className="flex items-center gap-2 text-sm">
            <input name="noIndex" type="checkbox" checked={form.seo.noIndex} onChange={handleSeoInput} />
            Hide this product from Google indexing (noindex)
          </label>
          <SeoPreviewCard
            seo={form.seo}
            fallbackTitle={form.name ? `${form.name} | Computer9` : "Product | Computer9"}
            fallbackDescription={form.description || "Explore product details, pricing, and availability on Computer9."}
            fallbackPath={mode === "edit" ? `https://your-domain.com/product/${productId}` : "https://your-domain.com/product/new"}
          />
        </div>

        <div>
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
                  <td className="p-2">
                    <input
                      value={spec.key}
                      onChange={(e) => {
                        const specs = [...form.specs];
                        specs[idx].key = e.target.value;
                        setForm({ ...form, specs });
                      }}
                      className="border rounded px-2 w-full"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      value={spec.value}
                      onChange={(e) => {
                        const specs = [...form.specs];
                        specs[idx].value = e.target.value;
                        setForm({ ...form, specs });
                      }}
                      className="border rounded px-2 w-full"
                    />
                  </td>
                  <td className="p-2">
                    <button
                      type="button"
                      className="text-red-500"
                      onClick={() => setForm({ ...form, specs: form.specs.filter((_, i) => i !== idx) })}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            type="button"
            className="bg-primary text-white px-2 py-1 rounded"
            onClick={() => setForm({ ...form, specs: [...form.specs, { key: "", value: "" }] })}
          >
            Add Spec
          </button>
        </div>

        {error && <div className="text-red-500">{error}</div>}
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-primary text-white py-3 rounded font-medium text-lg hover:bg-primary/90 transition-colors disabled:opacity-60"
        >
          {saving ? "Saving..." : mode === "edit" ? "Update Product" : "Add Product"}
        </button>
      </form>
    </div>
  );
}
