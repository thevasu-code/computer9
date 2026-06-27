"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "c9_recently_viewed";
const MAX_ITEMS = 10;

export function trackProductView(product) {
  if (typeof window === "undefined" || !product?._id) return;
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const filtered = stored.filter((p) => p._id !== product._id);
    const item = {
      _id: product._id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.images?.[0] || product.image || "",
    };
    filtered.unshift(item);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered.slice(0, MAX_ITEMS)));
  } catch { /* ignore */ }
}

export default function RecentlyViewed() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      setItems(stored);
    } catch { /* ignore */ }
  }, []);

  if (items.length < 2) return null;

  return (
    <section className="mt-8">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Recently Viewed</h2>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {items.map((item) => (
          <Link
            key={item._id}
            href={`/product/${item.slug || item._id}`}
            className="shrink-0 w-36 bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md hover:border-gray-200 transition-all"
          >
            <div className="aspect-square bg-white flex items-center justify-center p-3 border-b border-gray-50">
              <img
                src={item.image?.startsWith("http") ? item.image : "/logo.svg"}
                alt=""
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="p-2.5">
              <p className="text-[11px] text-gray-700 line-clamp-2 leading-tight">{item.name}</p>
              <p className="text-xs font-bold text-gray-900 mt-1">₹{item.price?.toLocaleString("en-IN")}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
