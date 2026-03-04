"use client";
import React from "react";
import { useCart } from "../../context/CartContext";

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
        <a href="/" className="text-primary underline">Continue Shopping</a>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Your Cart</h1>
      <table className="w-full mb-8 border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2">Product</th>
            <th className="text-center p-2">Price</th>
            <th className="text-center p-2">Quantity</th>
            <th className="text-center p-2">Total</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {cart.map(({ product, quantity }) => (
            <tr key={product._id} className="border-b">
              <td className="flex items-center gap-3 p-2">
                <img
                  src={
                    product.images && Array.isArray(product.images) && product.images.length > 0
                      ? `http://localhost:4000${product.images[0]}`
                      : product.image || "/no-image.png"
                  }
                  alt={product.name}
                  className="w-14 h-14 object-contain rounded bg-white border"
                />
                <span>{product.name}</span>
              </td>
              <td className="text-center p-2">₹{product.price}</td>
              <td className="text-center p-2">
                <input
                  type="number"
                  min={1}
                  max={product.stock}
                  value={quantity}
                  onChange={e => updateQuantity(product._id, Number(e.target.value))}
                  className="w-16 px-2 py-1 border rounded text-center"
                />
              </td>
              <td className="text-center p-2">₹{product.price * quantity}</td>
              <td className="text-center p-2">
                <button
                  className="text-red-500 hover:underline"
                  onClick={() => removeFromCart(product._id)}
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-between items-center mb-8">
        <button
          className="text-red-500 hover:underline"
          onClick={clearCart}
        >
          Clear Cart
        </button>
        <div className="text-xl font-bold">Total: ₹{total}</div>
      </div>
      <a href="/checkout" className="block w-full">
        <button type="button" className="w-full bg-primary text-white py-3 rounded font-medium text-lg hover:bg-primary/90 transition-colors">
          Proceed to Checkout
        </button>
      </a>
    </div>
  );
}
