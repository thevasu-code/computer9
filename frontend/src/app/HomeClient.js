"use client";
import React, { useState } from "react";
import ProductCard from "../components/ProductCard";

const CATEGORY_ICONS = {
  "Laptops": "💻", "Desktops": "🖥️", "Components": "🔧", "Display": "📺",
  "Storage": "💾", "Networking": "📡", "Accessories": "🖱️", "Gaming": "🎮",
  "Printers": "🖨️", "Monitors": "🖥️", "Processors": "⚙️", "Memory": "🔌",
  "Keyboards": "⌨️", "Headphones": "🎧", "Cameras": "📷",
};

export default function HomeClient({ initialProducts }) {
  const [selectedCategory, setSelectedCategory] = useState("");
  const categories = [...new Set(initialProducts.map((p) => p.category).filter(Boolean))];
  const filteredProducts = selectedCategory
    ? initialProducts.filter((p) => p.category === selectedCategory)
    : initialProducts;
  const featured = filteredProducts.slice(0, 8);

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
        .home-hero-metrics {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
          margin-top: 18px;
        }
        .home-hero-metric {
          background: rgba(255, 255, 255, 0.18);
          border: 1px solid rgba(220, 247, 255, 0.34);
          border-radius: 12px;
          padding: 10px;
        }
        .home-hero-metric strong {
          display: block;
          font-size: 19px;
        }
        .home-hero-metric span {
          font-size: 11px;
          opacity: 0.88;
        }
        .home-categories {
          background: #fff;
          border-radius: 14px;
          box-shadow: 0 4px 14px rgba(17, 38, 77, 0.08);
          margin: 0 0 12px;
          padding: 10px;
          display: flex;
          gap: 8px;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .home-cat-btn {
          border: 1px solid #deebff;
          color: #1b3f73;
          background: #f7fbff;
          border-radius: 999px;
          padding: 9px 14px;
          font-size: 13px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.18s ease;
        }
        .home-cat-btn:hover {
          border-color: #9ec3ff;
          background: #edf5ff;
        }
        .home-cat-btn.active {
          background: linear-gradient(135deg, #1f5fbf, #2874f0);
          border-color: #2469d8;
          color: #fff;
          box-shadow: 0 6px 14px rgba(40, 116, 240, 0.3);
        }
        .home-section-head {
          background: #fff;
          border-radius: 14px 14px 0 0;
          padding: 16px 18px;
          border-bottom: 1px solid #e8eef8;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-top: 6px;
        }
        .home-grid-wrap {
          background: #fff;
          border-radius: 0 0 14px 14px;
          padding: 14px;
          box-shadow: 0 6px 20px rgba(20, 43, 84, 0.08);
        }
        .home-product-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(236px, 1fr));
          gap: 14px;
        }
        @keyframes riseUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .home-product-grid > div {
          animation: riseUp 0.35s ease both;
        }
        @media (max-width: 980px) {
          .home-hero {
            grid-template-columns: 1fr;
            padding: 24px 22px;
          }
          .home-hero-title { font-size: 31px; }
        }
        @media (max-width: 640px) {
          .home-shell { padding: 0 10px 18px; }
          .home-hero { margin-top: 10px; border-radius: 14px; }
          .home-hero-title { font-size: 24px; }
          .home-hero-metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .home-product-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
          .home-grid-wrap { padding: 8px; }
        }
      `}</style>
      {/* Promo strip */}
      {/* <div style={{ background: '#2874f0', color: '#fff', textAlign: 'center', padding: '4px 0', fontSize: '12px' }}>
        Free delivery on orders above ₹499 &nbsp;|&nbsp; 10% off on first order &nbsp;|&nbsp; EMI available on orders above ₹3000
      </div> */}

      <div className="home-shell">
        {!selectedCategory && (
          <section className="home-hero">
            <div>
              <div className="home-hero-kicker">Welcome to Computer9</div>
              <div className="home-hero-title">Professional-Grade Computers, Built For Speed and Reliability</div>
              <div className="home-hero-sub">
                Discover curated laptops, components, storage, and accessories tuned for creators, office teams, and hardcore gamers.
              </div>

            </div>

          </section>
        )}

        {/* Category strip */}
        <div className="home-categories">
          <button
            onClick={() => setSelectedCategory("")}
            className={`home-cat-btn ${!selectedCategory ? 'active' : ''}`}
          >
            <span style={{ fontSize: '17px' }}>🏠</span>All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`home-cat-btn ${selectedCategory === cat ? 'active' : ''}`}
            >
              <span style={{ fontSize: '17px' }}>{CATEGORY_ICONS[cat] || '📦'}</span>
              {cat}
            </button>
          ))}
        </div>

        {/* Section header */}
        <div className="home-section-head">
          <span style={{ fontSize: '20px', fontWeight: 800, color: '#12284a' }}>
            {selectedCategory || 'All Products'}
          </span>
          <span style={{ fontSize: '12px', color: '#1f5fbf', background: '#eef4ff', border: '1px solid #d8e7ff', borderRadius: '999px', fontWeight: 700, padding: '6px 10px' }}>
            {filteredProducts.length} items
          </span>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div style={{ background: '#fff', padding: '60px', textAlign: 'center', color: '#878787', fontSize: '15px', borderRadius: '0 0 14px 14px', boxShadow: '0 6px 20px rgba(20, 43, 84, 0.08)' }}>
            No products found.
          </div>
        ) : (
          <div className="home-grid-wrap">
            <div className="home-product-grid">
            {filteredProducts.map((product, i) => (
              <div key={product._id}>
                <ProductCard product={product} priority={i < 8} />
              </div>
            ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
