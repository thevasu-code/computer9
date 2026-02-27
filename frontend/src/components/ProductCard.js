import React from "react";

export default function ProductCard({ product }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center hover:shadow-xl transition-shadow border border-zinc-100">
      <img
        src={product.image}
        alt={product.name}
        className="w-40 h-40 object-contain mb-4 rounded"
        loading="lazy"
      />
      <h2 className="text-lg font-semibold text-zinc-900 mb-2 text-center truncate w-full" title={product.name}>
        {product.name}
      </h2>
      <p className="text-zinc-600 text-sm mb-2 text-center line-clamp-2">{product.description}</p>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl font-bold text-primary">₹{product.price}</span>
        {product.originalPrice && (
          <span className="text-zinc-400 line-through text-sm">₹{product.originalPrice}</span>
        )}
      </div>
      <button className="mt-auto w-full bg-primary text-white py-2 rounded hover:bg-primary/90 transition-colors font-medium">
        Add to Cart
      </button>
    </div>
  );
}
