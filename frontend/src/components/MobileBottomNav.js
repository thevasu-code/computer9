"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, ShoppingCart, User, LayoutGrid } from "lucide-react";
import { useCart } from "@/context/CartContext";

const NAV_ITEMS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Categories", href: "/shop", icon: LayoutGrid },
  { label: "Search", href: "/shop", icon: Search },
  { label: "Cart", href: "/cart", icon: ShoppingCart, badge: true },
  { label: "Account", href: "/account/dashboard", icon: User },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { cart } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Hide on admin pages
  if (pathname.startsWith("/admin")) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg sm:hidden">
      <div className="flex items-center justify-around py-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 relative ${
                isActive ? "text-blue-600" : "text-gray-400"
              }`}
            >
              <div className="relative">
                <item.icon size={20} />
                {item.badge && mounted && cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-blue-600 text-white text-[8px] font-bold min-w-[14px] h-[14px] flex items-center justify-center rounded-full">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </div>
              <span className="text-[9px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
