
"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin/login");
      return;
    }
    // Check expiry
    const payload = (() => {
      try {
        return JSON.parse(atob(token.split(".")[1]));
      } catch {
        return null;
      }
    })();
    if (!payload || payload.exp < Math.floor(Date.now() / 1000)) {
      localStorage.removeItem("adminToken");
      router.push("/admin/login");
      return;
    }
    Promise.all([
      fetch("http://localhost:4000/products", {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => res.json()),
      fetch("http://localhost:4000/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => res.json()),
      fetch("http://localhost:4000/admin/orders", {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => res.json()),
    ]).then(([products, users, orders]) => {
      setProducts(products);
      setUsers(users);
      setOrders(orders);
      setLoading(false);
    }).catch(err => {
      setError("Session expired or unauthorized.");
      localStorage.removeItem("adminToken");
      router.push("/admin/login");
    });
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    router.push("/admin/login");
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (error) return <div className="text-center py-12 text-red-500">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <div className="flex justify-end mb-4">
        <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">Logout</button>
      </div>
      <h1 className="text-4xl font-bold mb-8 text-center">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        <div className="bg-white rounded shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Products</h2>
          <div className="text-lg mb-2">Total: {products.length}</div>
          <a href="/admin/products" className="text-primary underline">Manage Products</a>
        </div>
        <div className="bg-white rounded shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Users</h2>
          <div className="text-lg mb-2">Total: {users.length}</div>
          <a href="/admin/users" className="text-primary underline">Manage Users</a>
        </div>
        <div className="bg-white rounded shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Orders</h2>
          <div className="text-lg mb-2">Total: {orders.length}</div>
          <a href="/admin/orders" className="text-primary underline">Manage Orders</a>
        </div>
        <div className="bg-white rounded shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Analytics</h2>
          <div className="text-lg mb-2">Sales, Trends, Top Products</div>
          <a href="/admin/analytics" className="text-primary underline">View Analytics</a>
        </div>
      </div>
      {/* Add more admin features here */}
    </div>
  );
}
