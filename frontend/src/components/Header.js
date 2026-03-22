
"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { ShoppingCart, Search, X, Menu, Home, Package, LogIn, ChevronRight, User, LogOut, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";

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
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const fetchUserName = useCallback(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setIsAdmin(Boolean(payload?.isAdmin || payload?.role === "admin"));
        if (payload && payload.id) {
          fetch(`/api/users/${payload.id}`)
            .then(res => res.json())
            .then(data => { if (data && data.name) setUserName(data.name); });
        }
      } catch {}
    } else {
      setUserName("");
      setIsAdmin(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchUserName();
    fetch("/api/products")
      .then(res => res.json())
      .then(data => { setProducts(data); });

    window.addEventListener("userLogin", fetchUserName);
    window.addEventListener("storage", fetchUserName);
    return () => {
      window.removeEventListener("userLogin", fetchUserName);
      window.removeEventListener("storage", fetchUserName);
    };
  }, [fetchUserName]);

  useEffect(() => {
    setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));
  }, [cart]);

  // Close user dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminToken");
    setUserName("");
    setIsAdmin(false);
    setUserDropdownOpen(false);
    window.dispatchEvent(new Event("storage"));
    router.push("/account/login");
  };

  const NavLink = ({ href, icon: Icon, label, badge }) => (
    <Link
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
    </Link>
  );

  const SearchDropdown = ({ onClose }) =>
    search.length >= 2 ? (
      <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "#fff", boxShadow: "0 6px 20px rgba(0,0,0,0.15)", zIndex: 300, borderRadius: "8px", maxHeight: "340px", overflowY: "auto", border: "1px solid #e0e0e0" }}>
        {searchResults.length > 0 ? (
          searchResults.slice(0, 7).map(product => (
            <Link key={product._id} href={`/product/${product._id}`} onClick={() => { setSearch(""); onClose && onClose(); }}
              style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 14px", textDecoration: "none", color: "#212121", borderBottom: "1px solid #f5f5f5" }}
            >
              <img src={product.images?.[0]?.startsWith("http") ? product.images[0] : "/no-image.png"} alt={product.name} style={{ width: 38, height: 38, objectFit: "contain", borderRadius: 4, border: "1px solid #eee", flexShrink: 0 }} />
              <span style={{ fontSize: "13px", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}>{product.name}</span>
              <span style={{ fontSize: "13px", color: "#2874f0", fontWeight: 700, flexShrink: 0, marginLeft: "8px" }}>&#8377;{product.price?.toLocaleString('en-IN')}</span>
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
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;800;900&display=swap');
        .c9hdr-search { display: flex; flex: 1; position: relative; max-width: 600px; }
        .c9hdr-login { display: flex; }
        .c9hdr-cart-label { display: inline; }
        .c9hdr-mob-search { display: none; }
        .c9hdr-hamburger { display: none; }
        .c9hdr-logo-text { font-family: 'Orbitron', sans-serif; font-weight: 800; font-size: 24px; line-height: 1; letter-spacing: 1px; color: #fff; text-shadow: 1px 1px 0 rgba(0,0,80,0.4), 2px 2px 0 rgba(0,0,80,0.3), 3px 3px 0 rgba(0,0,80,0.2), 0 0 18px rgba(255,255,255,0.5), 0 0 40px rgba(100,160,255,0.25); }
        .c9hdr-logo-text .c9logo-9 { font-weight: 900; color: #ffe500; text-shadow: 1px 1px 0 rgba(180,90,0,0.5), 2px 2px 0 rgba(180,90,0,0.3), 0 0 14px rgba(255,229,0,0.8), 0 0 32px rgba(255,160,0,0.4); }
        @media (max-width: 640px) {
          .c9hdr-logo-text { font-size: 20px; letter-spacing: 0.5px; }
          .c9hdr-logo-text .c9logo-9 { font-size: 20px; }
          .c9hdr-search { display: none !important; }
          .c9hdr-login { display: none !important; }
          .c9hdr-cart-label { display: none; }
          .c9hdr-mob-search { display: flex !important; }
          .c9hdr-hamburger { display: flex !important; }
          header > div > div:first-child { grid-column: 1; }
          header > div { grid-template-columns: auto 1fr auto !important; }
        }
        .c9hdr-user-menu { position: absolute; top: calc(100% + 8px); right: 0; min-width: 180px; background: #fff; border-radius: 4px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); z-index: 200; overflow: hidden; }
        .c9hdr-user-menu a, .c9hdr-user-menu button { display: flex; align-items: center; gap: 10px; padding: 12px 16px; font-size: 14px; color: #212121; text-decoration: none; background: none; border: none; width: 100%; cursor: pointer; border-bottom: 1px solid #f0f0f0; }
        .c9hdr-user-menu a:hover, .c9hdr-user-menu button:hover { background: #f1f3f6; }
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
            {mounted && userName ? (
              <>
                {isAdmin && <NavLink href="/admin" icon={LayoutDashboard} label="Admin" />}
                <NavLink href="/account/dashboard" icon={LayoutDashboard} label="My Dashboard" />
                <NavLink href="/account/dashboard" icon={Package} label="My Orders" />
                <NavLink href="/cart" icon={ShoppingCart} label="My Cart" badge={mounted ? cartCount : 0} />
                <a
                  onClick={() => { closeDrawer(); handleLogout(); }}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px 20px", color: "#c62828", textDecoration: "none", fontSize: "15px", fontWeight: 500, borderBottom: "1px solid #f0f0f0", background: "#fff", cursor: "pointer" }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <LogOut size={18} />Logout
                  </span>
                </a>
              </>
            ) : (
              <>
                <NavLink href="/cart" icon={ShoppingCart} label="My Cart" badge={mounted ? cartCount : 0} />
                <NavLink href="/account/login" icon={LogIn} label="Login / Register" />
              </>
            )}
          </div>

        </div>

        {/* Drawer footer */}
        <div style={{ padding: "14px 20px", borderTop: "1px solid #f0f0f0", fontSize: "12px", color: "#aaa", textAlign: "center" }}>
          Computer9 &copy; {new Date().getFullYear()}
        </div>
      </div>

      {/* Sticky header bar */}
      <header style={{ background: "#2874f0", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 8px rgba(0,0,0,0.18)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 2fr 1fr", alignItems: "center", padding: "10px 16px" }}>

          {/* LEFT: hamburger + logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* Mobile: hamburger */}
            <button className="c9hdr-hamburger" onClick={() => setDrawerOpen(true)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#fff", padding: "4px 6px 4px 0", display: "none", alignItems: "center" }}>
              <Menu size={24} />
            </button>

            {/* Logo */}
            <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ background: "#fff", borderRadius: "8px", padding: "3px", display: "flex", alignItems: "center", justifyContent: "center", width: 38, height: 38, flexShrink: 0, boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }}>
                <img src="/logo.svg" alt="Computer9" style={{ width: 32, height: 32, objectFit: "contain" }} />
              </div>
              <div>
                <div className="c9hdr-logo-text">Computer<span className="c9logo-9">9</span></div>
                {/* <div style={{ color: "#ffe500", fontSize: "10px", fontStyle: "italic", marginTop: "1px" }}>
                  Explore <span style={{ textDecoration: "underline" }}>Plus</span> ✦
                </div> */}
              </div>
            </Link>
          </div>

          {/* CENTER: Desktop search bar — truly centered */}
          <div className="c9hdr-search" style={{ display: "flex", justifyContent: "center", padding: "0 12px" }}>
            <div style={{ width: "100%", maxWidth: "700px", position: "relative" }}>
              <div style={{ display: "flex", background: "#fff", borderRadius: "24px", overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.18)", border: "2px solid transparent", transition: "border-color 0.2s" }}
                onFocusCapture={e => e.currentTarget.style.borderColor = "#ff9f00"}
                onBlurCapture={e => e.currentTarget.style.borderColor = "transparent"}
              >
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search for products, brands and more"
                  style={{ flex: 1, border: "none", outline: "none", padding: "8px 16px", fontSize: "14px", background: "transparent" }}
                  autoComplete="off"
                />
                <button style={{ background: "#ff9f00", border: "none", padding: "0 18px", cursor: "pointer", color: "#fff", borderRadius: "0 22px 22px 0", display: "flex", alignItems: "center" }}>
                  <Search size={18} />
                </button>
              </div>
              <SearchDropdown />
            </div>
          </div>

          {/* RIGHT: actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "flex-end" }}>
            {/* Mobile: search icon */}
            <button className="c9hdr-mob-search"
              onClick={() => setMobileSearchOpen(v => !v)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#fff", padding: "4px", display: "none", alignItems: "center" }}>
              {mobileSearchOpen ? <X size={22} /> : <Search size={22} />}
            </button>

            {mounted && userName && isAdmin && (
              <Link
                href="/admin"
                style={{
                  background: "#ff9f00",
                  color: "#fff",
                  borderRadius: "20px",
                  padding: "7px 14px",
                  fontSize: "13px",
                  fontWeight: 700,
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
                }}
              >
                <LayoutDashboard size={14} />
                Manage Admin Dashboard
              </Link>
            )}

            {/* Desktop: User account button + dropdown */}
            <div className="c9hdr-login" ref={userDropdownRef} style={{ position: "relative" }}>
              <button
                onClick={() => {
                  if (mounted && userName) {
                    setUserDropdownOpen(v => !v);
                  } else {
                    router.push("/account/login");
                  }
                }}
                style={{ background: "#fff", color: "#2874f0", borderRadius: "20px", padding: "7px 16px", fontSize: "14px", fontWeight: 600, border: "none", cursor: "pointer", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "6px", boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}
              >
                <User size={15} />
                {mounted && userName ? userName.split(" ")[0] : "Login"}
                {mounted && userName && <ChevronRight size={13} style={{ transform: userDropdownOpen ? "rotate(-90deg)" : "rotate(90deg)", transition: "transform 0.2s" }} />}
              </button>
              {userDropdownOpen && mounted && userName && (
                <div className="c9hdr-user-menu">
                  <div style={{ padding: "10px 16px 6px", fontSize: "12px", color: "#878787", borderBottom: "1px solid #f0f0f0" }}>Hello, {userName.split(" ")[0]}</div>
                  {isAdmin && <Link href="/admin" onClick={() => setUserDropdownOpen(false)}><LayoutDashboard size={15} />Admin</Link>}
                  <Link href="/account/dashboard" onClick={() => setUserDropdownOpen(false)}><LayoutDashboard size={15} />My Dashboard</Link>
                  <Link href="/account/dashboard" onClick={() => setUserDropdownOpen(false)}><Package size={15} />My Orders</Link>
                  <button onClick={handleLogout} style={{ color: "#c62828" }}><LogOut size={15} />Logout</button>
                </div>
              )}
            </div>



            {/* Cart */}
            <Link href="/cart" style={{ color: "#fff", textDecoration: "none", display: "flex", alignItems: "center", gap: "5px", position: "relative", fontSize: "14px", fontWeight: 500, flexShrink: 0 }}>
              <span style={{ position: "relative", display: "inline-flex" }}>
                <ShoppingCart size={22} />
                {mounted && cartCount > 0 && (
                  <span style={{ position: "absolute", top: "-8px", right: "-8px", background: "#ff9f00", color: "#fff", borderRadius: "50%", fontSize: "10px", fontWeight: 700, width: "18px", height: "18px", display: "flex", alignItems: "center", justifyContent: "center" }}>{cartCount}</span>
                )}
              </span>
              <span className="c9hdr-cart-label">Cart</span>
            </Link>


          </div>
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

