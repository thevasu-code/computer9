"use client";
import React, { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setMessage(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f1f3f6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <style>{`
        .c9-auth-card { display: flex; width: 100%; max-width: 750px; box-shadow: 0 4px 24px rgba(0,0,0,0.15); border-radius: 4px; overflow: hidden; }
        .c9-auth-left { background: #2874f0; flex: 0 0 40%; padding: 40px 32px; color: #fff; display: flex; flex-direction: column; justify-content: space-between; }
        .c9-auth-right { flex: 1; background: #fff; padding: 40px 32px; }
        @media (max-width: 540px) {
          .c9-auth-card { flex-direction: column; }
          .c9-auth-left { flex: unset; padding: 24px 20px; flex-direction: row; align-items: center; justify-content: space-between; }
          .c9-auth-right { padding: 24px 20px; }
        }
      `}</style>
      <div className="c9-auth-card">
        <div className="c9-auth-left">
          <div>
            <h2 style={{ fontSize: '26px', fontWeight: 700, marginBottom: '12px', lineHeight: 1.3 }}>Forgot Password?</h2>
            <p style={{ fontSize: '15px', opacity: 0.85, lineHeight: 1.6 }}>Enter your registered email and we'll send you a reset link.</p>
          </div>
          <div style={{ fontSize: '56px', marginTop: '32px' }}>🔒</div>
        </div>
        <div className="c9-auth-right">
          {message ? (
            <div style={{ textAlign: 'center', paddingTop: '20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📧</div>
              <p style={{ color: '#2e7d32', fontWeight: 600, fontSize: '15px', marginBottom: '8px' }}>{message}</p>
              <p style={{ color: '#878787', fontSize: '13px', marginBottom: '24px' }}>Check your email inbox for the reset link. It expires in 1 hour.</p>
              <a href="/account/login" style={{ color: '#2874f0', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>← Back to Login</a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <p style={{ color: '#212121', fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>Reset your password</p>
                <p style={{ color: '#878787', fontSize: '13px' }}>We'll send a reset link to your email.</p>
              </div>
              <input
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{ border: 'none', borderBottom: '2px solid #e0e0e0', outline: 'none', padding: '10px 0', fontSize: '15px', width: '100%' }}
                onFocus={e => e.target.style.borderBottomColor = '#2874f0'}
                onBlur={e => e.target.style.borderBottomColor = '#e0e0e0'}
              />
              {error && <div style={{ color: '#ff4444', fontSize: '13px' }}>{error}</div>}
              <button
                type="submit"
                disabled={loading}
                style={{ background: '#fb641b', color: '#fff', border: 'none', borderRadius: '2px', padding: '14px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', letterSpacing: '0.5px' }}
              >
                {loading ? "Sending..." : "SEND RESET LINK"}
              </button>
              <div style={{ textAlign: 'center', color: '#878787', fontSize: '14px' }}>
                Remember your password?{' '}
                <a href="/account/login" style={{ color: '#2874f0', fontWeight: 600, textDecoration: 'none' }}>Login</a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
