import React from "react";
import ProductCard from "../components/ProductCard";

const demoProducts = [
  {
    id: 1,
    name: "Gaming Laptop XYZ",
    description: "High performance gaming laptop with RTX 4060, 16GB RAM, 1TB SSD.",
    price: 129999,
    originalPrice: 149999,
    image: "/file.svg",
  },
  {
    id: 2,
    name: "Mechanical Keyboard Pro",
    description: "RGB, hot-swappable switches, aluminum body.",
    price: 7999,
    originalPrice: 9999,
    image: "/globe.svg",
  },
  {
    id: 3,
    name: "4K Monitor UltraSharp",
    description: "27-inch, 144Hz, IPS, HDR, USB-C.",
    price: 34999,
    originalPrice: 39999,
    image: "/window.svg",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans">
      <main className="max-w-7xl mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold mb-8 text-zinc-900 dark:text-zinc-50 text-center">
          Computer & Hardware Deals
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {demoProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </main>
    </div>
  );
}
