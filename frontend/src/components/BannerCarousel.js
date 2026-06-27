"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const BANNERS = [
  {
    title: "Upgrade Your Setup",
    subtitle: "Latest laptops, desktops & components at unbeatable prices",
    cta: "Shop Now",
    href: "/shop",
    gradient: "from-blue-600 via-blue-700 to-indigo-800",
  },
  {
    title: "Gaming Gear Sale",
    subtitle: "Keyboards, mice, headsets & GPUs — up to 30% off",
    cta: "View Deals",
    href: "/shop?category=Gaming",
    gradient: "from-purple-600 via-purple-700 to-fuchsia-800",
  },
  {
    title: "Networking Essentials",
    subtitle: "Routers, switches & cables for seamless connectivity",
    cta: "Explore",
    href: "/shop?category=Networking",
    gradient: "from-emerald-600 via-teal-700 to-cyan-800",
  },
  {
    title: "Storage Solutions",
    subtitle: "SSDs, HDDs & NAS — keep your data safe & fast",
    cta: "Shop Storage",
    href: "/shop?category=Storage",
    gradient: "from-orange-500 via-red-600 to-rose-700",
  },
];

export default function BannerCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setCurrent((c) => (c + 1) % BANNERS.length), []);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + BANNERS.length) % BANNERS.length), []);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [paused, next]);

  const banner = BANNERS[current];

  return (
    <section
      className="relative overflow-hidden rounded-2xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className={`bg-gradient-to-br ${banner.gradient} text-white p-8 sm:p-12 lg:p-16 transition-all duration-500`}>
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
            {banner.title}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-white/80 max-w-md">
            {banner.subtitle}
          </p>
          <Link
            href={banner.href}
            className="mt-5 inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 font-semibold rounded-lg shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all text-sm"
          >
            {banner.cta}
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>

      {/* Nav Arrows */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        aria-label="Previous"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        aria-label="Next"
      >
        <ChevronRight size={18} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
        {BANNERS.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all ${i === current ? "bg-white w-6" : "bg-white/40"}`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
