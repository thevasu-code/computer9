"use client";
import React, { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";

export default function ShopClient({ initialProducts, categories, initialCategory, initialBrand }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedBrand, setSelectedBrand] = useState(initialBrand);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState("featured");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minDiscount, setMinDiscount] = useState("");
  const [minRating, setMinRating] = useState("");

  const brands = useMemo(
    () => [...new Set(initialProducts.map((p) => p.brand).filter(Boolean))].sort(),
    [initialProducts]
  );

  const categoryNames = useMemo(
    () => categories.length > 0
      ? categories.map((c) => c.name)
      : [...new Set(initialProducts.map((p) => p.category).filter(Boolean))].sort(),
    [initialProducts, categories]
  );

  const filteredProducts = useMemo(() => {
    const searchLower = search.toLowerCase();
    const min = minPrice ? Number(minPrice) : 0;
    const max = maxPrice ? Number(maxPrice) : Infinity;
    const discountMin = minDiscount ? Number(minDiscount) : 0;
    const ratingMin = minRating ? Number(minRating) : 0;

    const list = initialProducts.filter((p) => {
      const matchesSearch = !searchLower ||
        (p.name || "").toLowerCase().includes(searchLower) ||
        (p.category || "").toLowerCase().includes(searchLower) ||
        (p.brand || "").toLowerCase().includes(searchLower);
      const matchesCategory = !selectedCategory || p.category === selectedCategory;
      const matchesBrand = !selectedBrand || p.brand === selectedBrand;
      const matchesStock = !inStockOnly || Number(p.stock || 0) > 0;
      const matchesPrice = (p.price || 0) >= min && (p.price || 0) <= max;
      const productDiscount = p.originalPrice && p.price ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;
      const matchesDiscount = productDiscount >= discountMin;
      const matchesRating = (p.rating || 0) >= ratingMin;
      return matchesSearch && matchesCategory && matchesBrand && matchesStock && matchesPrice && matchesDiscount && matchesRating;
    });

    switch (sortBy) {
      case "price_low":
        return [...list].sort((a, b) => (a.price || 0) - (b.price || 0));
      case "price_high":
        return [...list].sort((a, b) => (b.price || 0) - (a.price || 0));
      case "name_az":
        return [...list].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      case "discount":
        return [...list].sort((a, b) => {
          const aOff = a.originalPrice && a.price ? (1 - a.price / a.originalPrice) * 100 : 0;
          const bOff = b.originalPrice && b.price ? (1 - b.price / b.originalPrice) * 100 : 0;
          return bOff - aOff;
        });
      default:
        return list;
    }
  }, [initialProducts, search, selectedCategory, selectedBrand, inStockOnly, sortBy, minPrice, maxPrice, minDiscount, minRating]);

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/shop?${params.toString()}`, { scroll: false });
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    updateFilter("category", value);
  };

  const handleBrandChange = (value) => {
    setSelectedBrand(value);
    updateFilter("brand", value);
  };

  const resetFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setSelectedBrand("");
    setInStockOnly(false);
    setSortBy("featured");
    setMinPrice("");
    setMaxPrice("");
    setMinDiscount("");
    setMinRating("");
    router.push("/shop", { scroll: false });
  };

  const activeFilterCount = [selectedCategory, selectedBrand, inStockOnly, search, minPrice, maxPrice, minDiscount, minRating].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Shop All Products</h1>
          <p className="mt-1 text-sm text-gray-500">
            {filteredProducts.length} products available
          </p>
        </div>

        {/* Category Pills */}
        {categoryNames.length > 0 && (
          <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => handleCategoryChange("")}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !selectedCategory
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-gray-700 border border-gray-200 hover:border-blue-300 hover:text-blue-600"
              }`}
            >
              All
            </button>
            {categoryNames.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat === selectedCategory ? "" : cat)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white text-gray-700 border border-gray-200 hover:border-blue-300 hover:text-blue-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile filter toggle */}
            <button
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-gray-300"
            >
              <SlidersHorizontal size={16} />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
              >
                <option value="featured">Newest First</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="discount">Best Discount</option>
                <option value="name_az">Name: A → Z</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Filters — Desktop */}
          <aside className={`
            ${mobileFiltersOpen ? "fixed inset-0 z-50 bg-white p-6 overflow-y-auto" : "hidden"}
            lg:block lg:static lg:w-64 lg:shrink-0
          `}>
            {/* Mobile close button */}
            {mobileFiltersOpen && (
              <div className="flex items-center justify-between mb-6 lg:hidden">
                <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                <button onClick={() => setMobileFiltersOpen(false)} className="p-2 text-gray-500 hover:text-gray-700">
                  <X size={20} />
                </button>
              </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-5 lg:sticky lg:top-24">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Filters</h3>
                {activeFilterCount > 0 && (
                  <button onClick={resetFilters} className="text-xs text-blue-600 font-medium hover:text-blue-700">
                    Clear all
                  </button>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="">All Categories</option>
                  {categoryNames.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Brand */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Brand</label>
                <select
                  value={selectedBrand}
                  onChange={(e) => handleBrandChange(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="">All Brands</option>
                  {brands.map((brand) => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              {/* Stock filter */}
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-50 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900 font-medium">In Stock Only</span>
              </label>

              {/* Discount filter */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Discount</label>
                <select
                  value={minDiscount}
                  onChange={(e) => setMinDiscount(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="">Any Discount</option>
                  <option value="10">10% or more</option>
                  <option value="20">20% or more</option>
                  <option value="30">30% or more</option>
                  <option value="50">50% or more</option>
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Price Range</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {[
                    { label: "Under ₹1K", min: "", max: "1000" },
                    { label: "₹1K-5K", min: "1000", max: "5000" },
                    { label: "₹5K-20K", min: "5000", max: "20000" },
                    { label: "₹20K-50K", min: "20000", max: "50000" },
                    { label: "₹50K+", min: "50000", max: "" },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => { setMinPrice(preset.min); setMaxPrice(preset.max); }}
                      className={`px-2.5 py-1 text-[10px] font-medium rounded-md border transition-colors ${
                        minPrice === preset.min && maxPrice === preset.max
                          ? "bg-blue-50 border-blue-300 text-blue-700"
                          : "border-gray-200 text-gray-600 hover:border-blue-200 hover:text-blue-600"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <span className="text-gray-400 text-xs">–</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Rating filter - removed */}
            </div>
          </aside>

          {/* Product Grid */}
          <main className="flex-1 min-w-0">
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">No products found</h3>
                <p className="text-sm text-gray-500 mb-4">Try adjusting your filters or search term</p>
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map((product, index) => (
                  <ProductCard key={product._id} product={product} priority={index < 8} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
