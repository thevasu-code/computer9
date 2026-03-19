"use client";
import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  if (!token) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 24px' }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>❌</div>
        <p style={{ color: '#c62828', fontWeight: 600 }}>Invalid or missing reset token.</p>
        <a href="/account/forgot-password" style={{ color: '#2874f0', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>Request a new reset link</a>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords do not match"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reset failed");
      setSuccess(true);
      setTimeout(() => router.push("/account/login"), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 24px' }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
        <p style={{ color: '#2e7d32', fontWeight: 600, fontSize: '15px', marginBottom: '6px' }}>Password reset successfully!</p>
        <p style={{ color: '#878787', fontSize: '13px' }}>Redirecting to login...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <p style={{ color: '#212121', fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>Set a new password</p>
        <p style={{ color: '#878787', fontSize: '13px' }}>Choose a strong password of at least 6 characters.</p>
      </div>
      <input
        type="password"
        placeholder="New Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        style={{ border: 'none', borderBottom: '2px solid #e0e0e0', outline: 'none', padding: '10px 0', fontSize: '15px', width: '100%' }}
        onFocus={e => e.target.style.borderBottomColor = '#2874f0'}
        onBlur={e => e.target.style.borderBottomColor = '#e0e0e0'}
      />
      <input
        type="password"
        placeholder="Confirm New Password"
        value={confirm}
        onChange={e => setConfirm(e.target.value)}
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
        {loading ? "Resetting..." : "RESET PASSWORD"}
      </button>
      <div style={{ textAlign: 'center', color: '#878787', fontSize: '14px' }}>
        <a href="/account/login" style={{ color: '#2874f0', fontWeight: 600, textDecoration: 'none' }}>← Back to Login</a>
      </div>
    </form>
  );
}

export default function ResetPasswordPage() {
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
            <h2 style={{ fontSize: '26px', fontWeight: 700, marginBottom: '12px', lineHeight: 1.3 }}>Create New Password</h2>
            <p style={{ fontSize: '15px', opacity: 0.85, lineHeight: 1.6 }}>Your new password must be different from the previous one.</p>
          </div>
          <div style={{ fontSize: '56px', marginTop: '32px' }}>🔑</div>
        </div>
        <div className="c9-auth-right">
          <Suspense fallback={<p>Loading...</p>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
