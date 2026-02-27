import React from "react";

export default function Account() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans flex items-center justify-center">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold mb-4 text-zinc-900 dark:text-zinc-50 text-center">Account</h1>
        <p className="text-zinc-700 dark:text-zinc-200 text-center mb-6">Sign in to view your orders, wishlist, and manage your account.</p>
        <form className="flex flex-col gap-4">
          <input type="email" placeholder="Email" className="rounded px-4 py-2 border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-primary" />
          <input type="password" placeholder="Password" className="rounded px-4 py-2 border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-primary" />
          <button type="submit" className="bg-primary text-white py-2 rounded font-medium hover:bg-primary/90 transition-colors">Sign In</button>
        </form>
        <div className="text-center mt-4">
          <a href="#" className="text-primary hover:underline text-sm">Forgot password?</a>
        </div>
        <div className="text-center mt-2">
          <span className="text-zinc-500 text-sm">New user? </span>
          <a href="#" className="text-primary hover:underline text-sm">Create an account</a>
        </div>
      </div>
    </div>
  );
}
