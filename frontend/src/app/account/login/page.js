"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      localStorage.setItem("token", data.token);
      window.dispatchEvent(new Event("userLogin"));
      if (data.user && data.user.isAdmin) {
        router.push("/admin");
      } else {
        router.push("/account/dashboard");
      }
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
        {/* Left panel */}
        <div className="c9-auth-left">
          <div>
            <h2 style={{ fontSize: '26px', fontWeight: 700, marginBottom: '12px', lineHeight: 1.3 }}>Login</h2>
            <p style={{ fontSize: '15px', opacity: 0.85, lineHeight: 1.6 }}>Get access to your Orders, Wishlist and Recommendations</p>
          </div>
          <div style={{ fontSize: '56px', marginTop: '32px' }}>💻</div>
        </div>
        {/* Right panel */}
        <div className="c9-auth-right">
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{ border: 'none', borderBottom: '2px solid #e0e0e0', outline: 'none', padding: '10px 0', fontSize: '15px', width: '100%' }}
              onFocus={e => e.target.style.borderBottomColor = '#2874f0'}
              onBlur={e => e.target.style.borderBottomColor = '#e0e0e0'}
            />
            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{ border: 'none', borderBottom: '2px solid #e0e0e0', outline: 'none', padding: '10px 0', fontSize: '15px', width: '100%' }}
              onFocus={e => e.target.style.borderBottomColor = '#2874f0'}
              onBlur={e => e.target.style.borderBottomColor = '#e0e0e0'}
            />
            {error && <div style={{ color: '#ff4444', fontSize: '13px' }}>{error}</div>}
            <div style={{ textAlign: 'right' }}>
              <a href="/account/forgot-password" style={{ color: '#2874f0', fontSize: '13px', textDecoration: 'none' }}>Forgot Password?</a>
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{ background: '#fb641b', color: '#fff', border: 'none', borderRadius: '2px', padding: '14px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', letterSpacing: '0.5px' }}
            >
              {loading ? "Logging in..." : "LOGIN"}
            </button>
          </form>
          <div style={{ marginTop: '20px', textAlign: 'center', color: '#878787', fontSize: '14px' }}>
            New to Computer9?{' '}
            <a href="/account/register" style={{ color: '#2874f0', fontWeight: 600, textDecoration: 'none' }}>Create an account</a>
          </div>
        </div>
      </div>
    </div>
  );
}
