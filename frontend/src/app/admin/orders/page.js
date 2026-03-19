"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

const STATUS_STYLE = {
  pending:   { bg: '#fff8e1', color: '#f57f17' },
  confirmed: { bg: '#e3f2fd', color: '#1565c0' },
  shipped:   { bg: '#e8f5e9', color: '#2e7d32' },
  delivered: { bg: '#e8f5e9', color: '#1b5e20' },
  cancelled: { bg: '#ffebee', color: '#c62828' },
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) { router.push('/admin/login'); return; }
    fetch('/api/admin/orders', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) {
          setError(data.error || 'Failed to load orders.');
        } else {
          setOrders(data);
        }
        setLoading(false);
      })
      .catch(() => { setError('Failed to load orders.'); setLoading(false); });
  }, [router]);

  const handleStatusChange = async (orderId, newStatus) => {
    const token = localStorage.getItem('adminToken');
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/status/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = orders.filter(o => {
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      o._id?.toLowerCase().includes(q) ||
      o.user?.name?.toLowerCase().includes(q) ||
      o.user?.email?.toLowerCase().includes(q) ||
      o.address?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const totalRevenue = filtered.reduce((s, o) => s + (o.total || 0), 0);

  if (loading) return <div style={{ textAlign: 'center', padding: '60px 0', color: '#878787' }}>Loading orders...</div>;
  if (error) return <div style={{ textAlign: 'center', padding: '60px 0', color: '#c62828' }}>{error}</div>;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#212121' }}>Manage Orders</h1>
        <a href="/admin" style={{ fontSize: '13px', color: '#2874f0', textDecoration: 'none' }}>← Back to Dashboard</a>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        {[['Total Orders', orders.length, '#2874f0'], ['Filtered Orders', filtered.length, '#ff9f00'], ['Filtered Revenue', `₹${totalRevenue.toLocaleString('en-IN')}`, '#26a541']].map(([label, val, color]) => (
          <div key={label} style={{ background: '#fff', borderRadius: '4px', padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', borderTop: `4px solid ${color}` }}>
            <div style={{ fontSize: '12px', color: '#878787', marginBottom: '4px' }}>{label}</div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#212121' }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search by order ID, user, address…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '200px', border: '1px solid #ddd', borderRadius: '4px', padding: '8px 12px', fontSize: '13px', outline: 'none' }}
        />
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '8px 12px', fontSize: '13px', background: '#fff', cursor: 'pointer' }}
        >
          <option value="all">All statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      {/* Orders table */}
      {filtered.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: '4px', padding: '40px', textAlign: 'center', color: '#878787', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>No orders found.</div>
      ) : (
        <div style={{ background: '#fff', borderRadius: '4px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.4fr 1fr 1.4fr 1fr 40px', gap: '0', background: '#f1f3f6', padding: '10px 16px', fontSize: '12px', fontWeight: 700, color: '#878787', textTransform: 'uppercase' }}>
            <span>Order ID</span><span>Customer</span><span>Total</span><span>Status</span><span>Date</span><span></span>
          </div>

          {filtered.map((o, idx) => {
            const style = STATUS_STYLE[o.status] || STATUS_STYLE.pending;
            const isExpanded = expandedId === o._id;
            return (
              <div key={o._id} style={{ borderTop: idx === 0 ? 'none' : '1px solid #f0f0f0' }}>
                {/* Row */}
                <div
                  style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.4fr 1fr 1.4fr 1fr 40px', gap: '0', padding: '12px 16px', alignItems: 'center', cursor: 'pointer' }}
                  onClick={() => setExpandedId(isExpanded ? null : o._id)}
                >
                  <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#444' }}>{o._id?.slice(-10).toUpperCase()}</span>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#212121' }}>{o.user?.name || '—'}</div>
                    <div style={{ fontSize: '11px', color: '#878787' }}>{o.user?.email || ''}</div>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#212121' }}>₹{(o.total || 0).toLocaleString('en-IN')}</span>
                  <span>
                    <select
                      value={o.status || 'pending'}
                      disabled={updatingId === o._id}
                      onClick={e => e.stopPropagation()}
                      onChange={e => handleStatusChange(o._id, e.target.value)}
                      style={{ background: style.bg, color: style.color, border: 'none', borderRadius: '12px', padding: '4px 10px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', outline: 'none' }}
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                    {updatingId === o._id && <span style={{ fontSize: '11px', color: '#aaa', marginLeft: '6px' }}>saving…</span>}
                  </span>
                  <span style={{ fontSize: '11px', color: '#878787' }}>
                    {new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                  <span style={{ fontSize: '18px', color: '#aaa', textAlign: 'center' }}>{isExpanded ? '▲' : '▼'}</span>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div style={{ background: '#fafafa', borderTop: '1px solid #f0f0f0', padding: '16px 20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '14px' }}>
                      <div>
                        <div style={{ fontSize: '12px', color: '#878787', marginBottom: '4px' }}>Delivery Address</div>
                        <div style={{ fontSize: '13px', color: '#212121' }}>{o.address || '—'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#878787', marginBottom: '4px' }}>Payment Info</div>
                        <div style={{ fontSize: '12px', color: '#444' }}>
                          {o.paymentInfo?.razorpayPaymentId ? (
                            <><span style={{ fontWeight: 600 }}>Razorpay ID:</span> {o.paymentInfo.razorpayPaymentId}<br /></>
                          ) : null}
                          {o.paymentInfo?.name && <><span style={{ fontWeight: 600 }}>Name:</span> {o.paymentInfo.name}<br /></>}
                          {o.paymentInfo?.phone && <><span style={{ fontWeight: 600 }}>Phone:</span> {o.paymentInfo.phone}</>}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#878787', marginBottom: '8px', fontWeight: 700 }}>Items ({o.products?.length || 0})</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {(o.products || []).map((p, i) => {
                        const productId = typeof p.product === 'object' ? p.product?._id : p.product;
                        const name = p.title || p.product?.name || 'Product';
                        const img = p.image || p.product?.images?.[0] || null;
                        return (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', padding: '10px 12px', borderRadius: '4px', border: '1px solid #f0f0f0' }}>
                            {/* Product image */}
                            <div style={{ width: 52, height: 52, flexShrink: 0, border: '1px solid #eee', borderRadius: '4px', overflow: 'hidden', background: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {img ? (
                                <img src={img} alt={name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                              ) : (
                                <span style={{ fontSize: '20px' }}>📦</span>
                              )}
                            </div>
                            {/* Product name + link */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              {productId ? (
                                <a href={`/product/${productId}`} target="_blank" rel="noreferrer"
                                  style={{ fontSize: '13px', fontWeight: 600, color: '#2874f0', textDecoration: 'none', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                  onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                                  onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                                >
                                  {name}
                                </a>
                              ) : (
                                <span style={{ fontSize: '13px', fontWeight: 600, color: '#212121', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                              )}
                              <div style={{ fontSize: '12px', color: '#878787', marginTop: '2px' }}>Qty: {p.quantity || 1} × ₹{(p.price || 0).toLocaleString('en-IN')}</div>
                            </div>
                            {/* Subtotal */}
                            <div style={{ fontWeight: 700, fontSize: '13px', color: '#212121', flexShrink: 0 }}>
                              ₹{((p.price || 0) * (p.quantity || 1)).toLocaleString('en-IN')}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ borderTop: '1px dashed #e0e0e0', marginTop: '10px', paddingTop: '10px', display: 'flex', justifyContent: 'flex-end', fontSize: '14px', fontWeight: 700, color: '#212121' }}>
                      Total: ₹{(o.total || 0).toLocaleString('en-IN')}
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
