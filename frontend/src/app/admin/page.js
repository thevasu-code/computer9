"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package, Users, ShoppingBag, BarChart3, FolderOpen, Database, Download, Upload, Settings, Newspaper } from "lucide-react";

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
    if (!token) { router.push("/account/login"); return; }
    const payload = (() => { try { return JSON.parse(atob(token.split(".")[1])); } catch { return null; } })();
    if (!payload || payload.exp < Math.floor(Date.now() / 1000)) { localStorage.removeItem("token"); router.push("/account/login"); return; }

    Promise.all([
      fetch("/api/products", { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch("/api/admin/users", { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch("/api/admin/orders", { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ])
      .then(([p, u, o]) => { setProducts(p); setUsers(u); setOrders(o); setLoading(false); })
      .catch(() => { setError("Unauthorized"); localStorage.removeItem("token"); router.push("/account/login"); });
  }, [router]);

  const downloadBackup = async () => {
    const token = getToken();
    if (!token) { router.push("/account/login"); return; }
    setBackupMessage(""); setBackupLoading(true);
    try {
      const res = await fetch("/api/admin/backup", { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Backup failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `computer9-backup-${Date.now()}.json`;
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
      setBackupMessage("Backup downloaded.");
    } catch (err) { setBackupMessage(err.message); } finally { setBackupLoading(false); }
  };

  const restoreBackup = async () => {
    const token = getToken();
    if (!token || !backupFile) return;
    if (!window.confirm("This will replace current data. Continue?")) return;
    setBackupMessage(""); setRestoreLoading(true);
    try {
      const raw = await backupFile.text();
      const payload = JSON.parse(raw);
      const res = await fetch("/api/admin/backup", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Restore failed");
      setBackupMessage(`Restored: ${data.restored?.products || 0} products, ${data.restored?.users || 0} users, ${data.restored?.orders || 0} orders`);
      setBackupFile(null);
    } catch (err) { setBackupMessage(err.message); } finally { setRestoreLoading(false); }
  };

  if (loading) return <div className="text-center py-20 text-gray-500">Loading dashboard...</div>;
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>;

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  const cards = [
    { title: "Products", value: Array.isArray(products) ? products.length : 0, icon: Package, href: "/admin/products", color: "blue" },
    { title: "Categories", value: "Manage", icon: FolderOpen, href: "/admin/categories", color: "purple" },
    { title: "Users", value: Array.isArray(users) ? users.length : 0, icon: Users, href: "/admin/users", color: "green" },
    { title: "Orders", value: Array.isArray(orders) ? orders.length : 0, icon: ShoppingBag, href: "/admin/orders", color: "orange" },
    { title: "Analytics", value: "View", icon: BarChart3, href: "/admin/analytics", color: "indigo" },
    { title: "Newsletter", value: "Manage", icon: Newspaper, href: "/admin/newsletter", color: "pink" },
    { title: "Settings", value: "Configure", icon: Settings, href: "/admin/settings", color: "gray" },
  ];

  const colorMap = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    green: "bg-green-50 text-green-600 border-green-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    pink: "bg-pink-50 text-pink-600 border-pink-100",
    gray: "bg-gray-50 text-gray-600 border-gray-100",
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of your store</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Products</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{Array.isArray(products) ? products.length : 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Users</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{Array.isArray(users) ? users.length : 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Orders</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{Array.isArray(orders) ? orders.length : 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Revenue</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">₹{totalRevenue.toLocaleString("en-IN")}</p>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-gray-300 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className={`w-11 h-11 rounded-lg flex items-center justify-center border ${colorMap[card.color]}`}>
                <card.icon size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{card.title}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{typeof card.value === "number" ? `${card.value} total` : card.value}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Backup Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-3 mb-4">
          <Database size={18} className="text-gray-400" />
          <h2 className="text-base font-bold text-gray-900">Database Backup</h2>
        </div>
        <p className="text-xs text-gray-500 mb-4">Download full database or restore from a previous backup file.</p>

        <div className="flex flex-wrap gap-3 items-center">
          <button
            onClick={downloadBackup}
            disabled={backupLoading || restoreLoading}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60"
          >
            <Download size={14} />
            {backupLoading ? "Preparing..." : "Download Backup"}
          </button>

          <div className="flex items-center gap-2">
            <input
              type="file"
              accept="application/json"
              onChange={(e) => setBackupFile(e.target.files?.[0] || null)}
              className="text-sm text-gray-500 file:mr-2 file:px-3 file:py-2 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
            />
            <button
              onClick={restoreBackup}
              disabled={restoreLoading || backupLoading || !backupFile}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-60"
            >
              <Upload size={14} />
              {restoreLoading ? "Restoring..." : "Restore"}
            </button>
          </div>
        </div>

        {backupMessage && (
          <p className={`mt-3 text-sm ${backupMessage.includes("fail") || backupMessage.includes("error") ? "text-red-600" : "text-green-600"}`}>
            {backupMessage}
          </p>
        )}
      </div>
    </div>
  );
}
