"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, Eye, Users, DollarSign, ShoppingBag, BarChart3 } from "lucide-react";

export default function AdminAnalytics() {
  const [viewRange, setViewRange] = useState("weekly");
  const [summary, setSummary] = useState({ totalRevenue: 0, totalOrders: 0 });
  const [trends, setTrends] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [adminViews, setAdminViews] = useState({ totalViews: 0, uniqueAdminCount: 0, byPage: [] });
  const [userViews, setUserViews] = useState({ totalViews: 0, uniqueVisitorCount: 0, byPage: [] });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/account/login"); return; }
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch("/api/analytics/sales-summary", { headers }).then((r) => r.json()),
      fetch("/api/analytics/sales-trends", { headers }).then((r) => r.json()),
      fetch("/api/analytics/top-products", { headers }).then((r) => r.json()),
      fetch(`/api/analytics/admin-views?range=${viewRange}`, { headers }).then((r) => r.json()),
      fetch(`/api/analytics/user-views?range=${viewRange}`, { headers }).then((r) => r.json()),
    ])
      .then(([s, t, tp, av, uv]) => {
        if (s && !s.error) setSummary(s);
        if (t && !t.error && typeof t === "object" && !Array.isArray(t)) setTrends(Object.entries(t).sort((a, b) => a[0].localeCompare(b[0])));
        if (Array.isArray(tp)) setTopProducts(tp);
        if (av && !av.error) setAdminViews({ totalViews: av.totalViews || 0, uniqueAdminCount: av.uniqueAdminCount || 0, byPage: av.byPage || [] });
        if (uv && !uv.error) setUserViews({ totalViews: uv.totalViews || 0, uniqueVisitorCount: uv.uniqueVisitorCount || 0, byPage: uv.byPage || [] });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router, viewRange]);

  if (loading) return <div className="p-8 text-center text-gray-400">Loading analytics...</div>;

  const avgOrderValue = summary.totalOrders ? Math.round(summary.totalRevenue / summary.totalOrders) : 0;

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
        <select
          value={viewRange}
          onChange={(e) => setViewRange(e.target.value)}
          className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        >
          <option value="weekly">Last 7 Days</option>
          <option value="monthly">Last 30 Days</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={DollarSign} label="Revenue" value={`₹${(summary.totalRevenue || 0).toLocaleString("en-IN")}`} color="blue" />
        <StatCard icon={ShoppingBag} label="Orders" value={summary.totalOrders || 0} color="orange" />
        <StatCard icon={TrendingUp} label="Avg. Order" value={`₹${avgOrderValue.toLocaleString("en-IN")}`} color="green" />
        <StatCard icon={Eye} label="Page Views" value={userViews.totalViews || 0} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Sales Trends */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <BarChart3 size={16} className="text-blue-500" />
            <h2 className="text-sm font-bold text-gray-900">Sales Trends</h2>
          </div>
          {trends.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">No sales data</div>
          ) : (
            <div className="max-h-72 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-5 py-2.5 text-left text-[10px] font-semibold text-gray-400 uppercase">Date</th>
                    <th className="px-5 py-2.5 text-right text-[10px] font-semibold text-gray-400 uppercase">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {trends.map(([date, revenue]) => (
                    <tr key={date} className="border-b border-gray-50">
                      <td className="px-5 py-2.5 text-gray-600">{date}</td>
                      <td className="px-5 py-2.5 text-right font-semibold text-gray-900">₹{Number(revenue).toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-900">Top Selling Products</h2>
          </div>
          {topProducts.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">No data yet</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {topProducts.map((p, i) => (
                <div key={p._id} className="flex items-center gap-3 px-5 py-3">
                  <span className="text-sm font-bold text-blue-600 w-6">#{i + 1}</span>
                  <div className="w-9 h-9 bg-gray-50 rounded border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                    <img src={p.images?.[0] || p.image || "/logo.svg"} alt="" className="max-h-full max-w-full object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700 truncate">{p.title || p.name}</p>
                    <p className="text-[10px] text-gray-400">{p.sold} sold</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Page Views Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ViewsTable title="User Page Views" icon={<Users size={14} className="text-blue-500" />} data={userViews.byPage} uniqueLabel="Visitors" uniqueKey="uniqueVisitors" />
        <ViewsTable title="Admin Page Views" icon={<Eye size={14} className="text-purple-500" />} data={adminViews.byPage} uniqueLabel="Admins" uniqueKey="uniqueAdmins" />
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue: "text-blue-600 bg-blue-50",
    orange: "text-orange-600 bg-orange-50",
    green: "text-green-600 bg-green-50",
    purple: "text-purple-600 bg-purple-50",
  };
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${colors[color]}`}>
        <Icon size={16} />
      </div>
      <p className="text-[10px] text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-xl font-bold text-gray-900 mt-0.5">{value}</p>
    </div>
  );
}

function ViewsTable({ title, icon, data, uniqueLabel, uniqueKey }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
        {icon}
        <h2 className="text-sm font-bold text-gray-900">{title}</h2>
      </div>
      {data.length === 0 ? (
        <div className="p-8 text-center text-gray-400 text-sm">No views tracked yet</div>
      ) : (
        <div className="max-h-64 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-5 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase">Route</th>
                <th className="px-5 py-2 text-right text-[10px] font-semibold text-gray-400 uppercase">Views</th>
                <th className="px-5 py-2 text-right text-[10px] font-semibold text-gray-400 uppercase">{uniqueLabel}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.path} className="border-b border-gray-50">
                  <td className="px-5 py-2 text-gray-600 truncate max-w-[200px]">{row.path}</td>
                  <td className="px-5 py-2 text-right font-medium text-gray-900">{row.views || 0}</td>
                  <td className="px-5 py-2 text-right font-medium text-gray-900">{row[uniqueKey] || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
