"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronDown, ChevronUp, Package } from "lucide-react";

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
const STATUS_STYLES = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
  delivered: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/account/login"); return; }
    fetch("/api/admin/orders", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setOrders(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [router]);

  const handleStatusChange = async (orderId, newStatus) => {
    const token = localStorage.getItem("token");
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/status/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) setOrders(orders.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o)));
    } catch { /* ignore */ }
    finally { setUpdatingId(null); }
  };

  const filtered = orders.filter((o) => {
    const matchStatus = filterStatus === "all" || o.status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch = !q || o._id?.toLowerCase().includes(q) || o.user?.name?.toLowerCase().includes(q) || o.address?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const totalRevenue = filtered.reduce((s, o) => s + (o.total || 0), 0);

  if (loading) return <div className="p-8 text-center text-gray-400">Loading orders...</div>;

  return (
    <div className="p-6 lg:p-8 max-w-full">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Orders</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">Total Orders</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{orders.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">Filtered</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{filtered.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">Revenue</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">₹{totalRevenue.toLocaleString("en-IN")}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        >
          <option value="all">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      {/* Orders Table */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">No orders found.</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="hidden sm:grid grid-cols-[1.5fr_1.5fr_1fr_1.2fr_1fr_40px] gap-2 px-5 py-3 bg-gray-50 border-b border-gray-100 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            <span>Order ID</span><span>Customer</span><span>Total</span><span>Status</span><span>Date</span><span></span>
          </div>

          {filtered.map((o) => {
            const isExpanded = expandedId === o._id;
            const statusClass = STATUS_STYLES[o.status] || STATUS_STYLES.pending;
            return (
              <div key={o._id} className="border-b border-gray-50 last:border-0">
                <div
                  className="grid grid-cols-1 sm:grid-cols-[1.5fr_1.5fr_1fr_1.2fr_1fr_40px] gap-2 px-5 py-3.5 items-center cursor-pointer hover:bg-gray-50/50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : o._id)}
                >
                  <span className="text-xs font-mono font-medium text-gray-700">{o._id?.slice(-10).toUpperCase()}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800 truncate">{o.user?.name || "Guest"}</p>
                    <p className="text-[10px] text-gray-400 truncate">{o.user?.email || ""}</p>
                  </div>
                  <span className="text-sm font-bold text-gray-900">₹{(o.total || 0).toLocaleString("en-IN")}</span>
                  <div onClick={(e) => e.stopPropagation()}>
                    <select
                      value={o.status || "pending"}
                      disabled={updatingId === o._id}
                      onChange={(e) => handleStatusChange(o._id, e.target.value)}
                      className={`text-[11px] font-bold uppercase tracking-wide px-3 py-1.5 rounded-full border cursor-pointer focus:outline-none ${statusClass}`}
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                  </span>
                  <span className="text-gray-300">
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </span>
                </div>

                {isExpanded && (
                  <div className="px-5 pb-4 pt-1 bg-gray-50/50">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Delivery Address</p>
                        <p className="text-gray-700">{o.address || "—"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Payment</p>
                        <p className="text-gray-700 text-xs">
                          {o.paymentInfo?.razorpayPaymentId ? `Razorpay: ${o.paymentInfo.razorpayPaymentId}` : "—"}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {(o.products || []).map((p, i) => (
                        <div key={i} className="flex items-center gap-3 bg-white rounded-lg border border-gray-100 p-3">
                          <div className="w-10 h-10 bg-gray-50 rounded border border-gray-100 flex items-center justify-center shrink-0">
                            {p.image ? <img src={p.image} alt="" className="max-h-full max-w-full object-contain" /> : <Package size={16} className="text-gray-300" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-700 truncate">{p.title || "Product"}</p>
                            <p className="text-[10px] text-gray-400">Qty: {p.quantity} × ₹{(p.price || 0).toLocaleString("en-IN")}</p>
                          </div>
                          <span className="text-xs font-bold text-gray-800">₹{((p.price || 0) * (p.quantity || 1)).toLocaleString("en-IN")}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
