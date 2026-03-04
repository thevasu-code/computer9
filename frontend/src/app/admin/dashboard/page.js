"use client";
import React from "react";

export default function AdminDashboard() {
  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-8 text-center">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <a href="/admin/products" className="bg-primary text-white rounded-lg p-6 shadow hover:bg-primary/90 transition-colors text-center font-semibold text-xl">Products</a>
        <a href="/admin/orders" className="bg-primary text-white rounded-lg p-6 shadow hover:bg-primary/90 transition-colors text-center font-semibold text-xl">Orders</a>
        <a href="/admin/users" className="bg-primary text-white rounded-lg p-6 shadow hover:bg-primary/90 transition-colors text-center font-semibold text-xl">Users</a>
        <a href="/admin/analytics" className="bg-primary text-white rounded-lg p-6 shadow hover:bg-primary/90 transition-colors text-center font-semibold text-xl">Analytics</a>
        <a href="/admin/inventory" className="bg-primary text-white rounded-lg p-6 shadow hover:bg-primary/90 transition-colors text-center font-semibold text-xl">Inventory</a>
        <a href="/admin/newsletter" className="bg-primary text-white rounded-lg p-6 shadow hover:bg-primary/90 transition-colors text-center font-semibold text-xl">Newsletter</a>
        <a href="/admin/offers" className="bg-primary text-white rounded-lg p-6 shadow hover:bg-primary/90 transition-colors text-center font-semibold text-xl">Offers</a>
        <a href="/admin/settings" className="bg-primary text-white rounded-lg p-6 shadow hover:bg-primary/90 transition-colors text-center font-semibold text-xl">Settings</a>
        <a href="/admin/adminusers" className="bg-primary text-white rounded-lg p-6 shadow hover:bg-primary/90 transition-colors text-center font-semibold text-xl">Admin Users</a>
      </div>
    </div>
  );
}
