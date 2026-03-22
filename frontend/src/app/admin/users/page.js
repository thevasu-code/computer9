"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "", isAdmin: false });
  const router = useRouter();

  const handleEditInput = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm({ ...editForm, [name]: type === "checkbox" ? checked : value });
  };

  const handleEdit = (user) => {
    setEditId(user._id);
    setEditForm({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      isAdmin: user.isAdmin,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/admin/users/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      setUsers(users.map(u => u._id === editId ? data : u));
      setEditId(null);
    } catch (err) {
      alert(err.message);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/account/login");
      return;
    }
    fetch("/api/admin/users", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) {
          setError(data.error || "Failed to load users.");
        } else {
          setUsers(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load users.");
        setLoading(false);
      });
  }, [router]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      setUsers(users.filter(u => u._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (error) return <div className="text-center py-12 text-red-500">{error}</div>;

  const adminUsers = users.filter((u) => u.isAdmin);
  const regularUsers = users.filter((u) => !u.isAdmin);

  const renderUsersTable = (list) => (
    <table className="w-full border-collapse bg-white rounded shadow">
      <thead>
        <tr className="border-b">
          <th className="p-2 text-left">Name</th>
          <th className="p-2 text-center">Email</th>
          <th className="p-2 text-center">Phone</th>
          <th className="p-2 text-center">Admin</th>
          <th className="p-2 text-center">Actions</th>
        </tr>
      </thead>
      <tbody>
        {list.map((u) => (
          <tr key={u._id} className="border-b">
            {editId === u._id ? (
              <>
                <td className="p-2"><input name="name" value={editForm.name} onChange={handleEditInput} className="border rounded px-2 w-full" /></td>
                <td className="p-2 text-center"><input name="email" value={editForm.email} onChange={handleEditInput} className="border rounded px-2 w-full text-center" /></td>
                <td className="p-2 text-center"><input name="phone" value={editForm.phone} onChange={handleEditInput} className="border rounded px-2 w-full text-center" placeholder="Phone" /></td>
                <td className="p-2 text-center">
                  <input name="isAdmin" type="checkbox" checked={editForm.isAdmin} onChange={handleEditInput} /> Admin
                </td>
                <td className="p-2 text-center">
                  <button className="bg-primary text-white px-3 py-1 rounded mr-2" onClick={handleUpdate}>Save</button>
                  <button className="text-zinc-500 hover:underline" onClick={() => setEditId(null)}>Cancel</button>
                </td>
              </>
            ) : (
              <>
                <td className="p-2">{u.name}</td>
                <td className="p-2 text-center">{u.email}</td>
                <td className="p-2 text-center">{u.phone || "-"}</td>
                <td className="p-2 text-center">{u.isAdmin ? "Yes" : "No"}</td>
                <td className="p-2 text-center">
                  <button className="text-primary hover:underline mr-2" onClick={() => handleEdit(u)}>Edit</button>
                  <button className="text-red-500 hover:underline" onClick={() => handleDelete(u._id)}>Delete</button>
                </td>
              </>
            )}
          </tr>
        ))}
        {list.length === 0 && (
          <tr>
            <td className="p-4 text-center text-zinc-500" colSpan={5}>No users found</td>
          </tr>
        )}
      </tbody>
    </table>
  );

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Manage Users</h1>

      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Admin Users</h2>
          <span className="text-sm text-zinc-500">{adminUsers.length} total</span>
        </div>
        {renderUsersTable(adminUsers)}
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Regular Users</h2>
          <span className="text-sm text-zinc-500">{regularUsers.length} total</span>
        </div>
        {renderUsersTable(regularUsers)}
      </section>
    </div>
  );
}
