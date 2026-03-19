"use client";
import React from "react";
import { useCart } from "../../context/CartContext";

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const savings = cart.reduce((sum, item) => {
    if (item.product.originalPrice) {
      return sum + (item.product.originalPrice - item.product.price) * item.quantity;
    }
    return sum;
  }, 0);
  const deliveryCharge = subtotal >= 499 ? 0 : 40;
  const total = subtotal + deliveryCharge;

  if (cart.length === 0) {
    return (
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '64px 16px', textAlign: 'center' }}>
        <div style={{ fontSize: '72px', marginBottom: '16px' }}>🛒</div>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px', color: '#212121' }}>Your cart is empty!</h2>
        <p style={{ color: '#878787', marginBottom: '24px' }}>Add items to it now.</p>
        <a href="/" style={{ background: '#2874f0', color: '#fff', borderRadius: '2px', padding: '12px 40px', textDecoration: 'none', fontWeight: 600, fontSize: '15px' }}>
          Shop Now
        </a>
      </div>
    );
  }

  return (
    <div style={{ background: '#f1f3f6', minHeight: '100vh', padding: '16px 0' }}>
      <style>{`
        .c9-cart-layout { display: flex; gap: 16px; align-items: flex-start; }
        .c9-cart-summary { width: 360px; min-width: 300px; position: sticky; top: 80px; }
        @media (max-width: 768px) {
          .c9-cart-layout { flex-direction: column; }
          .c9-cart-summary { width: 100% !important; min-width: unset !important; position: static !important; }
        }
      `}</style>
      <div className="c9-cart-layout" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>

        {/* Left: Cart Items */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ background: '#fff', borderRadius: '2px', padding: '14px 20px', marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ fontSize: '18px', fontWeight: 600, color: '#212121', margin: 0 }}>My Cart ({cart.length})</h1>
            <button onClick={clearCart} style={{ color: '#2874f0', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}>Clear Cart</button>
          </div>

          {cart.map(({ product, quantity }) => (
            <div key={product._id} style={{ background: '#fff', borderRadius: '2px', padding: '16px 20px', marginBottom: '4px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <img
                src={
                  product.images && Array.isArray(product.images) && product.images.length > 0 && product.images[0].startsWith('http')
                    ? product.images[0]
                    : product.image || "/no-image.png"
                }
                alt={product.name}
                style={{ width: '96px', height: '96px', objectFit: 'contain', border: '1px solid #f0f0f0', borderRadius: '2px', padding: '4px', flexShrink: 0 }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '15px', color: '#212121', marginBottom: '4px' }}>{product.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '17px', fontWeight: 600, color: '#212121' }}>₹{(product.price * quantity).toLocaleString('en-IN')}</span>
                  {product.originalPrice && <span style={{ fontSize: '13px', color: '#878787', textDecoration: 'line-through' }}>₹{(product.originalPrice * quantity).toLocaleString('en-IN')}</span>}
                  {product.originalPrice && <span style={{ fontSize: '13px', color: '#388e3c', fontWeight: 600 }}>{Math.round((1 - product.price / product.originalPrice) * 100)}% off</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #c2c2c2', borderRadius: '2px' }}>
                    <button
                      onClick={() => quantity > 1 ? updateQuantity(product._id, quantity - 1) : removeFromCart(product._id)}
                      style={{ width: '32px', height: '32px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', fontWeight: 600, color: '#2874f0' }}
                    >−</button>
                    <span style={{ padding: '0 14px', fontSize: '14px', fontWeight: 600, borderLeft: '1px solid #c2c2c2', borderRight: '1px solid #c2c2c2', height: '32px', display: 'flex', alignItems: 'center' }}>{quantity}</span>
                    <button
                      onClick={() => updateQuantity(product._id, quantity + 1)}
                      style={{ width: '32px', height: '32px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', fontWeight: 600, color: '#2874f0' }}
                    >+</button>
                  </div>
                  <button
                    onClick={() => removeFromCart(product._id)}
                    style={{ color: '#878787', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 500 }}
                  >REMOVE</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Price Details */}
        <div className="c9-cart-summary">
          <div style={{ background: '#fff', borderRadius: '2px', padding: '16px 20px' }}>
            <h2 style={{ fontSize: '13px', fontWeight: 600, color: '#878787', borderBottom: '1px solid #e0e0e0', paddingBottom: '14px', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 14px' }}>Price Details</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '15px' }}>
              <span>Price ({cart.length} {cart.length > 1 ? 'items' : 'item'})</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            {savings > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '15px' }}>
                <span>Discount</span>
                <span style={{ color: '#388e3c' }}>− ₹{savings.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '15px' }}>
              <span>Delivery Charges</span>
              {deliveryCharge === 0
                ? <span style={{ color: '#388e3c' }}>FREE</span>
                : <span>₹{deliveryCharge}</span>
              }
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '14px', paddingTop: '14px', borderTop: '1px dashed #e0e0e0', fontWeight: 700, fontSize: '16px' }}>
              <span>Total Amount</span>
              <span>₹{total.toLocaleString('en-IN')}</span>
            </div>
            {savings > 0 && (
              <div style={{ marginTop: '12px', fontSize: '13px', color: '#388e3c', fontWeight: 600 }}>
                You will save ₹{savings.toLocaleString('en-IN')} on this order
              </div>
            )}
          </div>
          <a href="/checkout" style={{ display: 'block', marginTop: '12px', textDecoration: 'none' }}>
            <button style={{ width: '100%', background: '#fb641b', color: '#fff', border: 'none', borderRadius: '2px', padding: '14px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', letterSpacing: '0.5px' }}>
              PLACE ORDER
            </button>
          </a>
        </div>
      </div>
    </div>
  );
}

