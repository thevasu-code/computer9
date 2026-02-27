import React from "react";

export default function Checkout() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans flex items-center justify-center">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-8 max-w-2xl w-full">
        <h1 className="text-3xl font-bold mb-4 text-zinc-900 dark:text-zinc-50 text-center">Checkout</h1>
        <p className="text-zinc-700 dark:text-zinc-200 text-center mb-6">Checkout process will be implemented here.</p>
        {/* TODO: Implement checkout form and payment */}
      </div>
    </div>
  );
}
