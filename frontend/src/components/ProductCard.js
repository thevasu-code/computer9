"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "../context/CartContext";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [hovered, setHovered] = useState(false);

  const discount = product.originalPrice && product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: '2px', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px', cursor: 'pointer', transition: 'box-shadow 0.15s', boxShadow: hovered ? '0 4px 16px rgba(0,0,0,0.12)' : 'none' }}
    >
      <Link href={`/product/${product._id}`} style={{ textDecoration: 'none', width: '100%' }}>
        <div style={{ width: '100%', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', marginBottom: '8px' }}>
          <img
            src={
              product.images && Array.isArray(product.images) && product.images.length > 0 && product.images[0].startsWith('http')
                ? product.images[0]
                : product.image || "/no-image.png"
            }
            alt={product.name}
            style={{ maxHeight: '164px', maxWidth: '100%', objectFit: 'contain', transition: 'transform 0.2s', transform: hovered ? 'scale(1.05)' : 'scale(1)' }}
            loading="lazy"
          />
        </div>
        <div style={{ fontSize: '14px', color: '#212121', fontWeight: 400, lineHeight: '20px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }} title={product.name}>
          {product.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '5px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '16px', fontWeight: 500, color: '#212121' }}>₹{product.price?.toLocaleString('en-IN')}</span>
          {product.originalPrice && (
            <span style={{ fontSize: '12px', color: '#878787', textDecoration: 'line-through' }}>₹{product.originalPrice?.toLocaleString('en-IN')}</span>
          )}
          {discount > 0 && (
            <span style={{ fontSize: '12px', color: '#388e3c', fontWeight: 600 }}>{discount}% off</span>
          )}
        </div>
      </Link>
      <button
        style={{ marginTop: '10px', width: '100%', background: added ? '#388e3c' : '#ff9f00', color: '#fff', border: 'none', borderRadius: '2px', padding: '9px 0', fontSize: '13px', fontWeight: 600, cursor: 'pointer', letterSpacing: '0.5px', transition: 'background 0.15s' }}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          addToCart(product, 1);
          setAdded(true);
          setTimeout(() => setAdded(false), 1200);
        }}
        disabled={added}
      >
        {added ? "✓ ADDED" : "ADD TO CART"}
      </button>
    </div>
  );
}

