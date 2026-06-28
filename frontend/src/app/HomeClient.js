"use client";
import React, { useRef } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import BannerCarousel from "@/components/BannerCarousel";
import RecentlyViewed from "@/components/RecentlyViewed";
import NewsletterSignup from "@/components/NewsletterSignup";
import { ArrowRight, ChevronLeft, ChevronRight, Cpu, Monitor, HardDrive, Laptop, Wifi, Headphones, Truck, Shield, RotateCcw, CreditCard, Headset, Award, Zap, BadgeCheck } from "lucide-react";

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
  const PRIORITY_ORDER = ["Hard Disk", "CPU", "Graphics", "Laptop"];
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

  // Count products per category
  const catCounts = {};
  initialProducts.forEach((p) => { if (p.category) catCounts[p.category] = (catCounts[p.category] || 0) + 1; });

  const sortedCategories = [...productCategories].slice(0, 8).sort((a, b) => {
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
      products: initialProducts.filter((p) => p.category === catName).slice(0, 6),
    }))
    .filter((row) => row.products.length > 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-16 sm:pb-0 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">
        {/* Compact Banner */}
        <BannerCarousel />

        {/* #8 Trust Bar */}
        <div className="flex items-center justify-center gap-4 sm:gap-8 flex-wrap py-2">
          <TrustBadge icon={Truck} label="Free Shipping" />
          <TrustBadge icon={Shield} label="Secure Payment" />
          <TrustBadge icon={RotateCcw} label="7-Day Returns" />
          <TrustBadge icon={CreditCard} label="COD Available" />
        </div>

        {/* #3 Category Strip with count */}
        {sortedCategories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {sortedCategories.map((catName) => {
              const catObj = categories.find((c) => c.name === catName);
              const Icon = getCategoryIcon(catName);
              const count = catCounts[catName] || 0;
              return (
                <Link
                  key={catName}
                  href={`/shop?category=${encodeURIComponent(catName)}`}
                  className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-white rounded-lg border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all group"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center transition-colors overflow-hidden">
                    {catObj?.image ? (
                      <img src={catObj.image} alt={catName} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <Icon size={14} className="text-blue-600" />
                    )}
                  </div>
                  <span className="text-xs font-medium text-gray-700 group-hover:text-blue-700 whitespace-nowrap">
                    {catName}
                  </span>
                  {count > 0 && (
                    <span className="text-[9px] text-gray-400 font-medium">({count})</span>
                  )}
                </Link>
              );
            })}
            <Link href="/shop" className="shrink-0 flex items-center gap-1 px-4 py-2.5 text-xs font-medium text-blue-600 hover:text-blue-700">
              All <ArrowRight size={12} />
            </Link>
          </div>
        )}

        {/* #5 First row — Featured (larger 4-col grid) */}
        {categoryRows.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-gray-900">{categoryRows[0].name}</h2>
              <Link href={`/shop?category=${encodeURIComponent(categoryRows[0].name)}`}
                className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                View All <ArrowRight size={12} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {categoryRows[0].products.slice(0, 4).map((product, i) => (
                <ProductCard key={product._id} product={product} priority={i < 2} />
              ))}
            </div>
          </section>
        )}

        {/* #7 Remaining rows — alternating backgrounds, horizontal scroll on mobile */}
        {categoryRows.slice(1).map((row, rowIdx) => (
          <section key={row.name} className={`${rowIdx % 2 === 0 ? "bg-white" : "bg-gray-100/50"} rounded-xl p-4 sm:p-5`}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-gray-900">{row.name}</h2>
              <Link href={`/shop?category=${encodeURIComponent(row.name)}`}
                className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                View All <ArrowRight size={12} />
              </Link>
            </div>
            {/* #6 Horizontal scroll on mobile, grid on desktop */}
            <ScrollableProductRow products={row.products} />
          </section>
        ))}

        {/* Fallback */}
        {categoryRows.length === 0 && initialProducts.length > 0 && (
          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">All Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {initialProducts.slice(0, 12).map((product, i) => (
                <ProductCard key={product._id} product={product} priority={i < 4} />
              ))}
            </div>
          </section>
        )}

        {/* #9 Brand Logos */}
        <section className="py-4">
          <p className="text-center text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-4">Trusted Brands</p>
          <div className="flex items-center justify-center gap-6 sm:gap-10 flex-wrap opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300">
            {["Dell", "HP", "ASUS", "Lenovo", "AMD", "Intel", "Samsung", "LG"].map((brand) => (
              <Link key={brand} href={`/shop?brand=${encodeURIComponent(brand)}`} className="text-sm sm:text-base font-bold text-gray-500 hover:text-gray-800 transition-colors">
                {brand}
              </Link>
            ))}
          </div>
        </section>

        {/* #10 Why Computer9 */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <WhyCard icon={Truck} title="Fast Delivery" desc="Across India" />
          <WhyCard icon={BadgeCheck} title="Genuine Products" desc="100% authentic" />
          <WhyCard icon={Headset} title="Expert Support" desc="Help when you need" />
          <WhyCard icon={Zap} title="Best Prices" desc="Price match guarantee" />
        </section>

        {/* Recently Viewed */}
        <RecentlyViewed />

        {/* Newsletter */}
        <NewsletterSignup />
      </div>
    </div>
  );
}

/* #6 Scrollable product row — horizontal on mobile, grid on desktop */
function ScrollableProductRow({ products }) {
  const scrollRef = useRef(null);
  const scroll = (dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir * 260, behavior: "smooth" });
  };

  return (
    <div className="relative">
      {/* Desktop grid */}
      <div className="hidden sm:grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {products.map((product, i) => (
          <ProductCard key={product._id} product={product} priority={i < 2} />
        ))}
        {/* #2 View All Card */}
        <Link href={`/shop?category=${encodeURIComponent(products[0]?.category || "")}`}
          className="bg-gray-50 rounded-xl border border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 min-h-[200px] hover:border-blue-300 hover:bg-blue-50/50 transition-all group">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
            <ArrowRight size={18} className="text-blue-600" />
          </div>
          <span className="text-xs font-semibold text-blue-600">View All</span>
        </Link>
      </div>

      {/* Mobile horizontal scroll */}
      <div className="sm:hidden relative">
        <div ref={scrollRef} className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory">
          {products.map((product, i) => (
            <div key={product._id} className="shrink-0 w-[160px] snap-start">
              <ProductCard product={product} priority={i < 2} />
            </div>
          ))}
          {/* View All card mobile */}
          <Link href={`/shop?category=${encodeURIComponent(products[0]?.category || "")}`}
            className="shrink-0 w-[120px] snap-start bg-gray-50 rounded-xl border border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 min-h-[200px]">
            <ArrowRight size={16} className="text-blue-600" />
            <span className="text-[10px] font-semibold text-blue-600">View All</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function TrustBadge({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon size={14} className="text-green-600" />
      <span className="text-[11px] font-medium text-gray-600">{label}</span>
    </div>
  );
}

function WhyCard({ icon: Icon, title, desc }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col items-center text-center hover:shadow-sm transition-shadow">
      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-2">
        <Icon size={18} className="text-blue-600" />
      </div>
      <p className="text-xs font-bold text-gray-800">{title}</p>
      <p className="text-[10px] text-gray-400 mt-0.5">{desc}</p>
    </div>
  );
}
