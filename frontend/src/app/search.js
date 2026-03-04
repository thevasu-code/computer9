"use client";
import React, { useEffect, useState } from "react";
import MiniSearch from "minisearch";
import ProductCard from "../components/ProductCard";
import { useSearchParams } from "next/navigation";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [products, setProducts] = useState([]);
  const [miniSearch, setMiniSearch] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:4000/products")
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        const ms = new MiniSearch({
          fields: ["title", "description", "category"],
          storeFields: ["_id", "title", "price", "images", "category", "description"],
        });
        ms.addAll(data);
        setMiniSearch(ms);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (miniSearch && query) {
      setResults(miniSearch.search(query));
    } else if (miniSearch) {
      setResults(products);
    }
  }, [miniSearch, query, products]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans py-12">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-8 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-zinc-900 dark:text-zinc-50 text-center">Search Results</h1>
        <p className="text-zinc-700 dark:text-zinc-200 text-center mb-6">{query ? `Results for "${query}"` : "Showing all products."}</p>
        {loading ? (
          <div className="text-center text-zinc-500">Loading...</div>
        ) : results.length === 0 ? (
          <div className="text-center text-red-500">No products found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {results.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
}
