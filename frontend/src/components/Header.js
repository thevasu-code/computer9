
"use client";
import React, { useEffect, useState } from "react";
import { ShoppingCart, User, Search } from "lucide-react";
import MiniSearch from "minisearch";
import Link from "next/link";
import { useCart } from "../context/CartContext";

export default function Header() {
  const { cart } = useCart();
  const [cartCount, setCartCount] = useState(0);
  const [userName, setUserName] = useState("");
  const [mounted, setMounted] = useState(false);

  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [miniSearch, setMiniSearch] = useState(null);
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    setMounted(true);
    setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      // Decode JWT payload
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload && payload.id) {
        fetch(`/api/users/${payload.id}`)
          .then(res => res.json())
          .then(data => {
            if (data && data.name) setUserName(data.name);
          });
      }
    }
    // Fetch products for MiniSearch
    fetch("/api/products")
      .then(res => res.json())
      .then(data => {
        console.log("Fetched products:", data);
        setProducts(data);
        const ms = new MiniSearch({
          fields: ["name", "description", "category"],
          storeFields: ["_id", "name", "price", "images", "category", "description"],
          idField: "_id",
          searchOptions: {
            prefix: true,
            fuzzy: 0.3,
            combineWith: "AND"
          }
        });
        ms.addAll(data);
        setMiniSearch(ms);
      });
  }, [cart]);

  useEffect(() => {
    if (miniSearch && search.length >= 3) {
      let results = miniSearch.search(search);
      // Manual substring filter for 3-letter queries
      if (search.length === 3) {
        const lowerSearch = search.toLowerCase();
        results = products.filter(
          p =>
            (p.name && p.name.toLowerCase().includes(lowerSearch)) ||
            (p.description && p.description.toLowerCase().includes(lowerSearch)) ||
            (p.category && p.category.toLowerCase().includes(lowerSearch))
        );
      }
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [search, miniSearch, products]);
  return (
    <header className="w-full bg-white dark:bg-zinc-900 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 gap-4">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2">
           <img src="/logo.svg" alt="Logo" className="w-12 h-10 ml-2 drop-shadow-lg border-2 border-gray-200 rounded-lg bg-white" />
          <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-blue-500 to-orange-400 tracking-tight drop-shadow-lg">Computer9</span>
         
        </a>
        {/* Search Bar with MiniSearch Dropdown */}
        <div className="flex-1 max-w-xl mx-6 flex relative">
          <div className="relative w-full">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search for products, brands and more..."
              className="w-full rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-5 py-2 pl-12 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary"
              autoComplete="off"
            />
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-zinc-400" />
            {search.length >= 3 && (
              <div className="absolute left-0 right-0 top-12 z-50 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {searchResults.length > 0 ? (
                  searchResults.slice(0, 6).map(product => (
                    <Link key={product._id} href={`/product/${product._id}`} className="block px-4 py-2 hover:bg-primary/10">
                      <div className="flex items-center gap-2 justify-between">
                        <img
                          src={product.images?.[0]?.startsWith('http') ? product.images[0] : "/no-image.png"}
                          alt={product.name}
                          className="w-7 h-7 object-cover rounded border"
                        />
                        <span className="font-semibold text-zinc-900 dark:text-zinc-50 truncate flex-1">{product.name}</span>
                        <span className="text-xs text-primary font-bold ml-2">₹{product.price}</span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="px-4 py-2 text-zinc-500">No products found.</div>
                )}
              </div>
            )}
          </div>
        </div>
        {/* Account & Cart */}
        <div className="flex items-center gap-4">
          {mounted && userName ? (
            <a
              href="/dashboard"
              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Go to Dashboard"
            >
              {userName}
            </a>
          ) : (
            <a href="/account" className="flex items-center gap-1 text-zinc-700 dark:text-zinc-200 hover:text-primary">
              <User className="w-6 h-6" />
              <span className="hidden sm:inline font-medium">Account</span>
            </a>
          )}
          <a href="/cart" className="relative flex items-center gap-1 text-zinc-700 dark:text-zinc-200 hover:text-primary">
            <ShoppingCart className="w-6 h-6" />
            <span className="hidden sm:inline font-medium">Cart</span>
            {mounted && (
              <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full px-1.5 py-0.5 font-bold">{cartCount}</span>
            )}
          </a>
          <div className="hidden md:flex items-center gap-2">
            <a href="/admin/login" className="text-red-600 hover:text-red-800 font-medium">Admin</a>
          </div>
        </div>
      </div>
    </header>
  );
}
