"use client";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CategoryPageClient({ category, products }) {
  return (
    <div className="min-h-screen bg-gray-50 pb-16 sm:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-5">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-blue-600">Shop</Link>
          <span>/</span>
          <span className="text-gray-700 font-medium">{category.name}</span>
        </nav>

        {/* Category Hero */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 mb-6 flex items-center gap-6">
          {category.image && (
            <img
              src={category.image}
              alt={`${category.name} - Shop online at Computer9`}
              className="w-20 h-20 sm:w-24 sm:h-24 object-contain rounded-xl border border-gray-100 bg-gray-50 p-2 shrink-0"
            />
          )}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{category.name}</h1>
            {category.description && (
              <p className="mt-2 text-sm text-gray-500 max-w-xl leading-relaxed">{category.description}</p>
            )}
            <p className="mt-2 text-xs text-gray-400">{products.length} products available</p>
          </div>
        </section>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <p className="text-gray-500 mb-4">No products in this category yet.</p>
            <Link href="/shop" className="text-sm text-blue-600 font-medium hover:text-blue-700 inline-flex items-center gap-1">
              Browse All Products <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map((product, i) => (
              <ProductCard key={product._id} product={product} priority={i < 8} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
