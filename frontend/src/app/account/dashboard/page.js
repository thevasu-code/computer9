"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const STATUS_COLORS = {
  pending:    { bg: '#fff8e1', color: '#f57f17', label: 'Pending' },
  confirmed:  { bg: '#e3f2fd', color: '#1565c0', label: 'Confirmed' },
  shipped:    { bg: '#e8f5e9', color: '#2e7d32', label: 'Shipped' },
  delivered:  { bg: '#e8f5e9', color: '#1b5e20', label: 'Delivered' },
  cancelled:  { bg: '#ffebee', color: '#c62828', label: 'Cancelled' },
};

export default function AccountDashboard() {
  return (
    <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
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
    if (!token) {
      router.push("/account/login");
      return;
    }
    // Fetch user profile
    fetch("/api/users/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        if (!data || data.error) {
          localStorage.removeItem("token");
          router.push("/account/login");
        } else {
          setUser(data);
          setBillingForm({
            phone: data.phone || "",
            address: data.billingAddress?.address || "",
            pincode: data.billingAddress?.pincode || "",
          });
          setLoading(false);
        }
      });
    // Fetch order history
    fetch("/api/orders", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setOrders(data);
        setOrdersLoading(false);
      })
      .catch(() => setOrdersLoading(false));
  }, [router]);

  const handleBillingChange = (e) => {
    const { name, value } = e.target;
    setBillingForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBillingSave = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/account/login");
      return;
    }

    setSavingBilling(true);
    setBillingMessage("");
    try {
      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          phone: billingForm.phone,
          billingAddress: {
            address: billingForm.address,
            pincode: billingForm.pincode,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update billing details");
      setUser(data);
      setBillingForm({
        phone: data.phone || "",
        address: data.billingAddress?.address || "",
        pincode: data.billingAddress?.pincode || "",
      });
      setBillingEditOpen(false);
      setBillingMessage("Billing details updated successfully.");
    } catch (err) {
      setBillingMessage(err.message || "Failed to update billing details.");
    } finally {
      setSavingBilling(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = window.prompt('Type DELETE to confirm account deletion');
    if (confirmation !== 'DELETE') return;

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/account/login");
      return;
    }

    setDeletingAccount(true);
    setDeleteError("");
    try {
      const res = await fetch("/api/users/me", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete account");
      localStorage.removeItem("token");
      localStorage.removeItem("adminToken");
      window.dispatchEvent(new Event("storage"));
      router.replace("/");
    } catch (err) {
      setDeleteError(err.message || "Failed to delete account.");
    } finally {
      setDeletingAccount(false);
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (!user) return <div className="text-center py-12">User not found.</div>;

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Account Dashboard</h1>

      {orderSuccess && (
        <div style={{ background: '#e8f5e9', border: '1px solid #a5d6a7', borderRadius: '4px', padding: '16px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>✅</span>
          <div>
            <div style={{ fontWeight: 600, color: '#2e7d32', fontSize: '16px' }}>Order placed successfully!</div>
            <div style={{ color: '#388e3c', fontSize: '13px', marginTop: '2px' }}>Thank you for your purchase. Your order is being processed.</div>
          </div>
        </div>
      )}

      {/* Profile card */}
      <div style={{ background: '#fff', borderRadius: '4px', padding: '20px 24px', marginBottom: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#2874f0', color: '#fff', fontSize: '24px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {user.name?.[0]?.toUpperCase() || 'U'}
        </div>
        <div>
          <div style={{ fontSize: '18px', fontWeight: 600, color: '#212121' }}>{user.name}</div>
          <div style={{ fontSize: '13px', color: '#878787', marginTop: '2px' }}>{user.email}</div>
        </div>
      </div>

      {/* Billing details */}
      <div style={{ background: '#fff', borderRadius: '4px', padding: '20px 24px', marginBottom: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#212121' }}>Billing Details</h2>
          {!billingEditOpen ? (
            <button
              onClick={() => setBillingEditOpen(true)}
              style={{ border: '1px solid #2874f0', color: '#2874f0', background: '#fff', borderRadius: '4px', padding: '6px 12px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
            >
              Edit
            </button>
          ) : null}
        </div>

        {billingEditOpen ? (
          <form onSubmit={handleBillingSave} style={{ display: 'grid', gap: '10px' }}>
            <input
              name="phone"
              placeholder="Phone number"
              value={billingForm.phone}
              onChange={handleBillingChange}
              style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '10px 12px', fontSize: '14px' }}
            />
            <input
              name="address"
              placeholder="Billing address"
              value={billingForm.address}
              onChange={handleBillingChange}
              style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '10px 12px', fontSize: '14px' }}
            />
            <input
              name="pincode"
              placeholder="Pincode"
              value={billingForm.pincode}
              onChange={handleBillingChange}
              style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '10px 12px', fontSize: '14px', maxWidth: '220px' }}
            />
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
              <button
                type="submit"
                disabled={savingBilling}
                style={{ background: '#2874f0', color: '#fff', border: 'none', borderRadius: '4px', padding: '8px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                {savingBilling ? 'Saving...' : 'Save Billing Details'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setBillingEditOpen(false);
                  setBillingForm({
                    phone: user.phone || "",
                    address: user.billingAddress?.address || "",
                    pincode: user.billingAddress?.pincode || "",
                  });
                  setBillingMessage("");
                }}
                style={{ border: '1px solid #bbb', color: '#555', background: '#fff', borderRadius: '4px', padding: '8px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div style={{ display: 'grid', gap: '6px', color: '#444', fontSize: '14px' }}>
            <div><span style={{ color: '#878787' }}>Phone:</span> {user.phone || 'Not set'}</div>
            <div><span style={{ color: '#878787' }}>Address:</span> {user.billingAddress?.address || 'Not set'}</div>
            <div><span style={{ color: '#878787' }}>Pincode:</span> {user.billingAddress?.pincode || 'Not set'}</div>
            <Link href="/checkout" style={{ color: '#2874f0', fontSize: '13px', textDecoration: 'none', marginTop: '4px' }}>Use these details at checkout</Link>
          </div>
        )}

        {billingMessage && (
          <div style={{ marginTop: '10px', color: billingMessage.includes('successfully') ? '#2e7d32' : '#c62828', fontSize: '13px' }}>
            {billingMessage}
          </div>
        )}
      </div>

      {/* Orders section */}
      <div style={{ background: '#fff', borderRadius: '4px', padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#212121', marginBottom: '16px', borderBottom: '2px solid #2874f0', paddingBottom: '10px' }}>My Orders</h2>
        {ordersLoading ? (
          <div style={{ color: '#878787', padding: '20px 0', textAlign: 'center' }}>Loading orders...</div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#878787' }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>📦</div>
            <div style={{ fontSize: '15px', fontWeight: 500 }}>No orders yet</div>
            <a href="/" style={{ color: '#2874f0', fontSize: '13px', textDecoration: 'none', marginTop: '8px', display: 'inline-block' }}>Start Shopping</a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {orders.map(order => {
              const statusInfo = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
              return (
                <div key={order._id} style={{ border: '1px solid #f0f0f0', borderRadius: '4px', padding: '14px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                    <div>
                      <div style={{ fontSize: '12px', color: '#878787' }}>Order ID</div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#212121', fontFamily: 'monospace' }}>{order._id?.slice(-10).toUpperCase()}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ background: statusInfo.bg, color: statusInfo.color, borderRadius: '12px', padding: '3px 12px', fontSize: '12px', fontWeight: 600 }}>
                        {statusInfo.label}
                      </span>
                      <div style={{ fontSize: '11px', color: '#aaa', marginTop: '4px' }}>
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
                    {order.products?.map((p, i) => {
                      const productId = typeof p.product === 'object' ? p.product?._id : p.product;
                      const name = p.title || p.product?.name || 'Product';
                      const img = p.image || p.product?.images?.[0] || null;
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fafafa', borderRadius: '4px', padding: '8px 10px', border: '1px solid #f0f0f0' }}>
                          <div style={{ width: 44, height: 44, flexShrink: 0, border: '1px solid #eee', borderRadius: '4px', overflow: 'hidden', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {img ? (
                              <img src={img} alt={name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            ) : (
                              <span style={{ fontSize: '18px' }}>📦</span>
                            )}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            {productId ? (
                              <a href={`/product/${productId}`}
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
                          <div style={{ fontWeight: 700, fontSize: '13px', color: '#212121', flexShrink: 0 }}>
                            ₹{((p.price || 0) * (p.quantity || 1)).toLocaleString('en-IN')}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #f0f0f0', paddingTop: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#878787' }}>Delivered to: {order.address}</span>
                    <span style={{ fontWeight: 700, fontSize: '15px', color: '#212121' }}>₹{order.total?.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Danger zone */}
      <div style={{ background: '#fff', borderRadius: '4px', padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', borderTop: '4px solid #d32f2f', marginTop: '16px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#b71c1c', marginBottom: '8px' }}>Danger Zone</h2>
        <p style={{ color: '#666', fontSize: '13px', marginBottom: '12px' }}>
          Deleting your account will remove your profile and cart data. This action cannot be undone.
        </p>
        <button
          onClick={handleDeleteAccount}
          disabled={deletingAccount}
          style={{ background: '#d32f2f', color: '#fff', border: 'none', borderRadius: '4px', padding: '10px 14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
        >
          {deletingAccount ? 'Deleting Account...' : 'Delete Account'}
        </button>
        {deleteError && <div style={{ marginTop: '10px', color: '#c62828', fontSize: '13px' }}>{deleteError}</div>}
      </div>
    </div>
  );
}
