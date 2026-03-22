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
  const category = product.category || "General";
  const type = product.type || product.subcategory || category;
  const showTypeTag = String(type).trim().toLowerCase() !== String(category).trim().toLowerCase();

  const discount = product.originalPrice && product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff',
        border: hovered ? '1px solid #a9c9ff' : '1px solid #e7edf7',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '12px',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease',
        boxShadow: hovered ? '0 14px 28px rgba(25, 65, 130, 0.14)' : '0 3px 10px rgba(21, 47, 89, 0.07)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        minWidth: 0,
        overflow: 'hidden',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <Link href={`/product/${product._id}`} style={{ textDecoration: 'none', width: '100%', minWidth: 0 }}>
        <div
          className="c9-card-img"
          style={{
            width: '100%',
            height: '190px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px',
            marginBottom: '8px',
            borderRadius: '12px',
            background: 'linear-gradient(180deg, #f8fbff 0%, #f2f7ff 100%)',
            border: '1px solid #ebf1fb',
          }}
        >
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
          {showTypeTag && (
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#1f5fbf', background: '#edf4ff', border: '1px solid #d8e7ff', borderRadius: '999px', padding: '4px 8px' }}>
              {type}
            </span>
          )}
          <span style={{ fontSize: '10px', fontWeight: 700, color: '#935304', background: '#fff3df', border: '1px solid #ffe2ba', borderRadius: '999px', padding: '4px 8px' }}>
            {category}
          </span>
        </div>
        <div className="c9-card-title" style={{ fontSize: '14px', color: '#212121', fontWeight: 400, lineHeight: '20px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', minHeight: '40px', width: '100%', minWidth: 0 }} title={product.name}>
          {product.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', width: '100%', gap: '4px', marginTop: '6px', flexWrap: 'wrap', minWidth: 0, textAlign: 'center' }}>
          <span className="c9-card-price" style={{ fontSize: '18px', fontWeight: 800, color: '#10284d' }}>₹{product.price?.toLocaleString('en-IN')}</span>
          {product.originalPrice && (
            <span style={{ fontSize: '11px', color: '#878787', textDecoration: 'line-through' }}>₹{product.originalPrice?.toLocaleString('en-IN')}</span>
          )}
          {discount > 0 && (
            <span style={{ fontSize: '11px', color: '#1f8b3f', fontWeight: 700, background: '#ecfaef', borderRadius: '999px', padding: '2px 7px' }}>{discount}% off</span>
          )}
        </div>
      </Link>
      <button
        className="c9-card-btn"
        style={{ marginTop: '12px', width: '100%', background: added ? '#1f8b3f' : 'linear-gradient(135deg, #ff9f00, #f38000)', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 0', fontSize: '13px', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.5px', transition: 'opacity 0.15s' }}
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
        <Link href="/cart" style={{ marginTop: '8px', width: '100%', display: 'block', textAlign: 'center', background: '#fff', color: '#1f5fbf', border: '1px solid #98bffd', borderRadius: '10px', padding: '9px 0', fontSize: '13px', fontWeight: 700, textDecoration: 'none', letterSpacing: '0.4px', transition: 'background 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#e8f0fe'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
        >
          VIEW CART
        </Link>
      )}
    </div>
  );
}

