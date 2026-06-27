"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { Shield, CreditCard, AlertCircle } from "lucide-react";

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const [billing, setBilling] = useState({ name: "", email: "", address: "", phone: "", pincode: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [billingEditMode, setBillingEditMode] = useState(true);
  const [saveToAccount, setSaveToAccount] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const router = useRouter();
  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  useEffect(() => {
    if (!window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    setLoggedIn(!!token);
    if (token) {
      fetch("/api/users/me", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" })
        .then((res) => res.json())
        .then((data) => {
          if (!data || data.error) return;
          const saved = {
            name: data.name || "",
            email: data.email || "",
            phone: data.phone || "",
            address: data.billingAddress?.address || "",
            pincode: data.billingAddress?.pincode || "",
          };
          setBilling((prev) => ({ ...prev, ...saved }));
          const hasSaved = Boolean(saved.phone || saved.address || saved.pincode);
          setBillingEditMode(!hasSaved);
        })
        .catch(() => {});
    }
  }, []);

  const handleInput = (e) => setBilling({ ...billing, [e.target.name]: e.target.value });

  const saveBillingProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    await fetch("/api/users/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ phone: billing.phone, billingAddress: { address: billing.address, pincode: billing.pincode } }),
    });
  };

  const handleRazorpay = async () => {
    setLoading(true);
    setError("");
    try {
      if (loggedIn && saveToAccount) await saveBillingProfile();

      const res = await fetch("/api/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total, billing, cart }),
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
          try {
            const token = localStorage.getItem("token");
            await fetch("/api/orders", {
              method: "POST",
              headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
              body: JSON.stringify({
                items: cart.map((item) => ({ product: item.product._id, quantity: item.quantity, price: item.product.price })),
                total,
                billing,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
              }),
            });
          } catch { /* ignore */ }
          clearCart();
          router.push("/account/dashboard?order=success");
        },
        prefill: { name: billing.name, email: billing.email, contact: billing.phone },
        notes: { address: billing.address, pincode: billing.pincode },
        theme: { color: "#2563eb" },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isFormComplete = billing.name && billing.email && billing.phone && billing.address && billing.pincode;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left: Billing */}
        <div className="lg:col-span-3">
          {!loggedIn && (
            <div className="mb-6 flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">Guest checkout</p>
                <p className="text-xs text-amber-600 mt-0.5">
                  <Link href="/account/login" className="underline font-semibold">Sign in</Link> for a faster experience with saved details.
                </p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-bold text-gray-900 mb-5">Billing Details</h2>

            {loggedIn && !billingEditMode ? (
              <div className="space-y-2 text-sm">
                <div><span className="text-gray-500 w-20 inline-block">Name:</span> {billing.name}</div>
                <div><span className="text-gray-500 w-20 inline-block">Email:</span> {billing.email}</div>
                <div><span className="text-gray-500 w-20 inline-block">Phone:</span> {billing.phone || "—"}</div>
                <div><span className="text-gray-500 w-20 inline-block">Address:</span> {billing.address || "—"}</div>
                <div><span className="text-gray-500 w-20 inline-block">Pincode:</span> {billing.pincode || "—"}</div>
                <button
                  onClick={() => setBillingEditMode(true)}
                  className="mt-3 text-sm text-blue-600 font-semibold hover:text-blue-700"
                >
                  Edit Details
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Full Name</label>
                  <input name="name" value={billing.name} onChange={handleInput} required
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Email</label>
                  <input name="email" type="email" value={billing.email} onChange={handleInput} required
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Phone</label>
                  <input name="phone" type="tel" value={billing.phone} onChange={handleInput} required
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Address</label>
                  <textarea name="address" value={billing.address} onChange={handleInput} rows={3} required
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all resize-none" />
                </div>
                <div className="max-w-[200px]">
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Pincode</label>
                  <input name="pincode" value={billing.pincode} onChange={handleInput} required
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all" />
                </div>

                {loggedIn && (
                  <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input type="checkbox" checked={saveToAccount} onChange={(e) => setSaveToAccount(e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
                    Save to my account for faster checkout
                  </label>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Summary */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-24">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider pb-4 border-b border-gray-100">
              Order Summary
            </h2>

            <div className="mt-4 space-y-3 max-h-60 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.product._id} className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center p-1 shrink-0">
                    <img
                      src={item.product.images?.[0]?.startsWith("http") ? item.product.images[0] : "/logo.svg"}
                      alt="" className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-700 truncate">{item.product.name}</p>
                    <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 shrink-0">
                    ₹{(item.product.price * item.quantity).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-baseline">
              <span className="text-base font-bold text-gray-900">Total</span>
              <span className="text-xl font-bold text-gray-900">₹{total.toLocaleString("en-IN")}</span>
            </div>

            {error && (
              <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button
              onClick={handleRazorpay}
              disabled={loading || !isFormComplete || cart.length === 0}
              className="mt-5 w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            >
              <CreditCard size={16} />
              {loading ? "Processing..." : "Pay with Razorpay"}
            </button>

            <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-gray-400">
              <Shield size={12} />
              Secure payment powered by Razorpay
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
