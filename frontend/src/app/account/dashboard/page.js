"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Package, MapPin, Trash2, CheckCircle, Edit2, ShoppingBag, Heart, TrendingUp } from "lucide-react";
import AccountSidebar from "@/components/AccountSidebar";

const STATUS_STYLES = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
  delivered: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

export default function AccountDashboard() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-gray-500">Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [billingEditOpen, setBillingEditOpen] = useState(false);
  const [billingForm, setBillingForm] = useState({ phone: "", address: "", pincode: "" });
  const [savingBilling, setSavingBilling] = useState(false);
  const [billingMessage, setBillingMessage] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderSuccess = searchParams.get("order") === "success";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/account/login"); return; }

    fetch("/api/users/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => {
        if (!data || data.error) { localStorage.removeItem("token"); router.push("/account/login"); }
        else {
          setUser(data);
          setBillingForm({ phone: data.phone || "", address: data.billingAddress?.address || "", pincode: data.billingAddress?.pincode || "" });
          setLoading(false);
        }
      });

    fetch("/api/orders", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data)) setOrders(data); setOrdersLoading(false); })
      .catch(() => setOrdersLoading(false));
  }, [router]);

  const handleBillingSave = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;
    setSavingBilling(true);
    setBillingMessage("");
    try {
      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ phone: billingForm.phone, billingAddress: { address: billingForm.address, pincode: billingForm.pincode } }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");
      setUser(data);
      setBillingForm({ phone: data.phone || "", address: data.billingAddress?.address || "", pincode: data.billingAddress?.pincode || "" });
      setBillingEditOpen(false);
      setBillingMessage("Saved successfully.");
    } catch (err) {
      setBillingMessage(err.message);
    } finally {
      setSavingBilling(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.prompt("Type DELETE to confirm") !== "DELETE") return;
    const token = localStorage.getItem("token");
    if (!token) return;
    setDeletingAccount(true);
    setDeleteError("");
    try {
      const res = await fetch("/api/users/me", { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Failed to delete");
      localStorage.removeItem("token");
      window.dispatchEvent(new Event("storage"));
      router.replace("/");
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeletingAccount(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-500">Loading...</div>;
  if (!user) return <div className="text-center py-20 text-gray-500">User not found.</div>;

  const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const deliveredCount = orders.filter((o) => o.status === "delivered").length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <AccountSidebar user={user} />

        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-6">
          {orderSuccess && (
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
              <CheckCircle size={20} className="text-green-500 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-green-700">Order placed successfully!</p>
                <p className="text-xs text-green-600 mt-0.5">Thank you for your purchase.</p>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <ShoppingBag size={18} className="text-blue-500 mb-2" />
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Total Orders</p>
              <p className="text-xl font-bold text-gray-900 mt-0.5">{orders.length}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <Package size={18} className="text-green-500 mb-2" />
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Delivered</p>
              <p className="text-xl font-bold text-gray-900 mt-0.5">{deliveredCount}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <TrendingUp size={18} className="text-purple-500 mb-2" />
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Total Spent</p>
              <p className="text-xl font-bold text-gray-900 mt-0.5">₹{totalSpent.toLocaleString("en-IN")}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <Heart size={18} className="text-red-400 mb-2" />
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Wishlist</p>
              <p className="text-xl font-bold text-gray-900 mt-0.5">{user.wishlist?.length || 0}</p>
            </div>
          </div>

          {/* Billing Details */}
          <div id="billing" className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <MapPin size={16} className="text-gray-400" />
                Billing & Shipping Address
              </h2>
              {!billingEditOpen && (
                <button onClick={() => setBillingEditOpen(true)} className="text-xs text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1">
                  <Edit2 size={12} /> Edit
                </button>
              )}
            </div>

            {billingEditOpen ? (
              <form onSubmit={handleBillingSave} className="space-y-3">
                <input placeholder="Phone" value={billingForm.phone} onChange={(e) => setBillingForm({ ...billingForm, phone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white" />
                <input placeholder="Address" value={billingForm.address} onChange={(e) => setBillingForm({ ...billingForm, address: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white" />
                <input placeholder="Pincode" value={billingForm.pincode} onChange={(e) => setBillingForm({ ...billingForm, pincode: e.target.value })}
                  className="w-full max-w-[200px] px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white" />
                <div className="flex gap-2 pt-1">
                  <button type="submit" disabled={savingBilling} className="px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60">
                    {savingBilling ? "Saving..." : "Save Address"}
                  </button>
                  <button type="button" onClick={() => { setBillingEditOpen(false); setBillingMessage(""); }}
                    className="px-4 py-2 border border-gray-200 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-50">
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-1.5 text-sm text-gray-700">
                <p><span className="text-gray-400 w-16 inline-block">Phone:</span> {user.phone || "Not set"}</p>
                <p><span className="text-gray-400 w-16 inline-block">Address:</span> {user.billingAddress?.address || "Not set"}</p>
                <p><span className="text-gray-400 w-16 inline-block">Pincode:</span> {user.billingAddress?.pincode || "Not set"}</p>
              </div>
            )}
            {billingMessage && (
              <p className={`mt-3 text-xs font-medium ${billingMessage.includes("success") ? "text-green-600" : "text-red-600"}`}>
                {billingMessage}
              </p>
            )}
          </div>

          {/* Orders */}
          <div id="orders" className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-5">
              <Package size={16} className="text-gray-400" />
              Recent Orders
            </h2>

            {ordersLoading ? (
              <p className="text-center py-8 text-gray-400 text-sm">Loading orders...</p>
            ) : orders.length === 0 ? (
              <div className="text-center py-10">
                <Package size={40} className="mx-auto text-gray-200 mb-3" />
                <p className="text-sm font-medium text-gray-500">No orders yet</p>
                <Link href="/shop" className="text-sm text-blue-600 font-medium mt-2 inline-block hover:text-blue-700">
                  Start Shopping →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 10).map((order) => {
                  const statusClass = STATUS_STYLES[order.status] || STATUS_STYLES.pending;
                  return (
                    <div key={order._id} className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors">
                      <div className="flex items-start justify-between flex-wrap gap-2 mb-3">
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wide">Order ID</p>
                          <p className="text-xs font-mono font-semibold text-gray-700">{order._id?.slice(-10).toUpperCase()}</p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border ${statusClass}`}>
                            {order.status}
                          </span>
                          <p className="text-[10px] text-gray-400 mt-1">
                            {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-3">
                        {order.products?.slice(0, 3).map((p, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gray-50 border border-gray-100 rounded flex items-center justify-center shrink-0">
                              {p.image ? <img src={p.image} alt="" className="max-h-full max-w-full object-contain" /> : <Package size={14} className="text-gray-300" />}
                            </div>
                            <p className="text-xs text-gray-600 truncate flex-1">{p.title || "Product"}</p>
                            <span className="text-xs font-semibold text-gray-800 shrink-0">
                              ₹{((p.price || 0) * (p.quantity || 1)).toLocaleString("en-IN")}
                            </span>
                          </div>
                        ))}
                        {(order.products?.length || 0) > 3 && (
                          <p className="text-[10px] text-gray-400 pl-12">+{order.products.length - 3} more items</p>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                        <span className="text-[10px] text-gray-400 truncate max-w-[50%]">{order.address}</span>
                        <span className="text-sm font-bold text-gray-900">₹{order.total?.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Account Settings / Danger Zone */}
          <div className="bg-white rounded-xl border border-red-100 p-5">
            <h2 className="text-sm font-bold text-red-700 flex items-center gap-2 mb-2">
              <Trash2 size={14} />
              Delete Account
            </h2>
            <p className="text-xs text-gray-500 mb-3">
              This permanently deletes your account, order history, and all data.
            </p>
            <button
              onClick={handleDeleteAccount}
              disabled={deletingAccount}
              className="px-4 py-2 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 disabled:opacity-60"
            >
              {deletingAccount ? "Deleting..." : "Delete Account"}
            </button>
            {deleteError && <p className="mt-2 text-xs text-red-600">{deleteError}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
