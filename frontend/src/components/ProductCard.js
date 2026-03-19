"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "../context/CartContext";

function optimizeCloudinary(url, width = 400) {
  if (!url || !url.includes('res.cloudinary.com')) return url;
  return url.replace('/upload/', `/upload/c_fit,w_${width},f_auto,q_auto/`);
}

export default function ProductCard({ product, priority = false }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [showViewCart, setShowViewCart] = useState(false);
  const [hovered, setHovered] = useState(false);

  const discount = product.originalPrice && product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: '2px', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px', cursor: 'pointer', transition: 'box-shadow 0.15s', boxShadow: hovered ? '0 4px 16px rgba(0,0,0,0.12)' : 'none', minWidth: 0, overflow: 'hidden', width: '100%', boxSizing: 'border-box' }}
    >
      <Link href={`/product/${product._id}`} style={{ textDecoration: 'none', width: '100%', minWidth: 0 }}>
        <div className="c9-card-img" style={{ width: '100%', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', marginBottom: '8px' }}>
          <img
            src={optimizeCloudinary(
              product.images && Array.isArray(product.images) && product.images.length > 0 && product.images[0].startsWith('http')
                ? product.images[0]
                : product.image || "/no-image.png"
            )}
            alt={product.name}
            style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', transition: 'transform 0.2s', transform: hovered ? 'scale(1.05)' : 'scale(1)' }}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            decoding={priority ? "sync" : "async"}
          />
        </div>
        <div className="c9-card-title" style={{ fontSize: '14px', color: '#212121', fontWeight: 400, lineHeight: '20px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%', minWidth: 0 }} title={product.name}>
          {product.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '5px', flexWrap: 'wrap', minWidth: 0 }}>
          <span className="c9-card-price" style={{ fontSize: '15px', fontWeight: 500, color: '#212121' }}>₹{product.price?.toLocaleString('en-IN')}</span>
          {product.originalPrice && (
            <span style={{ fontSize: '11px', color: '#878787', textDecoration: 'line-through' }}>₹{product.originalPrice?.toLocaleString('en-IN')}</span>
          )}
          {discount > 0 && (
            <span style={{ fontSize: '11px', color: '#388e3c', fontWeight: 600 }}>{discount}% off</span>
          )}
        </div>
      </Link>
      <button
        className="c9-card-btn"
        style={{ marginTop: '10px', width: '100%', background: added ? '#388e3c' : '#ff9f00', color: '#fff', border: 'none', borderRadius: '2px', padding: '9px 0', fontSize: '13px', fontWeight: 600, cursor: 'pointer', letterSpacing: '0.5px', transition: 'background 0.15s' }}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          addToCart(product, 1);
          setAdded(true);
          setShowViewCart(true);
          setTimeout(() => setAdded(false), 1200);
        }}
        disabled={added}
      >
        {added ? "✓ ADDED" : "ADD TO CART"}
      </button>
      {showViewCart && (
        <Link href="/cart" style={{ marginTop: '6px', width: '100%', display: 'block', textAlign: 'center', background: '#fff', color: '#2874f0', border: '1px solid #2874f0', borderRadius: '2px', padding: '8px 0', fontSize: '13px', fontWeight: 600, textDecoration: 'none', letterSpacing: '0.5px', transition: 'background 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#e8f0fe'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
        >
          VIEW CART
        </Link>
      )}
    </div>
  );
}

