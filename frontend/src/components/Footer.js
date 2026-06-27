import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";

const FOOTER_LINKS = {
  shop: [
    { label: "All Products", href: "/shop" },
    { label: "Laptops", href: "/shop?category=Laptop" },
    { label: "Components", href: "/shop?category=Components" },
    { label: "Accessories", href: "/shop?category=Accessories" },
  ],
  support: [
    { label: "My Account", href: "/account/dashboard" },
    { label: "Track Orders", href: "/account/dashboard" },
    { label: "Wishlist", href: "/account/dashboard" },
    { label: "Contact Us", href: "/account" },
  ],
  policy: [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms & Conditions", href: "/terms-and-conditions" },
    { label: "Return & Refund", href: "/return-and-refund" },
    { label: "Shipping Info", href: "/shipping-information" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block">
              <h2 className="text-2xl font-bold text-white">
                Computer<span className="text-blue-400">9</span>
              </h2>
            </Link>
            <p className="mt-3 text-sm text-gray-400 leading-relaxed max-w-xs">
              Your trusted destination for computers, components, and accessories with secure checkout and fast delivery across India.
            </p>
            <div className="mt-5 space-y-2.5">
              <div className="flex items-center gap-2.5 text-sm">
                <Phone size={14} className="text-blue-400 shrink-0" />
                <span>+91 97519 78686</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <Mail size={14} className="text-blue-400 shrink-0" />
                <span>info@computer9.in</span>
              </div>
              <div className="flex items-start gap-2.5 text-sm">
                <MapPin size={14} className="text-blue-400 shrink-0 mt-0.5" />
                <span>Luciya City Centre, Shop 509, Nagarathpete, Bengaluru 560002</span>
              </div>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Shop</h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.shop.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Support</h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.support.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policy Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Policies</h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.policy.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Computer9. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              Secure Payments
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              Fast Shipping
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
              Easy Returns
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
