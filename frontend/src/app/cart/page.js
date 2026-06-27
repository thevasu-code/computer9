"use client";
import React from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { ShoppingCart, Minus, Plus, Trash2, ArrowRight } from "lucide-react";

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
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16 text-center">
        <ShoppingCart size={64} className="text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
        <p className="text-sm text-gray-500 mb-6">Looks like you haven&apos;t added anything yet.</p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
        >
          Start Shopping <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Shopping Cart ({cart.length})</h1>
        <button
          onClick={clearCart}
          className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-3">
          {cart.map(({ product, quantity }) => {
            const imgSrc = product.images?.[0]?.startsWith("http")
              ? product.images[0]
              : product.image || "/logo.svg";
            const discount = product.originalPrice
              ? Math.round((1 - product.price / product.originalPrice) * 100)
              : null;

            return (
              <div key={product._id} className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 flex gap-4">
                {/* Image */}
                <Link href={`/product/${product.slug || product._id}`} className="shrink-0">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center p-2">
                    <img src={imgSrc} alt={product.name} className="max-h-full max-w-full object-contain" />
                  </div>
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <Link href={`/product/${product.slug || product._id}`} className="block">
                    <h3 className="text-sm font-medium text-gray-800 line-clamp-2 hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>
                  </Link>

                  <div className="mt-2 flex items-baseline gap-2 flex-wrap">
                    <span className="text-lg font-bold text-gray-900">
                      ₹{(product.price * quantity).toLocaleString("en-IN")}
                    </span>
                    {product.originalPrice && (
                      <span className="text-xs text-gray-400 line-through">
                        ₹{(product.originalPrice * quantity).toLocaleString("en-IN")}
                      </span>
                    )}
                    {discount > 0 && (
                      <span className="text-xs text-green-600 font-semibold">{discount}% off</span>
                    )}
                  </div>

                  {/* Quantity + Remove */}
                  <div className="mt-3 flex items-center gap-4">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => quantity > 1 ? updateQuantity(product._id, quantity - 1) : removeFromCart(product._id)}
                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-10 h-8 flex items-center justify-center text-sm font-semibold border-x border-gray-200">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(product._id, quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(product._id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-24">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider pb-4 border-b border-gray-100">
              Order Summary
            </h2>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal ({cart.length} items)</span>
                <span className="font-medium text-gray-900">₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              {savings > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-medium text-green-600">− ₹{savings.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery</span>
                <span className={`font-medium ${deliveryCharge === 0 ? "text-green-600" : "text-gray-900"}`}>
                  {deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-baseline">
              <span className="text-base font-bold text-gray-900">Total</span>
              <span className="text-xl font-bold text-gray-900">₹{total.toLocaleString("en-IN")}</span>
            </div>

            {savings > 0 && (
              <p className="mt-3 text-xs text-green-600 font-medium">
                You save ₹{savings.toLocaleString("en-IN")} on this order
              </p>
            )}

            <Link
              href="/checkout"
              className="mt-5 w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-sm"
            >
              Proceed to Checkout <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
