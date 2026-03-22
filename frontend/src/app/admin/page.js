
"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [backupFile, setBackupFile] = useState(null);
  const [backupMessage, setBackupMessage] = useState("");
  const router = useRouter();

  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/account/login");
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
      localStorage.removeItem("token");
      router.push("/account/login");
      return;
    }
    Promise.all([
      fetch("/api/products", {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => res.json()),
      fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => res.json()),
      fetch("/api/admin/orders", {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => res.json()),
    ]).then(([products, users, orders]) => {
      setProducts(products);
      setUsers(users);
      setOrders(orders);
      setLoading(false);
    }).catch(err => {
      setError("Session expired or unauthorized.");
      localStorage.removeItem("token");
      router.push("/account/login");
    });
  }, [router]);

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (error) return <div className="text-center py-12 text-red-500">{error}</div>;

  const downloadBackup = async () => {
    const token = getToken();
    if (!token) {
      router.push("/account/login");
      return;
    }
    setBackupMessage("");
    setBackupLoading(true);
    try {
      const res = await fetch("/api/admin/backup", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Backup failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `computer9-backup-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setBackupMessage("Backup downloaded successfully.");
    } catch (err) {
      setBackupMessage(err.message || "Backup failed.");
    } finally {
      setBackupLoading(false);
    }
  };

  const restoreBackup = async () => {
    const token = getToken();
    if (!token) {
      router.push("/account/login");
      return;
    }
    if (!backupFile) {
      setBackupMessage("Please choose a backup JSON file first.");
      return;
    }

    const confirmRestore = window.confirm(
      "This will replace current database collections with backup data. Continue?"
    );
    if (!confirmRestore) return;

    setBackupMessage("");
    setRestoreLoading(true);
    try {
      const raw = await backupFile.text();
      const payload = JSON.parse(raw);
      const res = await fetch("/api/admin/backup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Restore failed");

      setBackupMessage(
        `Restore complete: Users ${data.restored?.users || 0}, Products ${data.restored?.products || 0}, Orders ${data.restored?.orders || 0}, Carts ${data.restored?.carts || 0}, Reviews ${data.restored?.reviews || 0}`
      );
      setBackupFile(null);
      window.location.reload();
    } catch (err) {
      setBackupMessage(err.message || "Restore failed.");
    } finally {
      setRestoreLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
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

      <div className="bg-white rounded shadow p-6">
        <h2 className="text-2xl font-bold mb-2">Database Backup</h2>
        <p className="text-sm text-zinc-600 mb-4">
          Download full MongoDB data (including product image URLs/content fields) and restore it later on this website.
        </p>

        <div className="flex flex-wrap gap-3 items-center mb-4">
          <button
            type="button"
            className="bg-primary text-white px-4 py-2 rounded font-medium disabled:opacity-60"
            onClick={downloadBackup}
            disabled={backupLoading || restoreLoading}
          >
            {backupLoading ? "Preparing Backup..." : "Download Backup"}
          </button>

          <input
            type="file"
            accept="application/json"
            onChange={(e) => setBackupFile(e.target.files?.[0] || null)}
            className="border rounded px-3 py-2 text-sm"
          />

          <button
            type="button"
            className="bg-emerald-600 text-white px-4 py-2 rounded font-medium disabled:opacity-60"
            onClick={restoreBackup}
            disabled={restoreLoading || backupLoading}
          >
            {restoreLoading ? "Restoring..." : "Restore Backup"}
          </button>
        </div>

        {backupFile && (
          <p className="text-xs text-zinc-500 mb-2">Selected file: {backupFile.name}</p>
        )}
        {backupMessage && (
          <p className={`text-sm ${backupMessage.toLowerCase().includes("failed") || backupMessage.toLowerCase().includes("error") ? "text-red-600" : "text-emerald-700"}`}>
            {backupMessage}
          </p>
        )}
      </div>
    </div>
  );
}
