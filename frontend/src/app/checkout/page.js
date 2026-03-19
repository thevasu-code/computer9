"use client";
import React, { useState, useEffect } from "react";
import { useCart } from "../../context/CartContext";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  useEffect(() => {
    if (!window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);
  const { cart, clearCart } = useCart();
  const [billing, setBilling] = useState({ name: "", email: "", address: "", phone: "", pincode: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    setLoggedIn(!!token);
  }, []);

  const handleInput = (e) => {
    setBilling({ ...billing, [e.target.name]: e.target.value });
  };

  const handleRazorpay = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total,
          billing,
          cart,
        }),
      });
      const data = await res.json();
      if (!data.order) throw new Error(data.error || "Payment error");
      const options = {
        key: data.key,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Computer9.in",
        description: "Order Payment",
        order_id: data.order.id,
        handler: async function (response) {
          // Save order to DB
          try {
            const token = localStorage.getItem("token");
            await fetch("/api/orders", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              body: JSON.stringify({
                items: cart.map(item => ({
                  product: item.product._id,
                  quantity: item.quantity,
                  price: item.product.price,
                })),
                total,
                billing,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
              }),
            });
          } catch {}
          clearCart();
          router.push("/account/dashboard?order=success");
        },
        prefill: {
          name: billing.name,
          email: billing.email,
          contact: billing.phone,
        },
        notes: {
          address: billing.address,
          pincode: billing.pincode,
        },
        theme: { color: "#6366f1" },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Checkout</h1>
      {/* Enhanced Order Summary Card View */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
        {cart.length === 0 ? (
          <div className="text-gray-500">Your cart is empty.</div>
        ) : (
          <div className="space-y-4">
            {cart.map((item, idx) => (
              <div key={idx} className="flex items-center bg-gradient-to-r from-gray-100 to-gray-200 shadow-lg rounded-xl p-4 border border-gray-300">
                <div className="w-20 h-20 flex items-center justify-center bg-white rounded-lg border mr-4">
                  <img
                    src={item.product.images?.[0]?.startsWith('http') ? item.product.images[0] : "/placeholder.png"}
                    alt={item.product.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-lg mb-1">{item.product.title}</div>
                  <div className="text-gray-600 mb-1">Quantity: <span className="font-medium">{item.quantity}</span></div>
                  <div className="text-gray-800 font-semibold">₹{item.product.price} x {item.quantity} <span className="ml-2">= ₹{item.product.price * item.quantity}</span></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Billing Form */}
      {!loggedIn && (
        <div className="mb-8 p-4 bg-orange-100 border-l-4 border-orange-500 rounded">
          <div className="mb-2 text-orange-700 font-semibold">You must login or fill billing details to proceed.</div>
          <a href="/account" className="text-primary underline font-medium">Login</a>
        </div>
      )}
      <form className="space-y-4 mb-8" onSubmit={e => e.preventDefault()}>
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={billing.name}
          onChange={handleInput}
          className="w-full border rounded px-3 py-2"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={billing.email}
          onChange={handleInput}
          className="w-full border rounded px-3 py-2"
          required
        />
        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          value={billing.phone}
          onChange={handleInput}
          className="w-full border rounded px-3 py-2"
          required
        />
        <textarea
          name="address"
          placeholder="Billing Address"
          value={billing.address}
          onChange={handleInput}
          className="w-full border rounded px-3 py-2"
          required
        />
        <input
          type="text"
          name="pincode"
          placeholder="Pin Code"
          value={billing.pincode}
          onChange={handleInput}
          className="w-full border rounded px-3 py-2"
          required
        />
      </form>
      <div className="mb-6 text-xl font-bold text-right">Total: ₹{total}</div>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <button
        className="w-full bg-primary text-white py-3 rounded font-medium text-lg hover:bg-primary/90 transition-colors disabled:opacity-60"
        onClick={handleRazorpay}
        disabled={
          loading ||
          !billing.name ||
          !billing.email ||
          !billing.phone ||
          !billing.address ||
          !billing.pincode
        }
      >
        {loading ? "Processing..." : "Pay with Razorpay"}
      </button>
    </div>
  );
}
