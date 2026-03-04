

"use client";
import React, { useEffect, useState } from "react";
import MiniSearch from "minisearch";
import ProductCard from "../components/ProductCard";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [miniSearch, setMiniSearch] = useState(null);
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    fetch("http://localhost:4000/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setCategories([
          ...new Set(data.map((p) => p.category).filter(Boolean)),
        ]);
        setLoading(false);
        // Setup MiniSearch
        const ms = new MiniSearch({
          fields: ["title", "description", "category"],
          storeFields: ["_id", "title", "price", "images", "category", "description"],
        });
        ms.addAll(data);
        setMiniSearch(ms);
      });
  }, []);

  let filteredProducts = selectedCategory
    ? products.filter((p) => p.category === selectedCategory)
    : products;

  if (search && miniSearch) {
    filteredProducts = miniSearch.search(search).map(r => r);
  }

  return (
    <div className="min-h-screen font-sans bg-gradient-to-br from-orange-100 via-orange-50 to-blue-50 dark:from-orange-900 dark:via-blue-900 dark:to-black">
      <header className="w-full py-8 bg-gradient-to-r from-orange-500 via-orange-400 to-primary shadow-lg mb-8 rounded-b-3xl">
        <h1 className="text-3xl font-extrabold text-white text-center drop-shadow-lg tracking-tight">
          Computers & Hardwares Sales
        </h1>
      </header>
      <main className="max-w-7xl mx-auto py-8 px-4">
        <div className="mb-8 flex flex-wrap gap-3 justify-center">
          <button
            className={`px-4 py-2 rounded-full border font-medium transition-colors ${
              !selectedCategory
                ? "bg-primary text-white"
                : "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 border-primary"
            }`}
            onClick={() => setSelectedCategory("")}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`px-4 py-2 rounded-full border font-medium transition-colors ${
                selectedCategory === cat
                  ? "bg-primary text-white"
                  : "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 border-primary"
              }`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="text-center text-zinc-500">Loading products...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
