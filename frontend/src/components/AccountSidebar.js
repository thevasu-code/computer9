"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User, Package, MapPin, Heart, ShoppingCart, LogOut, Settings, LayoutDashboard } from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/account/dashboard", icon: LayoutDashboard },
  { label: "My Orders", href: "/account/dashboard#orders", icon: Package },
  { label: "Addresses", href: "/account/dashboard#billing", icon: MapPin },
  { label: "Wishlist", href: "/account/dashboard#wishlist", icon: Heart },
  { label: "Cart", href: "/cart", icon: ShoppingCart },
];

export default function AccountSidebar({ user }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminToken");
    window.dispatchEvent(new Event("storage"));
    router.push("/account/login");
  };

  return (
    <aside className="w-full lg:w-60 shrink-0">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden sticky top-20">
        {/* User Info */}
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || "User"}</p>
            <p className="text-[11px] text-gray-400 truncate">{user?.email || ""}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="py-2 px-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href.includes("#") && pathname === "/account/dashboard");
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive && !item.href.includes("#")
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon size={16} className={isActive && !item.href.includes("#") ? "text-blue-600" : "text-gray-400"} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-2 pb-3 border-t border-gray-100 pt-2">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full transition-colors"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}
