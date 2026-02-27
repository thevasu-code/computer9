import React from "react";
import { ShoppingCart, User, Search } from "lucide-react";

export default function Header() {
  return (
    <header className="w-full bg-white dark:bg-zinc-900 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 gap-4">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2">
          <img src="/file.svg" alt="Logo" className="w-10 h-10" />
          <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Computer9.in</span>
        </a>
        {/* Search Bar */}
        <form className="flex-1 max-w-xl mx-6 hidden md:flex" action="/search" method="GET">
          <div className="relative w-full">
            <input
              type="text"
              name="q"
              placeholder="Search for products, brands and more..."
              className="w-full rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-5 py-2 pl-12 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary"
              autoComplete="off"
            />
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-zinc-400" />
          </div>
        </form>
        {/* Account & Cart */}
        <div className="flex items-center gap-4">
          <a href="/account" className="flex items-center gap-1 text-zinc-700 dark:text-zinc-200 hover:text-primary">
            <User className="w-6 h-6" />
            <span className="hidden sm:inline font-medium">Account</span>
          </a>
          <a href="/cart" className="relative flex items-center gap-1 text-zinc-700 dark:text-zinc-200 hover:text-primary">
            <ShoppingCart className="w-6 h-6" />
            <span className="hidden sm:inline font-medium">Cart</span>
            <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full px-1.5 py-0.5 font-bold">0</span>
          </a>
        </div>
      </div>
    </header>
  );
}
