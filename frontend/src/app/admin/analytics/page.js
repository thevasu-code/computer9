"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminAnalytics() {
  const [summary, setSummary] = useState({ totalRevenue: 0, totalOrders: 0 });
  const [trends, setTrends] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin/login");
      return;
    }
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch("/api/analytics/sales-summary", { headers }).then(res => res.json()),
      fetch("/api/analytics/sales-trends", { headers }).then(res => res.json()),
      fetch("/api/analytics/top-products", { headers }).then(res => res.json()),
    ])
      .then(([summaryData, trendsData, topProductsData]) => {
        if (summaryData && !summaryData.error) setSummary(summaryData);
        if (trendsData && !trendsData.error && typeof trendsData === 'object' && !Array.isArray(trendsData)) {
          setTrends(Object.entries(trendsData).sort((a, b) => a[0].localeCompare(b[0])));
        }
        if (Array.isArray(topProductsData)) setTopProducts(topProductsData);
        setLoading(false);
      })
      .catch(err => {
        setError("Failed to load analytics data. Please try again.");
        setLoading(false);
      });
  }, [router]);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '60px 0', color: '#878787', fontSize: '16px' }}>
      Loading analytics...
    </div>
  );
  if (error) return (
    <div style={{ textAlign: 'center', padding: '60px 0' }}>
      <div style={{ color: '#c62828', fontSize: '15px', marginBottom: '12px' }}>{error}</div>
      <button onClick={() => window.location.reload()} style={{ background: '#2874f0', color: '#fff', border: 'none', borderRadius: '4px', padding: '8px 20px', cursor: 'pointer', fontSize: '14px' }}>
        Retry
      </button>
    </div>
  );

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#212121' }}>Analytics</h1>
        <a href="/admin" style={{ fontSize: '13px', color: '#2874f0', textDecoration: 'none' }}>← Back to Dashboard</a>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#fff', borderRadius: '4px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', borderTop: '4px solid #2874f0' }}>
          <div style={{ fontSize: '13px', color: '#878787', marginBottom: '6px' }}>Total Revenue</div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#212121' }}>₹{(summary.totalRevenue || 0).toLocaleString('en-IN')}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: '4px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', borderTop: '4px solid #ff9f00' }}>
          <div style={{ fontSize: '13px', color: '#878787', marginBottom: '6px' }}>Total Orders</div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#212121' }}>{summary.totalOrders || 0}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: '4px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', borderTop: '4px solid #26a541' }}>
          <div style={{ fontSize: '13px', color: '#878787', marginBottom: '6px' }}>Avg. Order Value</div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#212121' }}>
            ₹{summary.totalOrders ? Math.round(summary.totalRevenue / summary.totalOrders).toLocaleString('en-IN') : 0}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        {/* Sales Trends */}
        <div style={{ background: '#fff', borderRadius: '4px', padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', gridColumn: trends.length > 5 ? 'span 2' : '1' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#212121', marginBottom: '16px', borderBottom: '2px solid #2874f0', paddingBottom: '10px' }}>
            Sales Trends — Last 30 Days
          </h2>
          {trends.length === 0 ? (
            <div style={{ color: '#878787', textAlign: 'center', padding: '24px 0', fontSize: '14px' }}>No sales data in the last 30 days.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f1f3f6' }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left', color: '#212121' }}>Date</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right', color: '#212121' }}>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {trends.map(([date, revenue]) => (
                    <tr key={date} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '8px 12px', color: '#444' }}>{date}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, color: '#212121' }}>₹{Number(revenue).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top products — only show if fits in 2-col layout */}
        {trends.length <= 5 && (
          <div style={{ background: '#fff', borderRadius: '4px', padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#212121', marginBottom: '16px', borderBottom: '2px solid #ff9f00', paddingBottom: '10px' }}>
              Top Selling Products
            </h2>
            {topProducts.length === 0 ? (
              <div style={{ color: '#878787', textAlign: 'center', padding: '24px 0', fontSize: '14px' }}>No product sales data yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {topProducts.map((p, i) => (
                  <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', borderRadius: '4px', background: i === 0 ? '#fff8e1' : '#fafafa' }}>
                    <span style={{ fontWeight: 700, color: '#2874f0', fontSize: '16px', width: '20px', flexShrink: 0 }}>#{i + 1}</span>
                    <img src={p.images?.[0] || p.image || '/placeholder.png'} alt={p.title || p.name} style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '4px', background: '#fff', border: '1px solid #f0f0f0' }} />
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#212121', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title || p.name}</div>
                      <div style={{ fontSize: '12px', color: '#878787' }}>Sold: {p.sold} units</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Top products full-width when trends has many rows */}
      {trends.length > 5 && (
        <div style={{ background: '#fff', borderRadius: '4px', padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#212121', marginBottom: '16px', borderBottom: '2px solid #ff9f00', paddingBottom: '10px' }}>
            Top Selling Products
          </h2>
          {topProducts.length === 0 ? (
            <div style={{ color: '#878787', textAlign: 'center', padding: '24px 0', fontSize: '14px' }}>No product sales data yet.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
              {topProducts.map((p, i) => (
                <div key={p._id} style={{ border: '1px solid #f0f0f0', borderRadius: '4px', padding: '16px', textAlign: 'center', background: i === 0 ? '#fff8e1' : '#fff' }}>
                  <span style={{ fontWeight: 700, color: '#2874f0' }}>#{i + 1}</span>
                  <img src={p.images?.[0] || p.image || '/placeholder.png'} alt={p.title || p.name} style={{ width: '60px', height: '60px', objectFit: 'contain', display: 'block', margin: '8px auto' }} />
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#212121' }}>{p.title || p.name}</div>
                  <div style={{ fontSize: '12px', color: '#878787', marginTop: '4px' }}>Sold: {p.sold} units</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
