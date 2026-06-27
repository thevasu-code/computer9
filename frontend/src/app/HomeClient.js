"use client";
import React from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import BannerCarousel from "@/components/BannerCarousel";
import RecentlyViewed from "@/components/RecentlyViewed";
import NewsletterSignup from "@/components/NewsletterSignup";
import { ArrowRight, Cpu, Monitor, HardDrive, Laptop, Wifi, Headphones } from "lucide-react";

const CATEGORY_ICONS = {
  cpu: Cpu, processor: Cpu, processors: Cpu,
  laptop: Laptop, laptops: Laptop, notebook: Laptop,
  desktop: Monitor, desktops: Monitor, monitor: Monitor, monitors: Monitor,
  storage: HardDrive, ssd: HardDrive, hdd: HardDrive, "hard disk": HardDrive,
  networking: Wifi, router: Wifi, wifi: Wifi,
  headphone: Headphones, headphones: Headphones, audio: Headphones,
};

function getCategoryIcon(name) {
  if (!name) return Monitor;
  const lower = name.trim().toLowerCase();
  if (CATEGORY_ICONS[lower]) return CATEGORY_ICONS[lower];
  for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
    if (lower.includes(key) || key.includes(lower)) return icon;
  }
  return Monitor;
}

export default function HomeClient({ initialProducts, categories = [] }) {
  const PRIORITY_ORDER = ["CPU", "Graphics", "Hard Disk", "Laptop"];
  const normalize = (s) => s?.toLowerCase().replace(/[-_\s]+/g, " ") || "";

  const getPriorityIndex = (catName) => {
    const norm = normalize(catName);
    for (let i = 0; i < PRIORITY_ORDER.length; i++) {
      if (norm.includes(normalize(PRIORITY_ORDER[i])) || normalize(PRIORITY_ORDER[i]).includes(norm)) return i;
    }
    return -1;
  };

  const productCategories = categories.length > 0
    ? categories.map((c) => c.name)
    : [...new Set(initialProducts.map((p) => p.category).filter(Boolean))];

  const sortedCategories = [...productCategories].slice(0, 10).sort((a, b) => {
    const aIdx = getPriorityIndex(a);
    const bIdx = getPriorityIndex(b);
    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
    if (aIdx !== -1) return -1;
    if (bIdx !== -1) return 1;
    return a.localeCompare(b);
  });

  const categoryRows = sortedCategories
    .map((catName) => ({
      name: catName,
      category: categories.find((c) => c.name === catName),
      products: initialProducts.filter((p) => p.category === catName).slice(0, 5),
    }))
    .filter((row) => row.products.length > 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-16 sm:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-7">
        {/* #1 Banner Carousel */}
        <BannerCarousel />

        {/* Category Navigation */}
        {sortedCategories.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Shop by Category</h2>
              <Link href="/shop" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                View All <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-10 gap-2.5">
              {sortedCategories.map((catName) => {
                const catObj = categories.find((c) => c.name === catName);
                const Icon = getCategoryIcon(catName);
                return (
                  <Link
                    key={catName}
                    href={`/shop?category=${encodeURIComponent(catName)}`}
                    className="flex flex-col items-center gap-1.5 p-3 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all group"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center transition-colors overflow-hidden">
                      {catObj?.image ? (
                        <img src={catObj.image} alt={catName} className="w-full h-full object-cover rounded-full" />
                      ) : (
                        <Icon size={18} className="text-blue-600" />
                      )}
                    </div>
                    <span className="text-[10px] font-medium text-gray-600 text-center leading-tight group-hover:text-blue-700 transition-colors line-clamp-2">
                      {catName}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Category Product Rows */}
        {categoryRows.map((row) => (
          <section key={row.name}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">{row.name}</h2>
              <Link
                href={`/shop?category=${encodeURIComponent(row.name)}`}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                View All <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {row.products.map((product, i) => (
                <ProductCard key={product._id} product={product} priority={i < 2} />
              ))}
            </div>
          </section>
        ))}

        {/* Fallback */}
        {categoryRows.length === 0 && initialProducts.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-4">All Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {initialProducts.slice(0, 10).map((product, i) => (
                <ProductCard key={product._id} product={product} priority={i < 4} />
              ))}
            </div>
          </section>
        )}

        {/* #20 Recently Viewed */}
        <RecentlyViewed />

        {/* #14 Newsletter */}
        <NewsletterSignup />
      </div>
    </div>
  );
}
