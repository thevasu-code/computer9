"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "../context/CartContext";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-1 flex flex-col items-center border border-zinc-200 hover:shadow-2xl transition-all group relative">
      <Link href={`/product/${product._id}`} className="block w-full" tabIndex={-1}>
        <div className="flex justify-center items-center w-full h-64 mb-2 bg-gradient-to-br from-zinc-50 to-zinc-200 rounded-xl overflow-hidden relative">
          <img
            src={
              product.images && Array.isArray(product.images) && product.images.length > 0
                ? `http://localhost:4000${product.images[0]}`
                : product.image || "/no-image.png"
            }
            alt={product.name}
            className="object-contain h-65 w-65 mx-auto transition-transform duration-300 group-hover:scale-105 drop-shadow-lg"
            loading="lazy"
          />
        </div>
        <h2 className="text-lg font-bold text-zinc-900 mb-1 text-center truncate w-full" title={product.name}>
          {product.name}
        </h2>
        <p className="text-zinc-600 text-sm mb-2 text-center line-clamp-2 min-h-[38px]">{product.description}</p>
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-xl font-bold text-primary">₹{product.price}</span>
          {product.originalPrice && (
            <span className="text-zinc-400 line-through text-sm">₹{product.originalPrice}</span>
          )}
        </div>
      </Link>
      <button
        className="mt-auto w-full bg-gradient-to-r from-primary to-blue-600 text-white py-2 rounded-lg font-semibold shadow hover:from-blue-700 hover:to-primary transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          addToCart(product, 1);
          setAdded(true);
          setTimeout(() => setAdded(false), 1200);
        }}
        disabled={added}
      >
        {added ? "Added!" : "Add to Cart"}
      </button>
    </div>
  );
}
