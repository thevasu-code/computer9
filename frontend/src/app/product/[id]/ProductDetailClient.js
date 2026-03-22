"use client";
import React, { useEffect, useState, useRef } from "react";
import { useCart } from "../../../context/CartContext";

export default function ProductDetailClient({ id }) {
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState(0);
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [showViewCart, setShowViewCart] = useState(false);
  const [zoom, setZoom] = useState({ active: false, x: 50, y: 50 });
  const imgRef = useRef(null);

  useEffect(() => {
    if (!id || typeof id !== "string") {
      setLoading(false);
      return;
    }
    fetch(`/api/products/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch(() => {
        setProduct(null);
        setLoading(false);
      });
  }, [id]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setZoom({ active: true, x, y });
  };
  const handleMouseLeave = () => setZoom((z) => ({ ...z, active: false }));

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Loading product...</p>
        </div>
      </div>
    );
  if (!product)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Product Not Found</h2>
          <p className="text-gray-500">This product is unavailable or has been removed.</p>
        </div>
      </div>
    );

  const images =
    product.images && Array.isArray(product.images) && product.images.length > 0
      ? product.images.filter((img) => typeof img === "string" && img.startsWith("http"))
      : product.image
        ? [product.image]
        : [];
  const mainImg = images.length > 0 ? images[selectedImg] : "/no-image.png";

  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  const isObjectId = (v) => typeof v === "string" && /^[a-f0-9]{24}$/.test(v);
  const isEmpty = (v) => v === null || v === undefined || v === "";

  return (
    <div className="min-h-screen bg-[#f1f3f6] py-4 px-2 sm:px-4" style={{ fontFamily: "'Segoe UI',Roboto,Arial,sans-serif" }}>
      <div className="max-w-5xl mx-auto">
        <nav className="mb-3 text-xs text-gray-500 px-1">
          <span className="hover:text-blue-600 cursor-pointer" onClick={() => window.history.back()}>
            ← Back
          </span>
          <span className="mx-1">/</span>
          <span className="text-gray-700">{product.category}</span>
          <span className="mx-1">/</span>
          <span className="text-gray-900 font-medium">
            {product.name?.slice(0, 40)}
            {product.name?.length > 40 ? "…" : ""}
          </span>
        </nav>

        <div className="bg-white shadow-sm border border-gray-200 rounded-sm">
          <div className="flex flex-col lg:flex-row">
            <div className="lg:w-[44%] border-r border-gray-100 flex flex-col">
              <div className="flex flex-row flex-1">
                {images.length > 1 && (
                  <div className="flex flex-col gap-2 p-3 border-r border-gray-100 overflow-y-auto max-h-[480px]">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImg(idx)}
                        className={`flex-shrink-0 w-14 h-14 rounded border-2 transition-all bg-white ${
                          selectedImg === idx ? "border-blue-500 shadow-sm" : "border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        <img src={img} alt={`thumb-${idx}`} className="w-full h-full object-contain p-1" onError={(e) => {
                          e.target.src = "/no-image.png";
                        }} />
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex-1 flex flex-col relative p-4 pt-6">
                  {discount && (
                    <span className="absolute top-3 left-3 text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded z-10">
                      {discount}% off
                    </span>
                  )}

                  <span className="absolute bottom-3 right-3 text-xs text-gray-400 select-none hidden lg:block">🔍 Hover to zoom</span>

                  <div
                    className="w-full flex items-start justify-center overflow-hidden cursor-crosshair"
                    style={{ minHeight: 400 }}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                  >
                    <img
                      ref={imgRef}
                      src={mainImg}
                      alt={product.name}
                      className="select-none pointer-events-none"
                      style={{
                        maxHeight: 500,
                        maxWidth: "100%",
                        objectFit: "contain",
                        transform: zoom.active ? "scale(2.8)" : "scale(1)",
                        transformOrigin: `${zoom.x}% ${zoom.y}%`,
                        transition: zoom.active ? "none" : "transform 0.25s ease",
                        willChange: "transform",
                      }}
                      onError={(e) => {
                        e.target.src = "/no-image.png";
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:w-[56%] p-5 lg:p-7 flex flex-col gap-3">
              {product.brand && <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{product.brand}</p>}

              <h1 className="text-xl sm:text-2xl font-normal text-gray-800 leading-snug">{product.name}</h1>

              <div className="flex flex-col gap-1 pt-1">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-3xl font-bold text-gray-900">₹{product.price?.toLocaleString("en-IN")}</span>
                  {discount && <span className="text-base font-semibold text-green-600">{discount}% off</span>}
                </div>
                {product.originalPrice && product.originalPrice > product.price && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">M.R.P:</span>
                    <span className="text-sm text-gray-400 line-through">₹{product.originalPrice?.toLocaleString("en-IN")}</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-400 -mt-1">inclusive of all taxes</p>

              <div className="flex items-center gap-2">
                {product.stock > 0 ? (
                  <span className="text-sm text-green-600 font-medium">✓ In Stock</span>
                ) : (
                  <span className="text-sm text-red-500 font-medium">Out of Stock</span>
                )}
                {product.stock > 0 && product.stock <= 5 && (
                  <span className="text-xs text-orange-500">Only {product.stock} left!</span>
                )}
              </div>

              {product.specs && typeof product.specs === "object" && Object.keys(product.specs).length > 0 && (
                <div className="border-t border-gray-100 pt-3">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Specifications</p>
                  <div className="divide-y divide-gray-100">
                    {Object.entries(product.specs).map(([key, value]) => {
                      let displayValue = null;
                      if (Array.isArray(value)) {
                        const f = value.filter((v) => !isObjectId(v) && !isEmpty(v));
                        displayValue = f.length ? f.join(", ") : null;
                      } else if (typeof value === "object" && value !== null) {
                        const f = Object.values(value).filter((v) => !isObjectId(v) && !isEmpty(v));
                        displayValue = f.length ? f.join(" · ") : null;
                      } else if (!isObjectId(value) && !isEmpty(value)) {
                        displayValue = String(value);
                      }
                      if (!displayValue) return null;
                      const isNumericKey = /^\d+$/.test(key);
                      return (
                        <div key={key} className="flex py-2">
                          {!isNumericKey && <span className="w-2/5 text-xs text-gray-400 pr-3">{key}</span>}
                          <span className={isNumericKey ? "w-full text-xs text-gray-800" : "w-3/5 text-xs text-gray-800"}>{displayValue}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="border-t border-gray-100 pt-4 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">Quantity:</span>
                  <div className="flex items-center border border-gray-300 rounded">
                    <button
                      className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 font-bold text-base transition-colors disabled:opacity-30"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1 || !product.stock}
                    >
                      −
                    </button>
                    <span className="px-4 py-1.5 font-semibold text-gray-900 min-w-[36px] text-center text-sm border-x border-gray-300">{quantity}</span>
                    <button
                      className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 font-bold text-base transition-colors disabled:opacity-30"
                      onClick={() => setQuantity((q) => Math.min(product.stock || 1, q + 1))}
                      disabled={quantity >= (product.stock || 1) || !product.stock}
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  className={`w-full sm:w-64 py-3 rounded font-bold text-sm tracking-wide transition-all duration-150 shadow ${
                    added
                      ? "bg-green-500 text-white"
                      : product.stock > 0
                        ? "bg-[#ff9f00] hover:bg-[#f0a500] text-white active:scale-95"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                  onClick={() => {
                    if (!product.stock) return;
                    addToCart(product, quantity);
                    setAdded(true);
                    setShowViewCart(true);
                    setTimeout(() => setAdded(false), 1500);
                  }}
                  disabled={added || !product.stock}
                >
                  {added ? "✓ Added to Cart" : product.stock > 0 ? "ADD TO CART" : "OUT OF STOCK"}
                </button>

                {showViewCart && (
                  <a
                    href="/cart"
                    style={{
                      display: "inline-block",
                      marginTop: "6px",
                      width: "100%",
                      maxWidth: "256px",
                      padding: "10px 0",
                      textAlign: "center",
                      border: "1px solid #2874f0",
                      borderRadius: "4px",
                      color: "#2874f0",
                      fontWeight: 600,
                      fontSize: "14px",
                      textDecoration: "none",
                      background: "#fff",
                    }}
                  >
                    VIEW CART
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {product.description && (
          <div className="bg-white shadow-sm border border-gray-200 rounded-sm mt-3 p-5 lg:p-7">
            <h2 className="text-base font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-100">Product Description</h2>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
