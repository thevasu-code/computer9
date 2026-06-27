"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { ShoppingCart, Check, Share2, Minus, Plus, Package, Shield, Truck, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { trackProductView } from "@/components/RecentlyViewed";
import RecentlyViewed from "@/components/RecentlyViewed";

export default function ProductDetailClient({ product }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImg, setSelectedImg] = useState(0);
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [zoom, setZoom] = useState({ active: false, x: 50, y: 50 });
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

  // Track recently viewed
  useEffect(() => {
    if (product) trackProductView(product);
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Product Not Found</h2>
          <p className="text-gray-500 mb-6">This product is unavailable or has been removed.</p>
          <Link href="/shop" className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images?.filter((img) => typeof img === "string" && img.startsWith("http")) || (product.image ? [product.image] : []);
  const mainImg = images.length > 0 ? images[selectedImg] : "/logo.svg";

  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const savings = discount ? (product.originalPrice - product.price) : 0;

  const rating = product.rating || 0;
  const reviewCount = product.reviews?.length || 0;

  const specs = Array.isArray(product.specs) ? product.specs.filter((s) => s?.key && s?.value) : [];

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setZoom({ active: true, x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 });
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) { await navigator.share({ title: product.name, url }).catch(() => {}); }
    else { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  const nextImg = () => setSelectedImg((i) => (i + 1) % images.length);
  const prevImg = () => setSelectedImg((i) => (i - 1 + images.length) % images.length);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 sm:pb-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* #10 Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-4 overflow-x-auto scrollbar-hide" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-blue-600 shrink-0">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-blue-600 shrink-0">Shop</Link>
          {product.category && (
            <><span>/</span><Link href={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-blue-600 shrink-0">{product.category}</Link></>
          )}
          <span>/</span>
          <span className="text-gray-600 truncate">{product.name?.slice(0, 50)}</span>
        </nav>

        {/* Product Grid */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* #4 Image Gallery */}
            <div className="border-b lg:border-b-0 lg:border-r border-gray-100 p-4 sm:p-6">
              <div className="flex gap-3">
                {/* Thumbnails — desktop */}
                {images.length > 1 && (
                  <div className="hidden sm:flex flex-col gap-2 shrink-0">
                    {images.map((img, idx) => (
                      <button key={idx} onClick={() => setSelectedImg(idx)}
                        className={`w-14 h-14 rounded-lg border-2 overflow-hidden bg-white p-0.5 transition-all ${selectedImg === idx ? "border-blue-500" : "border-gray-200 hover:border-blue-300"}`}>
                        <img src={img} alt="" className="w-full h-full object-contain" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Main Image */}
                <div className="flex-1 relative">
                  {discount > 0 && (
                    <span className="absolute top-2 left-2 z-10 bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded shadow-sm">{discount}% OFF</span>
                  )}
                  <div
                    className="aspect-square flex items-center justify-center overflow-hidden cursor-crosshair rounded-xl bg-gray-50 relative"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => setZoom((z) => ({ ...z, active: false }))}
                  >
                    <img src={mainImg} alt={product.name}
                      className="max-h-full max-w-full object-contain select-none pointer-events-none"
                      style={{ transform: zoom.active ? "scale(2.5)" : "scale(1)", transformOrigin: `${zoom.x}% ${zoom.y}%`, transition: zoom.active ? "none" : "transform 0.2s" }} />
                  </div>
                  {/* #17 Swipeable arrows on mobile */}
                  {images.length > 1 && (
                    <div className="sm:hidden absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 pointer-events-none">
                      <button onClick={prevImg} className="pointer-events-auto w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow"><ChevronLeft size={16} /></button>
                      <button onClick={nextImg} className="pointer-events-auto w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow"><ChevronRight size={16} /></button>
                    </div>
                  )}
                  {/* Dots for mobile */}
                  {images.length > 1 && (
                    <div className="sm:hidden flex justify-center gap-1 mt-3">
                      {images.map((_, i) => (
                        <span key={i} className={`w-1.5 h-1.5 rounded-full ${i === selectedImg ? "bg-blue-600" : "bg-gray-300"}`} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="p-5 sm:p-7 flex flex-col">
              {product.brand && <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider mb-1">{product.brand}</p>}
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 leading-snug">{product.name}</h1>

              {/* Rating */}
              {rating > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-0.5 bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded">
                    {rating.toFixed(1)} <Star size={10} fill="white" />
                  </span>
                  <span className="text-xs text-gray-400">{reviewCount} Ratings</span>
                </div>
              )}

              {/* #12 Better Price Display */}
              <div className="mt-4 pb-4 border-b border-gray-100">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-bold text-gray-900">₹{product.price?.toLocaleString("en-IN")}</span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-sm text-gray-400 line-through">₹{product.originalPrice?.toLocaleString("en-IN")}</span>
                  )}
                  {discount > 0 && (
                    <span className="text-sm font-bold text-green-600">{discount}% off</span>
                  )}
                </div>
                {savings > 0 && (
                  <p className="text-xs text-green-600 font-medium mt-1">You save ₹{savings.toLocaleString("en-IN")}</p>
                )}
                <p className="text-[10px] text-gray-400 mt-1">Inclusive of all taxes</p>
              </div>

              {/* Stock */}
              <div className="mt-3 flex items-center gap-3">
                {product.stock > 0 ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> In Stock
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-700 bg-red-50 px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full" /> Out of Stock
                  </span>
                )}
                {product.stock > 0 && product.stock <= 5 && <span className="text-[10px] text-orange-600 font-medium">Hurry, only {product.stock} left!</span>}
              </div>

              {/* Quantity + Actions */}
              <div className="mt-5 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-gray-500">Qty:</span>
                  <div className="flex items-center border border-gray-200 rounded-lg">
                    <button className="px-2.5 py-1.5 text-gray-600 hover:bg-gray-50 disabled:opacity-30" onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity <= 1}><Minus size={14} /></button>
                    <span className="px-3 py-1.5 text-sm font-semibold border-x border-gray-200 min-w-[36px] text-center">{quantity}</span>
                    <button className="px-2.5 py-1.5 text-gray-600 hover:bg-gray-50 disabled:opacity-30" onClick={() => setQuantity((q) => Math.min(product.stock || 1, q + 1))} disabled={quantity >= (product.stock || 1)}><Plus size={14} /></button>
                  </div>
                </div>

                <div className="flex gap-2.5">
                  <button onClick={() => { if (!product.stock) return; addToCart(product, quantity); setAdded(true); setTimeout(() => setAdded(false), 1500); }}
                    disabled={added || !product.stock}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${added ? "bg-green-50 text-green-700 border border-green-200" : product.stock > 0 ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm active:scale-[0.98]" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}>
                    {added ? <><Check size={16} /> Added</> : product.stock > 0 ? <><ShoppingCart size={16} /> Add to Cart</> : "Out of Stock"}
                  </button>
                  <button onClick={handleShare} className="px-3.5 py-3 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-blue-600 transition-colors" title="Share">
                    <Share2 size={16} />
                  </button>
                </div>
              </div>

              {/* Trust badges */}
              <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center text-center"><Truck size={18} className="text-blue-500 mb-0.5" /><span className="text-[9px] font-medium text-gray-500">Fast Delivery</span></div>
                <div className="flex flex-col items-center text-center"><Shield size={18} className="text-green-500 mb-0.5" /><span className="text-[9px] font-medium text-gray-500">Secure Payment</span></div>
                <div className="flex flex-col items-center text-center"><Package size={18} className="text-orange-500 mb-0.5" /><span className="text-[9px] font-medium text-gray-500">7-Day Returns</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* #15 Tabbed Info Section */}
        {(product.description || specs.length > 0 || product.richDescription) && (
          <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Tab Headers */}
            <div className="flex border-b border-gray-100 overflow-x-auto scrollbar-hide">
              {product.description && (
                <button onClick={() => setActiveTab("description")}
                  className={`px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === "description" ? "border-blue-600 text-blue-700" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                  Description
                </button>
              )}
              {specs.length > 0 && (
                <button onClick={() => setActiveTab("specs")}
                  className={`px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === "specs" ? "border-blue-600 text-blue-700" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                  Specifications
                </button>
              )}
              {product.richDescription && (
                <button onClick={() => setActiveTab("details")}
                  className={`px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === "details" ? "border-blue-600 text-blue-700" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                  Details
                </button>
              )}
            </div>

            {/* Tab Content */}
            <div className="p-5 sm:p-6">
              {activeTab === "description" && product.description && (
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</p>
              )}
              {activeTab === "specs" && specs.length > 0 && (
                <div className="divide-y divide-gray-50">
                  {specs.map((spec, idx) => (
                    <div key={idx} className="flex py-2.5">
                      <span className="w-2/5 text-sm text-gray-500">{spec.key}</span>
                      <span className="w-3/5 text-sm text-gray-900 font-medium">{spec.value}</span>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === "details" && product.richDescription && (
                <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: product.richDescription }} />
              )}
            </div>
          </div>
        )}

        {/* #20 Recently Viewed */}
        <RecentlyViewed />
      </div>

      {/* #5 Sticky Mobile Buy Bar */}
      {product.stock > 0 && (
        <div className="fixed bottom-14 sm:hidden left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg px-4 py-3 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-lg font-bold text-gray-900">₹{product.price?.toLocaleString("en-IN")}</p>
            {discount > 0 && <p className="text-[10px] text-green-600 font-semibold">{discount}% off</p>}
          </div>
          <button
            onClick={() => { addToCart(product, 1); setAdded(true); setTimeout(() => setAdded(false), 1500); }}
            disabled={added}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${added ? "bg-green-500 text-white" : "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"}`}
          >
            {added ? "✓ Added" : "Add to Cart"}
          </button>
        </div>
      )}
    </div>
  );
}
