"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AccountDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/account");
      return;
    }
    fetch("http://localhost:4000/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (!data || data.error) {
          localStorage.removeItem("token");
          router.push("/account");
        } else {
          setUser(data);
          setLoading(false);
        }
      });
  }, [router]);

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (!user) return <div className="text-center py-12">User not found.</div>;

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Account Dashboard</h1>
      <div className="bg-white rounded shadow p-6">
        <div className="mb-4">
          <span className="font-bold">Name:</span> {user.name}
        </div>
        <div className="mb-4">
          <span className="font-bold">Email:</span> {user.email}
        </div>
        <div className="mb-4">
          <span className="font-bold">Orders:</span> {user.orders?.length || 0}
        </div>
        {/* Add more user features here */}
      </div>
    </div>
  );
}
