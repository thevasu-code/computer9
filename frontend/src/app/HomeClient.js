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

  return (
    <div style={{ background: '#f1f3f6', minHeight: '100vh' }}>
      {/* Promo strip */}
      <div style={{ background: '#2874f0', color: '#fff', textAlign: 'center', padding: '4px 0', fontSize: '12px' }}>
        Free delivery on orders above ₹499 &nbsp;|&nbsp; 10% off on first order &nbsp;|&nbsp; EMI available on orders above ₹3000
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
        {/* Category strip */}
        <div style={{ background: '#fff', margin: '10px 0 6px', borderRadius: '2px', overflowX: 'auto', display: 'flex', alignItems: 'stretch', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', scrollbarWidth: 'none' }}>
          <button
            onClick={() => setSelectedCategory("")}
            style={{ minWidth: '80px', padding: '14px 8px 10px', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', borderBottom: !selectedCategory ? '3px solid #2874f0' : '3px solid transparent', color: !selectedCategory ? '#2874f0' : '#212121', fontWeight: !selectedCategory ? 600 : 400, fontSize: '13px' }}
          >
            <span style={{ fontSize: '22px' }}>🏠</span>All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{ minWidth: '80px', padding: '14px 8px 10px', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', borderBottom: selectedCategory === cat ? '3px solid #2874f0' : '3px solid transparent', color: selectedCategory === cat ? '#2874f0' : '#212121', fontWeight: selectedCategory === cat ? 600 : 400, fontSize: '13px', whiteSpace: 'nowrap' }}
            >
              <span style={{ fontSize: '22px' }}>{CATEGORY_ICONS[cat] || '📦'}</span>
              {cat}
            </button>
          ))}
        </div>

        {/* Promo Banner */}
        {!selectedCategory && (
          <div style={{ background: 'linear-gradient(135deg, #2874f0 0%, #0050c8 60%, #ff9f00 100%)', borderRadius: '4px', padding: '24px 32px', margin: '6px 0 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fff' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '2px', opacity: 0.8 }}>EXCLUSIVE DEALS</div>
              <div style={{ fontSize: '30px', fontWeight: 700, lineHeight: 1.2, marginTop: '6px' }}>Best of Computers</div>
              <div style={{ fontSize: '14px', opacity: 0.88, marginTop: '6px' }}>Top deals on Laptops, PCs &amp; Hardware</div>
            </div>
            <div style={{ fontSize: '60px' }}>💻</div>
          </div>
        )}

        {/* Section header */}
        <div style={{ background: '#fff', borderRadius: '2px 2px 0 0', padding: '14px 16px 0', borderBottom: '3px solid #2874f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '18px', fontWeight: 700, color: '#212121' }}>
            {selectedCategory || 'All Products'}
          </span>
          <span style={{ fontSize: '13px', color: '#2874f0', fontWeight: 500 }}>{filteredProducts.length} items</span>
        </div>

        {/* Product Grid */}
        <style>{`
          .c9-product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1px; padding: 8px; background: #fff; }
          .c9-product-grid > div { min-width: 0; overflow: hidden; }
          @media (max-width: 480px) {
            .c9-product-grid { grid-template-columns: repeat(2, 1fr); padding: 4px; }
            .c9-product-grid > div { padding: 3px !important; }
            .c9-card-img { height: 120px !important; }
            .c9-card-title { font-size: 12px !important; }
            .c9-card-price { font-size: 13px !important; }
            .c9-card-btn { font-size: 11px !important; padding: 7px 0 !important; }
          }
        `}</style>
        {filteredProducts.length === 0 ? (
          <div style={{ background: '#fff', padding: '60px', textAlign: 'center', color: '#878787', fontSize: '15px' }}>
            No products found.
          </div>
        ) : (
          <div className="c9-product-grid">
            {filteredProducts.map((product, i) => (
              <div key={product._id} style={{ padding: '6px', background: '#fff' }}>
                <ProductCard product={product} priority={i < 8} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
