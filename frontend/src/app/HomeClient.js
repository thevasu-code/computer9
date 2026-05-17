"use client";
import React, { useRef } from "react";
import Link from "next/link";
import ProductCard from "../components/ProductCard";

const CATEGORY_ICONS = {
  laptop: "💻", laptops: "💻", notebook: "💻",
  desktop: "🖥️", desktops: "🖥️", pc: "🖥️", computer: "🖥️", computers: "🖥️",
  monitor: "🖥️", monitors: "🖥️", display: "📺", displays: "📺",
  component: "🔧", components: "🔧", hardware: "🔧",
  processor: "⚙️", processors: "⚙️", cpu: "⚙️",
  gpu: "🎮", "graphics card": "🎮", "graphics cards": "🎮",
  gaming: "🎮", "gaming accessories": "🎮",
  memory: "🧩", ram: "🧩",
  storage: "💾", ssd: "💾", hdd: "💾", "hard drive": "💾",
  networking: "📡", network: "📡", router: "📡", routers: "📡", wifi: "📡",
  keyboard: "⌨️", keyboards: "⌨️",
  mouse: "🖱️", mice: "🖱️",
  accessory: "🖱️", accessories: "🖱️",
  headphone: "🎧", headphones: "🎧", headset: "🎧", audio: "🎧", speaker: "🔊", speakers: "🔊",
  printer: "🖨️", printers: "🖨️", scanner: "🖨️",
  camera: "📷", cameras: "📷", webcam: "📷",
  cable: "🔌", cables: "🔌", adapter: "🔌", adapters: "🔌", charger: "🔌", chargers: "🔌",
  software: "📀", os: "📀",
  tablet: "📱", tablets: "📱", phone: "📱",
  ups: "🔋", battery: "🔋", "power supply": "🔋", smps: "🔋", psu: "🔋",
  motherboard: "🟩", motherboards: "🟩",
  cabinet: "📦", case: "📦", chassis: "📦",
  cooler: "❄️", cooling: "❄️", fan: "❄️", fans: "❄️",
  projector: "📽️", projectors: "📽️",
  server: "🗄️", servers: "🗄️",
  furniture: "🪑", chair: "🪑", desk: "🪑",
};

function getCategoryIcon(name) {
  if (!name) return "📦";
  const lower = name.trim().toLowerCase();
  if (CATEGORY_ICONS[lower]) return CATEGORY_ICONS[lower];
  // partial match
  for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
    if (lower.includes(key) || key.includes(lower)) return icon;
  }
  return "📦";
}

export default function HomeClient({ initialProducts, categories = [] }) {
  // Priority category order (case-insensitive matching)
  const PRIORITY_ORDER = ["CPU", "Graphics", "Hard Disk", "Laptop"];

  // Normalize a category name for comparison (lowercase, remove hyphens/underscores)
  const normalize = (s) => s?.toLowerCase().replace(/[-_\s]+/g, ' ') || '';

  // Find the priority index for any category name (case-insensitive, flexible match)
  const getPriorityIndex = (catName) => {
    const norm = normalize(catName);
    for (let i = 0; i < PRIORITY_ORDER.length; i++) {
      if (norm === normalize(PRIORITY_ORDER[i]) || norm.includes(normalize(PRIORITY_ORDER[i])) || normalize(PRIORITY_ORDER[i]).includes(norm)) {
        return i;
      }
    }
    return -1;
  };

  // Build category rows: up to 10 categories, each with up to 4 products
  const productCategories = categories.length > 0
    ? categories.map((c) => c.name)
    : [...new Set(initialProducts.map((p) => p.category).filter(Boolean))];

  const displayCategories = productCategories.slice(0, 10);

  // Sort: priority categories first (in specified order), then rest alphabetically
  const sortedCategories = [...displayCategories].sort((a, b) => {
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
      products: initialProducts.filter((p) => p.category === catName).slice(0, 4),
    }))
    .filter((row) => row.products.length > 0);

  return (
    <div style={{ background: '#edf2f8', minHeight: '100vh' }}>
      <style>{`
        .home-shell {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 16px 20px;
        }
        .home-hero {
          margin: 14px 0 12px;
          border-radius: 18px;
          background:
            radial-gradient(circle at 8% 18%, rgba(255, 234, 158, 0.55), transparent 44%),
            radial-gradient(circle at 88% 24%, rgba(139, 229, 176, 0.36), transparent 48%),
            linear-gradient(120deg, #0056d6 0%, #0d7df2 52%, #1cb86a 100%);
          color: #fefefe;
          padding: 32px 34px;
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 16px;
          box-shadow: 0 14px 36px rgba(15, 54, 120, 0.3);
          overflow: hidden;
          position: relative;
        }
        .home-hero::after {
          content: "";
          position: absolute;
          width: 240px;
          height: 240px;
          border-radius: 50%;
          right: -70px;
          bottom: -90px;
          background: rgba(255, 232, 130, 0.24);
          filter: blur(2px);
        }
        .home-hero-kicker {
          display: inline-block;
          background: rgba(255, 235, 153, 0.22);
          border: 1px solid rgba(255, 242, 188, 0.52);
          color: #fff9e2;
          border-radius: 999px;
          padding: 6px 12px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
        }
        .home-hero-title {
          margin-top: 12px;
          font-size: 38px;
          line-height: 1.14;
          font-weight: 800;
          max-width: 620px;
        }
        .home-hero-sub {
          margin-top: 10px;
          font-size: 14px;
          opacity: 0.92;
          max-width: 560px;
        }

        /* Category strip */
        .home-categories {
          background: #fff;
          border-radius: 14px;
          box-shadow: 0 4px 14px rgba(17, 38, 77, 0.08);
          margin: 0 0 12px;
          padding: 14px 10px;
          display: flex;
          gap: 6px;
          overflow-x: auto;
          scrollbar-width: none;
          justify-content: center;
        }
        .home-categories::-webkit-scrollbar { display: none; }
        .home-cat-pill {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          text-decoration: none;
          color: #1b3f73;
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
          border-radius: 12px;
          transition: all 0.18s ease;
          min-width: 80px;
          text-align: center;
        }
        .home-cat-pill:hover {
          background: #edf5ff;
        }
        .home-cat-pill-icon {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f0f6ff, #e2edff);
          border: 2px solid #d8e7ff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          overflow: hidden;
        }
        .home-cat-pill-icon img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
        }

        /* Category row */
        .home-cat-row {
          background: #fff;
          border-radius: 14px;
          box-shadow: 0 4px 14px rgba(17, 38, 77, 0.08);
          margin-bottom: 12px;
          overflow: hidden;
        }
        .home-cat-row-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #e8eef8;
        }
        .home-cat-row-title {
          font-size: 20px;
          font-weight: 800;
          color: #12284a;
        }
        .home-cat-row-link {
          font-size: 13px;
          font-weight: 700;
          color: #2874f0;
          background: #eef4ff;
          border: 1px solid #d8e7ff;
          border-radius: 999px;
          padding: 6px 16px;
          text-decoration: none;
          transition: background 0.15s;
        }
        .home-cat-row-link:hover {
          background: #d8e7ff;
        }
        .home-cat-row-scroll-wrap {
          position: relative;
        }
        .home-cat-row-scroll {
          display: flex;
          gap: 14px;
          padding: 16px 20px;
          overflow-x: auto;
          scroll-behavior: smooth;
          scrollbar-width: none;
        }
        .home-cat-row-scroll::-webkit-scrollbar { display: none; }
        .home-cat-row-scroll > div {
          min-width: 236px;
          max-width: 280px;
          flex: 0 0 calc(25% - 11px);
        }
        .scroll-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #fff;
          border: 1px solid #d8e7ff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 2;
          font-size: 18px;
          color: #2874f0;
          transition: background 0.15s;
        }
        .scroll-arrow:hover { background: #eef4ff; }
        .scroll-arrow-left { left: 6px; }
        .scroll-arrow-right { right: 6px; }

        @keyframes riseUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .home-cat-row-scroll > div {
          animation: riseUp 0.35s ease both;
        }

        @media (max-width: 980px) {
          .home-hero {
            grid-template-columns: 1fr;
            padding: 24px 22px;
          }
          .home-hero-title { font-size: 31px; }
          .home-cat-row-scroll > div {
            min-width: 200px;
            flex: 0 0 calc(33.33% - 10px);
          }
        }
        @media (max-width: 640px) {
          .home-shell { padding: 0 10px 18px; }
          .home-hero { margin-top: 10px; border-radius: 14px; }
          .home-hero-title { font-size: 24px; }
          .home-cat-row-scroll > div {
            min-width: 160px;
            flex: 0 0 calc(50% - 7px);
          }
          .home-cat-row-scroll { padding: 12px; gap: 8px; }
          .home-categories { 
            padding: 10px 16px; 
            justify-content: flex-start; 
            gap: 12px;
          }
          .home-cat-pill { 
            min-width: 56px; 
            padding: 8px 10px; 
            font-size: 11px; 
          }
          .home-cat-pill-icon { width: 44px; height: 44px; font-size: 20px; }
        }
      `}</style>

      <div className="home-shell">
        {/* Hero */}
        <section className="home-hero">
          <div>
            <div className="home-hero-kicker">Welcome to Computer9</div>
            <div className="home-hero-title">Professional-Grade Computers, Built For Speed and Reliability</div>
            <div className="home-hero-sub">
              Discover curated laptops, components, storage, and accessories tuned for creators, office teams, and hardcore gamers.
            </div>
          </div>
        </section>

        {/* Category strip */}
        {sortedCategories.length > 0 && (
          <div className="home-categories">
            {sortedCategories.map((catName) => {
              const catObj = categories.find((c) => c.name === catName);
              return (
                <a key={catName} href={`#cat-${catName.replace(/\s+/g, '-')}`} className="home-cat-pill">
                  <div className="home-cat-pill-icon">
                    {catObj?.image ? (
                      <img src={catObj.image} alt={catName} />
                    ) : (
                      getCategoryIcon(catName)
                    )}
                  </div>
                  {catName}
                </a>
              );
            })}
          </div>
        )}

        {/* Category product rows */}
        {categoryRows.map((row) => (
          <CategoryProductRow key={row.name} row={row} />
        ))}

        {/* If no categories have products, show all */}
        {categoryRows.length === 0 && initialProducts.length > 0 && (
          <div className="home-cat-row">
            <div className="home-cat-row-head">
              <span className="home-cat-row-title">All Products</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(236px, 1fr))', gap: '14px', padding: '16px 20px' }}>
              {initialProducts.slice(0, 8).map((product, i) => (
                <div key={product._id}>
                  <ProductCard product={product} priority={i < 4} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CategoryProductRow({ row }) {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.offsetWidth * 0.6;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <div className="home-cat-row" id={`cat-${row.name.replace(/\s+/g, '-')}`}>
      <div className="home-cat-row-head">
        <span className="home-cat-row-title">{row.name}</span>
        <Link href={`/shop?category=${encodeURIComponent(row.name)}`} className="home-cat-row-link">
          View All →
        </Link>
      </div>
      <div className="home-cat-row-scroll-wrap">
        {row.products.length > 3 && (
          <>
            <button className="scroll-arrow scroll-arrow-left" onClick={() => scroll('left')} aria-label="Scroll left">‹</button>
            <button className="scroll-arrow scroll-arrow-right" onClick={() => scroll('right')} aria-label="Scroll right">›</button>
          </>
        )}
        <div className="home-cat-row-scroll" ref={scrollRef}>
          {row.products.map((product, i) => (
            <div key={product._id}>
              <ProductCard product={product} priority={i < 2} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
