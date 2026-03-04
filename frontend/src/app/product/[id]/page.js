"use client";
import React, { useEffect, useState } from "react";
import { useCart } from "../../../context/CartContext";

import { use } from "react";

export default function ProductDetail({ params }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  useEffect(() => {
    console.log("Product detail page params:", params);
    console.log("Product detail page received id:", id);
    if (!id || typeof id !== "string") {
      setLoading(false);
      setProduct(null);
      return;
    }
    fetch(`http://localhost:4000/products/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Product not found");
        return res.json();
      })
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Product fetch error:", err);
        setProduct(null);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (!id || typeof id !== "string") return <div className="text-center py-12 text-red-500">Invalid product ID.</div>;
  if (!product) return <div className="text-center py-12 text-red-500">Product not found or unavailable.</div>;

  return (
    <div className="min-h-screen font-sans bg-gradient-to-br from-orange-100 via-orange-50 to-blue-50 dark:from-orange-900 dark:via-blue-900 dark:to-black">
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="flex flex-col md:flex-row gap-10 bg-white dark:bg-zinc-900 rounded-3xl shadow-xl p-8 border border-orange-200 dark:border-orange-700">
          <div className="flex flex-col items-center justify-center w-full md:w-1/2">
            <div className="w-full h-96 flex items-center justify-center bg-gradient-to-br from-orange-200 via-orange-50 to-blue-100 dark:from-orange-900 dark:via-blue-900 dark:to-black rounded-2xl mb-4 overflow-x-auto">
              {product.images && Array.isArray(product.images) && product.images.length > 0 ? (
                <div className="flex gap-4 px-2 w-full h-full items-center">
                  {product.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={`http://localhost:4000${img}`}
                      alt={`${product.name} ${idx + 1}`}
                      className="object-contain h-80 w-80 mx-auto drop-shadow-lg rounded-xl bg-white border"
                      loading="lazy"
                    />
                  ))}
                </div>
              ) : (
                <img
                  src={product.image || "/no-image.png"}
                  alt={product.name}
                  className="object-contain h-80 w-80 mx-auto drop-shadow-lg rounded-xl bg-white border"
                  loading="lazy"
                />
              )}
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <h1 className="text-4xl font-extrabold mb-2 text-primary dark:text-orange-400">{product.name}</h1>
            <div className="mb-2 text-lg font-semibold text-orange-700 dark:text-orange-300">{product.brand}</div>
            <div className="mb-4 text-zinc-700 dark:text-zinc-200 text-base leading-relaxed">{product.description}</div>
            {product.specs && typeof product.specs === 'object' && (
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-2 text-orange-700 dark:text-orange-300">Technical Specifications</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries(product.specs).map(([key, value]) => {
                    const isObjectId = v => typeof v === 'string' && /^[a-f0-9]{24}$/.test(v);
                    const isEmpty = v => v === null || v === undefined || v === '';
                    let displayValue = null;
                    if (Array.isArray(value)) {
                      const filtered = value.filter(v => !isObjectId(v) && !isEmpty(v));
                      displayValue = filtered.length ? filtered.join(', ') : null;
                    } else if (typeof value === 'object' && value !== null) {
                      const filtered = Object.values(value).filter(v => !isObjectId(v) && !isEmpty(v));
                      displayValue = filtered.length ? filtered.join('- ') : null;
                    } else if (!isObjectId(value) && !isEmpty(value)) {
                      displayValue = String(value);
                    }
                    if (!displayValue) return null;
                    return (
                      <div key={key} className="flex items-center bg-orange-50 dark:bg-orange-900 rounded px-3 py-2">
                        <span className="text-zinc-600 dark:text-zinc-100 w-full text-center">{displayValue}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-3xl font-bold text-primary dark:text-orange-400">₹{product.price}</span>
              {product.originalPrice && (
                <span className="text-zinc-400 line-through text-xl">₹{product.originalPrice}</span>
              )}
            </div>
            <div className="mb-6">
              <label className="mr-2 font-medium text-zinc-700 dark:text-zinc-200">Quantity:</label>
              <input
                type="number"
                min={1}
                max={product.stock || 1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-20 px-2 py-1 border rounded text-lg"
                disabled={!product.stock || product.stock < 1}
              />
              <span className="ml-2 text-zinc-500 dark:text-zinc-400">(In stock: {typeof product.stock === 'number' ? product.stock : 'N/A'})</span>
              {!product.stock || product.stock < 1 ? (
                <span className="ml-2 text-red-500 font-medium">Out of stock</span>
              ) : null}
            </div>
            <button
              className="bg-gradient-to-r from-orange-500 to-primary text-white px-8 py-3 rounded-xl font-bold shadow hover:from-primary hover:to-orange-500 transition-colors text-lg"
              onClick={() => {
                addToCart(product, quantity);
                setAdded(true);
                setTimeout(() => setAdded(false), 1200);
              }}
              disabled={added}
            >
              {added ? "Added!" : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
