"use client";
import React, { useState } from "react";
import Link from "next/link";
import { ShoppingCart, Check, Star } from "lucide-react";
import { useCart } from "@/context/CartContext";

function optimizeCloudinary(url, width = 400) {
  if (!url || !url.includes("res.cloudinary.com")) return url;
  return url.replace("/upload/", `/upload/c_fit,w_${width},f_auto,q_auto/`);
}

export default function ProductCard({ product, priority = false }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const imgSrc = product.images?.[0]?.startsWith("http")
    ? optimizeCloudinary(product.images[0])
    : product.image || "/logo.svg";

  const discount =
    product.originalPrice && product.price
      ? Math.round((1 - product.price / product.originalPrice) * 100)
      : null;

  const rating = product.rating || 0;
  const reviewCount = product.reviews?.length || 0;
  const isNew = product.createdAt && (Date.now() - new Date(product.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    e.preventDefault();
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="group relative bg-white rounded-xl border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-gray-200 hover:-translate-y-0.5 flex flex-col">
      {/* Badges */}
      <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
        {discount > 0 && (
          <span className="bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
            {discount}% OFF
          </span>
        )}
        {isNew && !discount && (
          <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
            NEW
          </span>
        )}
      </div>

      {/* Image */}
      <Link href={`/product/${product.slug || product._id}`} className="block">
        <div className="relative aspect-square bg-white flex items-center justify-center p-5 overflow-hidden border-b border-gray-50">
          <img
            src={imgSrc}
            alt={`Buy ${product.name} online at best price - Computer9`}
            className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            decoding={priority ? "sync" : "async"}
          />
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3.5">
        {/* Category */}
        {product.category && (
          <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider mb-1">
            {product.category}
          </span>
        )}

        {/* Title */}
        <Link href={`/product/${product.slug || product._id}`} className="block mb-1">
          <h3 className="text-sm font-medium text-gray-800 leading-snug line-clamp-2 group-hover:text-blue-700 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-2">
          {rating > 0 ? (
            <>
              <span className="inline-flex items-center gap-0.5 bg-green-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                {rating.toFixed(1)} <Star size={9} fill="white" />
              </span>
              <span className="text-[10px] text-gray-400">({reviewCount})</span>
            </>
          ) : (
            <span className="text-[10px] text-gray-300">No ratings yet</span>
          )}
        </div>

        {/* Price */}
        <div className="mt-auto flex items-baseline gap-2 flex-wrap">
          <span className="text-lg font-bold text-gray-900">
            ₹{product.price?.toLocaleString("en-IN")}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-[11px] text-gray-400 line-through">
              ₹{product.originalPrice?.toLocaleString("en-IN")}
            </span>
          )}
        </div>
        {discount > 0 && (
          <p className="text-[10px] text-green-600 font-semibold mt-0.5">
            You save ₹{((product.originalPrice - product.price)).toLocaleString("en-IN")}
          </p>
        )}

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          disabled={added}
          className={`mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all duration-200 ${
            added
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98] shadow-sm"
          }`}
        >
          {added ? <><Check size={14} /> Added</> : <><ShoppingCart size={14} /> Add to Cart</>}
        </button>
      </div>
    </div>
  );
}
