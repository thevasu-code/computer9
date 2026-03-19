
"use client";
import React, { useEffect, useState, useCallback } from "react";
import { ShoppingCart, Search, X, Menu, Home, Package, Settings, LogIn, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useCart } from "../context/CartContext";

export default function Header() {
  const { cart } = useCart();
  const [cartCount, setCartCount] = useState(0);
  const [userName, setUserName] = useState("");
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload && payload.id) {
          fetch(`/api/users/${payload.id}`)
            .then(res => res.json())
            .then(data => { if (data && data.name) setUserName(data.name); });
        }
      } catch {}
    }
    fetch("/api/products")
      .then(res => res.json())
      .then(data => { setProducts(data); });
  }, [cart]);

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  useEffect(() => {
    if (search.length >= 2) {
      const lower = search.toLowerCase();
      setSearchResults(
        products.filter(p =>
          (p.name && p.name.toLowerCase().includes(lower)) ||
          (p.category && p.category.toLowerCase().includes(lower))
        )
      );
    } else {
      setSearchResults([]);
    }
  }, [search, products]);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const NavLink = ({ href, icon: Icon, label, badge }) => (
    <a
      href={href}
      onClick={closeDrawer}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "15px 20px", color: "#212121", textDecoration: "none",
        fontSize: "15px", fontWeight: 500, borderBottom: "1px solid #f0f0f0",
        background: "#fff", transition: "background 0.15s",
      }}
      onMouseEnter={e => e.currentTarget.style.background = "#f5f5f5"}
      onMouseLeave={e => e.currentTarget.style.background = "#fff"}
    >
      <span style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <span style={{ color: "#2874f0" }}><Icon size={18} /></span>
        {label}
      </span>
      <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {badge > 0 && (
          <span style={{ background: "#ff9f00", color: "#fff", borderRadius: "10px", fontSize: "11px", fontWeight: 700, padding: "1px 7px" }}>{badge}</span>
        )}
        <ChevronRight size={16} style={{ color: "#bbb" }} />
      </span>
    </a>
  );

  const SearchDropdown = ({ onClose }) =>
    search.length >= 2 ? (
      <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", boxShadow: "0 6px 16px rgba(0,0,0,0.12)", zIndex: 300, borderRadius: "0 0 4px 4px", maxHeight: "300px", overflowY: "auto" }}>
        {searchResults.length > 0 ? (
          searchResults.slice(0, 7).map(product => (
            <Link key={product._id} href={`/product/${product._id}`} onClick={() => { setSearch(""); onClose && onClose(); }}
              style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 14px", textDecoration: "none", color: "#212121", borderBottom: "1px solid #f5f5f5" }}
            >
              <img src={product.images?.[0]?.startsWith("http") ? product.images[0] : "/no-image.png"} alt={product.name} style={{ width: 34, height: 34, objectFit: "contain", borderRadius: 2, border: "1px solid #eee" }} />
              <span style={{ fontSize: "13px", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{product.name}</span>
              <span style={{ fontSize: "12px", color: "#2874f0", fontWeight: 600, flexShrink: 0 }}>â‚¹{product.price}</span>
            </Link>
          ))
        ) : (
          <div style={{ padding: "14px", color: "#888", fontSize: "13px", textAlign: "center" }}>No products found</div>
        )}
      </div>
    ) : null;

  return (
    <>
      <style>{`
        .c9hdr-search { display: flex; flex: 1; position: relative; max-width: 600px; }
        .c9hdr-login { display: flex; }
        .c9hdr-admin { display: flex; }
        .c9hdr-cart-label { display: inline; }
        .c9hdr-mob-search { display: none; }
        .c9hdr-hamburger { display: none; }
        @media (max-width: 640px) {
          .c9hdr-search { display: none !important; }
          .c9hdr-login { display: none !important; }
          .c9hdr-admin { display: none !important; }
          .c9hdr-cart-label { display: none; }
          .c9hdr-mob-search { display: flex !important; }
          .c9hdr-hamburger { display: flex !important; }
        }
      `}</style>

      {/* Drawer backdrop */}
      {drawerOpen && (
        <div
          onClick={closeDrawer}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 998, backdropFilter: "blur(1px)" }}
        />
      )}

      {/* Side Drawer */}
      <div style={{
        position: "fixed", top: 0, left: 0, height: "100%", width: "300px", maxWidth: "85vw",
        background: "#fff", zIndex: 999, boxShadow: "4px 0 24px rgba(0,0,0,0.18)",
        transform: drawerOpen ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)",
        display: "flex", flexDirection: "column",
      }}>
        {/* Drawer header */}
        <div style={{ background: "#2874f0", padding: "20px 16px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: "17px" }}>
              {mounted && userName ? userName : "Hello, Sign In"}
            </div>
            <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "12px", marginTop: "2px" }}>
              {mounted && userName ? "Welcome back!" : "Manage your account"}
            </div>
          </div>
          <button onClick={closeDrawer} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: 34, height: 34, cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={18} />
          </button>
        </div>

        {/* Drawer nav */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          <div style={{ padding: "8px 0" }}>
            <NavLink href="/" icon={Home} label="Home" />
            <NavLink href="/account/login" icon={LogIn} label={mounted && userName ? "My Account" : "Login / Register"} />
            <NavLink href="/cart" icon={ShoppingCart} label="My Cart" badge={mounted ? cartCount : 0} />
            <NavLink href="/account" icon={Package} label="My Orders" />
          </div>
          <div style={{ borderTop: "8px solid #f1f3f6", padding: "8px 0" }}>
            <NavLink href="/admin/login" icon={Settings} label="Admin Panel" />
          </div>
        </div>

        {/* Drawer footer */}
        <div style={{ padding: "14px 20px", borderTop: "1px solid #f0f0f0", fontSize: "12px", color: "#aaa", textAlign: "center" }}>
          computer9 &copy; {new Date().getFullYear()}
        </div>
      </div>

      {/* Sticky header bar */}
      <header style={{ background: "#2874f0", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 4px rgba(0,0,0,0.15)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", alignItems: "center", gap: "12px", padding: "10px 16px" }}>

          {/* Mobile: hamburger */}
          <button className="c9hdr-hamburger" onClick={() => setDrawerOpen(true)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#fff", padding: "4px 6px 4px 0", display: "none", alignItems: "center", flexShrink: 0 }}>
            <Menu size={24} />
          </button>

          {/* Logo */}
          <a href="/" style={{ textDecoration: "none", flexShrink: 0 }}>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: "20px", lineHeight: 1 }}>computer9</div>
            <div style={{ color: "#ffe500", fontSize: "10px", fontStyle: "italic", marginTop: "1px" }}>
              Explore <span style={{ textDecoration: "underline" }}>Plus</span> âœ¦
            </div>
          </a>

          {/* Desktop search */}
          <div className="c9hdr-search" style={{ flex: 1 }}>
            <div style={{ display: "flex", background: "#fff", borderRadius: "2px", width: "100%" }}>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search for products, brands and more"
                style={{ flex: 1, border: "none", outline: "none", padding: "10px 14px", fontSize: "14px" }}
                autoComplete="off"
              />
              <button style={{ background: "#2874f0", border: "none", padding: "0 20px", cursor: "pointer", color: "#fff" }}>
                <Search size={18} />
              </button>
            </div>
            <SearchDropdown />
          </div>

          {/* Spacer on mobile so cart sits right */}
          <div style={{ flex: 1 }} className="c9hdr-mob-spacer" />

          {/* Mobile: search icon */}
          <button className="c9hdr-mob-search"
            onClick={() => setMobileSearchOpen(v => !v)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#fff", padding: "4px", display: "none", alignItems: "center" }}>
            {mobileSearchOpen ? <X size={22} /> : <Search size={22} />}
          </button>

          {/* Desktop: Login */}
          <a className="c9hdr-login" href="/account/login"
            style={{ background: "#fff", color: "#2874f0", borderRadius: "2px", padding: "6px 18px", fontSize: "14px", fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap", alignItems: "center" }}>
            {mounted && userName ? userName : "Login"}
          </a>

          {/* Cart */}
          <a href="/cart" style={{ color: "#fff", textDecoration: "none", display: "flex", alignItems: "center", gap: "5px", position: "relative", fontSize: "14px", fontWeight: 500, flexShrink: 0 }}>
            <span style={{ position: "relative", display: "inline-flex" }}>
              <ShoppingCart size={22} />
              {mounted && cartCount > 0 && (
                <span style={{ position: "absolute", top: "-8px", right: "-8px", background: "#ff9f00", color: "#fff", borderRadius: "50%", fontSize: "10px", fontWeight: 700, width: "18px", height: "18px", display: "flex", alignItems: "center", justifyContent: "center" }}>{cartCount}</span>
              )}
            </span>
            <span className="c9hdr-cart-label">Cart</span>
          </a>

          {/* Desktop: Admin */}
          <a className="c9hdr-admin" href="/admin/login" style={{ color: "#ffe500", textDecoration: "none", fontSize: "13px", fontWeight: 500, alignItems: "center" }}>Admin</a>
        </div>

        {/* Mobile search bar (below nav row) */}
        {mobileSearchOpen && (
          <div style={{ padding: "0 12px 10px", position: "relative" }}>
            <div style={{ display: "flex", background: "#fff", borderRadius: "2px" }}>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search products..."
                autoFocus
                style={{ flex: 1, border: "none", outline: "none", padding: "9px 12px", fontSize: "14px" }}
                autoComplete="off"
              />
              {search && (
                <button onClick={() => setSearch("")} style={{ background: "none", border: "none", padding: "0 10px", cursor: "pointer", color: "#888" }}>
                  <X size={16} />
                </button>
              )}
            </div>
            <SearchDropdown onClose={() => setMobileSearchOpen(false)} />
          </div>
        )}
      </header>
    </>
  );
}
