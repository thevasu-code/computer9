"use client";
import React, { useEffect, useMemo, useState } from "react";
import ProductCard from "../../components/ProductCard";

function getSpecText(specs) {
  if (!Array.isArray(specs)) return "";
  return specs
    .map((s) => `${s?.key || ""} ${s?.value || ""}`.trim())
    .join(" ")
    .toLowerCase();
}

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [specQuery, setSpecQuery] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState("featured");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100000);
  const [priceInit, setPriceInit] = useState(false);

  useEffect(() => {
    fetch("/api/products", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setProducts(list);
        if (list.length > 0) {
          const allPrices = list.map((p) => Number(p.price) || 0);
          const min = Math.min(...allPrices);
          const max = Math.max(...allPrices);
          setMinPrice(min);
          setMaxPrice(max);
          setPriceInit(true);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category).filter(Boolean))].sort(),
    [products]
  );

  const brands = useMemo(
    () => [...new Set(products.map((p) => p.brand).filter(Boolean))].sort(),
    [products]
  );

  const absolutePriceRange = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 100000 };
    const allPrices = products.map((p) => Number(p.price) || 0);
    return {
      min: Math.min(...allPrices),
      max: Math.max(...allPrices),
    };
  }, [products]);

  const filteredProducts = useMemo(() => {
    const searchLower = search.toLowerCase();
    const specLower = specQuery.toLowerCase();

    const list = products.filter((p) => {
      const nameMatch = (p.name || "").toLowerCase().includes(searchLower);
      const categoryMatch = (p.category || "").toLowerCase().includes(searchLower);
      const brandMatch = (p.brand || "").toLowerCase().includes(searchLower);

      const matchesSearch =
        !searchLower || nameMatch || categoryMatch || brandMatch;

      const matchesCategory = !selectedCategory || p.category === selectedCategory;
      const matchesBrand = !selectedBrand || p.brand === selectedBrand;

      const price = Number(p.price) || 0;
      const matchesPrice = price >= minPrice && price <= maxPrice;

      const matchesStock = !inStockOnly || Number(p.stock || 0) > 0;

      const specText = getSpecText(p.specs);
      const matchesSpec = !specLower || specText.includes(specLower);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesBrand &&
        matchesPrice &&
        matchesStock &&
        matchesSpec
      );
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
        return [...list].sort(
          (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
    }
  }, [
    products,
    search,
    selectedCategory,
    selectedBrand,
    minPrice,
    maxPrice,
    inStockOnly,
    specQuery,
    sortBy,
  ]);

  const resetFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setSelectedBrand("");
    setSpecQuery("");
    setInStockOnly(false);
    setSortBy("featured");
    setMinPrice(absolutePriceRange.min);
    setMaxPrice(absolutePriceRange.max);
  };

  return (
    <div style={{ background: "#eef3f9", minHeight: "100vh" }}>
      <style>{`
        .shop-wrap {
          max-width: 1300px;
          margin: 0 auto;
          padding: 18px 16px 24px;
        }
        .shop-hero {
          border-radius: 16px;
          background: linear-gradient(120deg, #0d62ea 0%, #1c8ef4 58%, #1dbb6d 100%);
          color: #fff;
          padding: 22px 24px;
          box-shadow: 0 14px 30px rgba(13, 98, 234, 0.24);
          margin-bottom: 14px;
        }
        .shop-layout {
          display: grid;
          grid-template-columns: 290px 1fr;
          gap: 14px;
        }
        .shop-sidebar {
          background: #fff;
          border-radius: 14px;
          border: 1px solid #e6edf8;
          padding: 14px;
          height: fit-content;
          position: sticky;
          top: 90px;
          box-shadow: 0 4px 16px rgba(14, 43, 89, 0.08);
        }
        .shop-main {
          background: #fff;
          border-radius: 14px;
          border: 1px solid #e6edf8;
          box-shadow: 0 4px 16px rgba(14, 43, 89, 0.08);
          overflow: hidden;
        }
        .shop-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 12px;
          padding: 12px;
        }
        .shop-field {
          width: 100%;
          border: 1px solid #d9e5f7;
          border-radius: 10px;
          padding: 9px 10px;
          font-size: 13px;
          background: #fff;
          outline: none;
        }
        .shop-field:focus {
          border-color: #4d92ff;
          box-shadow: 0 0 0 3px rgba(77, 146, 255, 0.16);
        }
        .shop-label {
          font-size: 12px;
          font-weight: 700;
          color: #234573;
          margin-bottom: 6px;
          display: block;
          letter-spacing: 0.2px;
        }
        .shop-filter-block {
          margin-bottom: 12px;
        }
        @media (max-width: 1024px) {
          .shop-layout {
            grid-template-columns: 1fr;
          }
          .shop-sidebar {
            position: static;
          }
        }
        @media (max-width: 620px) {
          .shop-wrap {
            padding: 10px 10px 20px;
          }
          .shop-hero {
            padding: 16px;
          }
          .shop-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 8px;
            padding: 8px;
          }
        }
      `}</style>

      <div className="shop-wrap">
        <section className="shop-hero">
          <div style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "1px", opacity: 0.9 }}>
            DISCOVER AND COMPARE
          </div>
          <h1 style={{ fontSize: "30px", fontWeight: 800, marginTop: "6px", lineHeight: 1.2 }}>
            Shop All Products
          </h1>
          <p style={{ marginTop: "6px", fontSize: "14px", opacity: 0.92, maxWidth: "660px" }}>
            Filter by price, type, brand, specifications, and stock status to find your exact match quickly.
          </p>
        </section>

        <div className="shop-layout">
          <aside className="shop-sidebar">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h2 style={{ fontSize: "17px", fontWeight: 800, color: "#16345f" }}>Filters</h2>
              <button
                type="button"
                onClick={resetFilters}
                style={{ border: "none", background: "#edf4ff", color: "#1f5fbf", borderRadius: "8px", padding: "6px 10px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
              >
                Reset
              </button>
            </div>

            <div className="shop-filter-block">
              <label className="shop-label">Search</label>
              <input
                className="shop-field"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name, type, brand"
              />
            </div>

            <div className="shop-filter-block">
              <label className="shop-label">Category / Type</label>
              <select
                className="shop-field"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="shop-filter-block">
              <label className="shop-label">Brand</label>
              <select
                className="shop-field"
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
              >
                <option value="">All Brands</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            <div className="shop-filter-block">
              <label className="shop-label">Specifications</label>
              <input
                className="shop-field"
                value={specQuery}
                onChange={(e) => setSpecQuery(e.target.value)}
                placeholder="e.g. i7, 16GB, 1TB"
              />
            </div>

            <div className="shop-filter-block">
              <label className="shop-label">Price Range</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <input
                  className="shop-field"
                  type="number"
                  min={absolutePriceRange.min}
                  max={maxPrice}
                  value={minPrice}
                  onChange={(e) => setMinPrice(Number(e.target.value) || 0)}
                />
                <input
                  className="shop-field"
                  type="number"
                  min={minPrice}
                  max={absolutePriceRange.max}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value) || 0)}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px", fontSize: "11px", color: "#6f7e95" }}>
                <span>Min: Rs {absolutePriceRange.min.toLocaleString("en-IN")}</span>
                <span>Max: Rs {absolutePriceRange.max.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#2e4f7f", fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
              />
              In Stock Only
            </label>
          </aside>

          <main className="shop-main">
            <div style={{ borderBottom: "1px solid #ebf1fa", padding: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <div style={{ fontSize: "14px", color: "#25466f", fontWeight: 700 }}>
                {loading ? "Loading products..." : `${filteredProducts.length} Products Found`}
              </div>
              <select
                className="shop-field"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ width: "220px" }}
              >
                <option value="featured">Newest First</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="discount">Best Discount</option>
                <option value="name_az">Name: A to Z</option>
              </select>
            </div>

            {loading ? (
              <div style={{ padding: "44px", textAlign: "center", color: "#6b7b90" }}>Loading shop...</div>
            ) : filteredProducts.length === 0 ? (
              <div style={{ padding: "44px", textAlign: "center", color: "#6b7b90" }}>
                No products match your filters.
              </div>
            ) : (
              <div className="shop-grid">
                {filteredProducts.map((product, index) => (
                  <ProductCard key={product._id} product={product} priority={index < 6} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
