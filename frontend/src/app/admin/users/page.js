"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Shield, UserCheck, Edit, Trash2, X, Check } from "lucide-react";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "", isAdmin: false });
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/account/login"); return; }
    fetch("/api/admin/users", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setUsers(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [router]);

  const handleEdit = (user) => {
    setEditId(user._id);
    setEditForm({ name: user.name, email: user.email, phone: user.phone || "", isAdmin: user.isAdmin });
  };

  const handleUpdate = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/admin/users/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (res.ok) setUsers(users.map((u) => (u._id === editId ? data : u)));
      setEditId(null);
    } catch { /* ignore */ }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setUsers(users.filter((u) => u._id !== id));
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
  });

  const admins = filtered.filter((u) => u.isAdmin);
  const regular = filtered.filter((u) => !u.isAdmin);

  if (loading) return <div className="p-8 text-center text-gray-400">Loading users...</div>;

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="text-xl font-bold text-gray-900">Users</h1>
        <span className="text-sm text-gray-400">{users.length} total</span>
      </div>

      {/* Search */}
      <div className="relative max-w-xs mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />
      </div>

      {/* Admin Users */}
      {admins.length > 0 && (
        <div className="mb-6">
          <h2 className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
            <Shield size={14} className="text-orange-500" />
            Admins ({admins.length})
          </h2>
          <UserTable users={admins} editId={editId} editForm={editForm} setEditForm={setEditForm} onEdit={handleEdit} onUpdate={handleUpdate} onCancel={() => setEditId(null)} onDelete={handleDelete} />
        </div>
      )}

      {/* Regular Users */}
      <div>
        <h2 className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
          <UserCheck size={14} className="text-blue-500" />
          Customers ({regular.length})
        </h2>
        <UserTable users={regular} editId={editId} editForm={editForm} setEditForm={setEditForm} onEdit={handleEdit} onUpdate={handleUpdate} onCancel={() => setEditId(null)} onDelete={handleDelete} />
      </div>
    </div>
  );
}

function UserTable({ users, editId, editForm, setEditForm, onEdit, onUpdate, onCancel, onDelete }) {
  if (users.length === 0) return <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm">No users found.</div>;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="hidden sm:grid grid-cols-[1.5fr_2fr_1fr_0.6fr_80px] gap-2 px-5 py-3 bg-gray-50 border-b border-gray-100 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
        <span>Name</span><span>Email</span><span>Phone</span><span>Role</span><span>Actions</span>
      </div>
      {users.map((u) => (
        <div key={u._id} className="grid grid-cols-1 sm:grid-cols-[1.5fr_2fr_1fr_0.6fr_80px] gap-2 px-5 py-3 items-center border-b border-gray-50 last:border-0">
          {editId === u._id ? (
            <>
              <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="px-2 py-1.5 border border-gray-200 rounded-lg text-sm" />
              <input value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="px-2 py-1.5 border border-gray-200 rounded-lg text-sm" />
              <input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className="px-2 py-1.5 border border-gray-200 rounded-lg text-sm" />
              <label className="flex items-center gap-1.5 text-xs">
                <input type="checkbox" checked={editForm.isAdmin} onChange={(e) => setEditForm({ ...editForm, isAdmin: e.target.checked })} className="w-3.5 h-3.5" />
                Admin
              </label>
              <div className="flex items-center gap-1">
                <button onClick={onUpdate} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"><Check size={15} /></button>
                <button onClick={onCancel} className="p-1.5 text-gray-400 hover:bg-gray-50 rounded-lg"><X size={15} /></button>
              </div>
            </>
          ) : (
            <>
              <span className="text-sm font-medium text-gray-800 truncate">{u.name}</span>
              <span className="text-sm text-gray-500 truncate">{u.email}</span>
              <span className="text-sm text-gray-500">{u.phone || "—"}</span>
              <span className={`text-[10px] font-bold uppercase ${u.isAdmin ? "text-orange-600" : "text-gray-400"}`}>
                {u.isAdmin ? "Admin" : "User"}
              </span>
              <div className="flex items-center gap-1">
                <button onClick={() => onEdit(u)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={14} /></button>
                <button onClick={() => onDelete(u._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
