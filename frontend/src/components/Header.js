"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { ShoppingCart, Search, X, Menu, Home, LogIn, User, LogOut, LayoutDashboard, Store, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

export default function Header() {
  const router = useRouter();
  const { cart } = useCart();
  const [cartCount, setCartCount] = useState(0);
  const [userName, setUserName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef(null);
  const [searchResults, setSearchResults] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchRef = useRef(null);

  const fetchUserName = useCallback(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        // Check token expiry
        if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
          localStorage.removeItem("token");
          setUserName("");
          setIsAdmin(false);
          return;
        }
        setIsAdmin(Boolean(payload?.isAdmin || payload?.role === "admin"));
        if (payload && payload.id) {
          fetch(`/api/users/${payload.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then((res) => res.json())
            .then((data) => { if (data && data.name) setUserName(data.name); })
            .catch(() => {});
        }
      } catch {
        localStorage.removeItem("token");
        setUserName("");
        setIsAdmin(false);
      }
    } else {
      setUserName("");
      setIsAdmin(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchUserName();
    fetch("/api/products?limit=100")
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.items || [];
        setProducts(list);
      })
      .catch(() => {});

    window.addEventListener("userLogin", fetchUserName);
    window.addEventListener("storage", fetchUserName);
    return () => {
      window.removeEventListener("userLogin", fetchUserName);
      window.removeEventListener("storage", fetchUserName);
    };
  }, [fetchUserName]);

  const [cartBounce, setCartBounce] = useState(false);

  useEffect(() => {
    setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));
  }, [cart]);

  useEffect(() => {
    if (cartCount > 0) {
      setCartBounce(true);
      const t = setTimeout(() => setCartBounce(false), 400);
      return () => clearTimeout(t);
    }
  }, [cartCount]);

  useEffect(() => {
    const handler = (e) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (drawerOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  useEffect(() => {
    if (search.length >= 2) {
      const lower = search.toLowerCase();
      setSearchResults(
        products.filter((p) =>
          (p.name && p.name.toLowerCase().includes(lower)) ||
          (p.category && p.category.toLowerCase().includes(lower)) ||
          (p.brand && p.brand.toLowerCase().includes(lower))
        ).slice(0, 8)
      );
    } else {
      setSearchResults([]);
    }
  }, [search, products]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminToken");
    setUserName("");
    setIsAdmin(false);
    setUserDropdownOpen(false);
    window.dispatchEvent(new Event("storage"));
    router.push("/account/login");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/shop?search=${encodeURIComponent(search.trim())}`);
      setSearch("");
      setSearchFocused(false);
      setMobileSearchOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[998] lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-[300px] max-w-[85vw] bg-white z-[999] shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col lg:hidden ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-5 flex items-center justify-between">
          <div>
            <p className="text-white font-bold text-base">
              {mounted && userName ? userName : "Hello, Guest"}
            </p>
            <p className="text-blue-200 text-xs mt-0.5">
              {mounted && userName ? "Welcome back!" : "Sign in for the best experience"}
            </p>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
            aria-label="Close menu"
          >
            <X size={16} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          <DrawerLink href="/" icon={Home} label="Home" onClick={() => setDrawerOpen(false)} />
          <DrawerLink href="/shop" icon={Store} label="Shop" onClick={() => setDrawerOpen(false)} />
          {mounted && userName ? (
            <>
              {isAdmin && <DrawerLink href="/admin" icon={LayoutDashboard} label="Admin Dashboard" onClick={() => setDrawerOpen(false)} />}
              <DrawerLink href="/account/dashboard" icon={User} label="My Account" onClick={() => setDrawerOpen(false)} />
              <DrawerLink href="/cart" icon={ShoppingCart} label="Cart" badge={cartCount} onClick={() => setDrawerOpen(false)} />
              <div className="border-t border-gray-100 mt-2 pt-2">
                <button
                  onClick={() => { setDrawerOpen(false); handleLogout(); }}
                  className="flex items-center gap-3 w-full px-5 py-3.5 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <>
              <DrawerLink href="/cart" icon={ShoppingCart} label="Cart" badge={cartCount} onClick={() => setDrawerOpen(false)} />
              <DrawerLink href="/account/login" icon={LogIn} label="Sign In" onClick={() => setDrawerOpen(false)} />
            </>
          )}
        </nav>

        <div className="px-5 py-4 border-t border-gray-100 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} Computer9
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Left: Hamburger + Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDrawerOpen(true)}
                className="lg:hidden p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Open menu"
              >
                <Menu size={22} />
              </button>

              <Link href="/" className="flex items-center gap-2 shrink-0">
                <img src="/logo.svg" alt="Computer9" className="w-8 h-8" />
                <span className="text-xl sm:text-2xl font-bold text-blue-900" style={{ fontFamily: "Arial Rounded MT Bold, Arial, sans-serif" }}>
                  Computer<span className="text-orange-500">9</span>
                </span>
              </Link>
            </div>

            {/* Center: Search */}
            <div ref={searchRef} className="hidden md:block flex-1 max-w-xl relative">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  placeholder="Search for products, brands..."
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all"
                  autoComplete="off"
                />
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </form>

              {/* Search Dropdown */}
              {searchFocused && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50">
                  {searchResults.map((product) => (
                    <Link
                      key={product._id}
                      href={`/product/${product.slug || product._id}`}
                      onClick={() => { setSearch(""); setSearchFocused(false); }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                    >
                      <img
                        src={product.images?.[0]?.startsWith("http") ? product.images[0] : "/logo.svg"}
                        alt=""
                        className="w-10 h-10 object-contain rounded-lg bg-gray-50 border border-gray-100 p-1"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 truncate">{product.name}</p>
                        <p className="text-xs text-gray-400">{product.category}</p>
                      </div>
                      <span className="text-sm font-bold text-gray-900 shrink-0">
                        ₹{product.price?.toLocaleString("en-IN")}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {/* Mobile search toggle */}
              <button
                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Search"
              >
                {mobileSearchOpen ? <X size={20} /> : <Search size={20} />}
              </button>

              {/* Shop link with mega menu — desktop */}
              <div className="hidden lg:block relative group">
                <Link
                  href="/shop"
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Store size={16} />
                  Shop
                  <ChevronDown size={14} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                </Link>
                {/* Mega Menu Dropdown */}
                <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="bg-white border border-gray-200 rounded-xl shadow-xl p-4 w-[320px] lg:w-[400px] grid grid-cols-2 gap-1 max-w-[calc(100vw-2rem)] right-0 lg:right-auto lg:left-0">
                    {products.slice(0, 8).map((p) => p.category).filter((v, i, a) => v && a.indexOf(v) === i).slice(0, 8).map((cat) => (
                      <Link key={cat} href={`/shop?category=${encodeURIComponent(cat)}`}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-blue-50 transition-colors">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-sm text-gray-700 font-medium">{cat}</span>
                      </Link>
                    ))}
                    <div className="col-span-2 border-t border-gray-100 pt-2 mt-1">
                      <Link href="/shop" className="text-xs text-blue-600 font-semibold hover:text-blue-700">
                        Browse All Products →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Admin link */}
              {mounted && userName && isAdmin && (
                <Link
                  href="/admin"
                  className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                >
                  <LayoutDashboard size={16} />
                  Admin
                </Link>
              )}

              {/* User Dropdown */}
              <div ref={userDropdownRef} className="relative hidden sm:block">
                <button
                  onClick={() => {
                    if (mounted && userName) setUserDropdownOpen(!userDropdownOpen);
                    else router.push("/account/login");
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <User size={18} />
                  <span className="hidden lg:inline">
                    {mounted && userName ? userName.split(" ")[0] : "Sign In"}
                  </span>
                  {mounted && userName && <ChevronDown size={14} className={`transition-transform ${userDropdownOpen ? "rotate-180" : ""}`} />}
                </button>

                {userDropdownOpen && mounted && userName && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                      <p className="text-sm font-medium text-gray-900">{userName}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Manage your account</p>
                    </div>
                    {isAdmin && (
                      <Link href="/admin" onClick={() => setUserDropdownOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <LayoutDashboard size={16} className="text-gray-400" />
                        Admin Dashboard
                      </Link>
                    )}
                    <Link href="/account/dashboard" onClick={() => setUserDropdownOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <User size={16} className="text-gray-400" />
                      My Account
                    </Link>
                    <div className="border-t border-gray-100">
                      <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors">
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Cart */}
              <Link
                href="/cart"
                className={`relative flex items-center gap-1.5 p-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors ${cartBounce ? "cart-bounce" : ""}`}
                aria-label="Shopping cart"
              >
                <ShoppingCart size={20} />
                {mounted && cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-blue-600 text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full shadow-sm">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
                <span className="hidden lg:inline text-sm font-medium">Cart</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {mobileSearchOpen && (
          <div className="md:hidden border-t border-gray-100 px-4 py-3 bg-gray-50">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                autoFocus
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                autoComplete="off"
              />
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </form>
            {searchResults.length > 0 && (
              <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden max-h-64 overflow-y-auto">
                {searchResults.map((product) => (
                  <Link
                    key={product._id}
                    href={`/product/${product.slug || product._id}`}
                    onClick={() => { setSearch(""); setMobileSearchOpen(false); }}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 border-b border-gray-50 last:border-0"
                  >
                    <span className="text-sm text-gray-700 truncate flex-1">{product.name}</span>
                    <span className="text-sm font-bold text-gray-900 shrink-0">₹{product.price?.toLocaleString("en-IN")}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
}

function DrawerLink({ href, icon: Icon, label, badge, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center justify-between px-5 py-3.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
    >
      <span className="flex items-center gap-3">
        <Icon size={18} className="text-gray-400" />
        {label}
      </span>
      {badge > 0 && (
        <span className="bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {badge}
        </span>
      )}
    </Link>
  );
}
