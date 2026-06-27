"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const BANNERS = [
  {
    title: "Upgrade Your Setup",
    subtitle: "Latest laptops & desktops at unbeatable prices",
    cta: "Shop Now",
    href: "/shop",
    bg: "bg-slate-900",
    accent: "text-amber-400",
  },
  {
    title: "Gaming Gear Sale",
    subtitle: "GPUs, keyboards & headsets — up to 30% off",
    cta: "View Deals",
    href: "/shop?category=Gaming",
    bg: "bg-indigo-950",
    accent: "text-cyan-400",
  },
  {
    title: "Networking Essentials",
    subtitle: "Routers & switches for seamless connectivity",
    cta: "Explore",
    href: "/shop?category=Networking",
    bg: "bg-emerald-950",
    accent: "text-emerald-300",
  },
];

export default function BannerCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setCurrent((c) => (c + 1) % BANNERS.length), []);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + BANNERS.length) % BANNERS.length), []);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, 4500);
    return () => clearInterval(timer);
  }, [paused, next]);

  const banner = BANNERS[current];

  return (
    <section
      className="relative overflow-hidden rounded-xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className={`${banner.bg} text-white px-8 py-7 sm:px-12 sm:py-8 transition-colors duration-500`}>
        <div className="flex items-center justify-between gap-8">
          <div>
            <h2 className={`text-lg sm:text-xl font-bold ${banner.accent}`}>
              {banner.title}
            </h2>
            <p className="mt-1 text-sm text-white/70 max-w-sm">
              {banner.subtitle}
            </p>
          </div>
          <Link
            href={banner.href}
            className="shrink-0 px-5 py-2.5 bg-white text-gray-900 font-semibold rounded-lg text-sm hover:bg-gray-100 transition-colors"
          >
            {banner.cta}
          </Link>
        </div>
      </div>

      {/* Nav Arrows */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white/80 hover:bg-white/20 transition-colors"
        aria-label="Previous"
      >
        <ChevronLeft size={14} />
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white/80 hover:bg-white/20 transition-colors"
        aria-label="Next"
      >
        <ChevronRight size={14} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
        {BANNERS.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all ${i === current ? "bg-white w-4" : "bg-white/30 w-1.5"}`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
