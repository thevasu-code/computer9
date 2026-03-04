"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AccountPage() {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:4000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      localStorage.setItem("token", data.token);
      toast.success("Login success", { position: "top-center", autoClose: 1200 });
      setTimeout(() => {
        if (data.user && data.user.isAdmin) {
          router.push("/admin/dashboard");
        } else {
          router.push("/account/dashboard");
        }
      }, 1300);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:4000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      // Auto-login after register
      localStorage.setItem("token", data.token);
      router.push("/account/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <ToastContainer />
      <h1 className="text-3xl font-bold mb-8 text-center">{mode === "login" ? "Login" : "Register"}</h1>
      <div className="flex justify-center mb-6 gap-4">
        <button
          className={`px-4 py-2 rounded font-medium ${mode === "login" ? "bg-primary text-white" : "bg-zinc-200"}`}
          onClick={() => setMode("login")}
        >Login</button>
        <button
          className={`px-4 py-2 rounded font-medium ${mode === "register" ? "bg-primary text-white" : "bg-zinc-200"}`}
          onClick={() => setMode("register")}
        >Register</button>
      </div>
      {mode === "login" ? (
        <form className="space-y-4" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
          {error && <div className="text-red-500">{error}</div>}
          {success && <div className="text-green-600 font-semibold text-center mb-2">{success}</div>}
          <button
            type="submit"
            className="w-full bg-primary text-white py-3 rounded font-medium text-lg hover:bg-primary/90 transition-colors disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      ) : (
        <form className="space-y-4" onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
          {error && <div className="text-red-500">{error}</div>}
          <button
            type="submit"
            className="w-full bg-primary text-white py-3 rounded font-medium text-lg hover:bg-primary/90 transition-colors disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
      )}
    </div>
  );
}
