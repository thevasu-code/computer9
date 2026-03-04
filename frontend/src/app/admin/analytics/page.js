"use client";
import React, { useEffect, useState } from "react";

export default function AdminAnalytics() {
  const [summary, setSummary] = useState({ totalRevenue: 0, totalOrders: 0 });
  const [trends, setTrends] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:4000/analytics/sales-summary").then(res => res.json()),
      fetch("http://localhost:4000/analytics/sales-trends").then(res => res.json()),
      fetch("http://localhost:4000/analytics/top-products").then(res => res.json()),
    ]).then(([summary, trends, topProducts]) => {
      setSummary(summary);
      setTrends(Object.entries(trends));
      setTopProducts(topProducts);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded shadow p-6">
          <h2 className="font-bold mb-2">Sales Summary</h2>
          <div>Total Revenue: <span className="font-bold">₹{summary.totalRevenue}</span></div>
          <div>Total Orders: <span className="font-bold">{summary.totalOrders}</span></div>
        </div>
        <div className="bg-white rounded shadow p-6">
          <h2 className="font-bold mb-2">Sales Trends (Last 30 Days)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr><th>Date</th><th>Revenue</th></tr></thead>
              <tbody>
                {trends.map(([date, revenue]) => (
                  <tr key={date}><td>{date}</td><td>₹{revenue}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="bg-white rounded shadow p-6 mt-8">
        <h2 className="font-bold mb-2">Top Selling Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topProducts.map(p => (
            <div key={p._id} className="border rounded p-4 flex flex-col items-center">
              <img src={p.image || "/placeholder.png"} alt={p.name} className="w-24 h-24 object-contain mb-2" />
              <div className="font-bold">{p.name}</div>
              <div>Sold: {p.sold}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
