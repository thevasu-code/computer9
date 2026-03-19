"use client";
import React, { useEffect, useState } from "react";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/orders")
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Manage Orders</h1>
      <table className="w-full border-collapse bg-white rounded shadow">
        <thead>
          <tr className="border-b">
            <th className="p-2 text-left">Order ID</th>
            <th className="p-2 text-center">User</th>
            <th className="p-2 text-center">Total</th>
            <th className="p-2 text-center">Status</th>
            <th className="p-2 text-center">Created</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(o => (
            <tr key={o._id} className="border-b">
              <td className="p-2">{o._id}</td>
              <td className="p-2 text-center">{o.user?.name || "-"}</td>
              <td className="p-2 text-center">₹{o.total}</td>
              <td className="p-2 text-center">{o.status}</td>
              <td className="p-2 text-center">{new Date(o.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
