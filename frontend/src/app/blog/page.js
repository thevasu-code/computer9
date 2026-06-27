import Link from "next/link";
import { getSiteUrl } from "@/lib/site";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "Blog - Tech Guides & Buying Advice",
  description:
    "Read expert guides on laptops, desktops, components, and accessories. Get buying advice, comparisons, and tech tips from Computer9.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Blog - Tech Guides & Buying Advice | Computer9",
    description: "Expert guides on laptops, desktops, components. Buying advice and tech tips.",
    type: "website",
  },
};

// Static blog posts — in the future, move to a CMS or database
const BLOG_POSTS = [
  {
    slug: "best-laptops-under-50000",
    title: "Best Laptops Under ₹50,000 in 2026",
    excerpt: "Looking for a powerful laptop without breaking the bank? Here are our top picks for the best laptops under ₹50,000 with great performance and build quality.",
    category: "Buying Guide",
    date: "2026-06-15",
    image: null,
  },
  {
    slug: "ssd-vs-hdd-complete-guide",
    title: "SSD vs HDD — Complete Guide for 2026",
    excerpt: "Should you choose an SSD or HDD for your next build? We break down speed, durability, price, and use cases to help you decide.",
    category: "Tech Guide",
    date: "2026-06-10",
    image: null,
  },
  {
    slug: "how-to-choose-a-graphics-card",
    title: "How to Choose the Right Graphics Card",
    excerpt: "From gaming to video editing, choosing the right GPU can be confusing. This guide covers everything from VRAM to power requirements.",
    category: "Buying Guide",
    date: "2026-06-05",
    image: null,
  },
  {
    slug: "computer-maintenance-tips",
    title: "10 Essential Computer Maintenance Tips",
    excerpt: "Keep your PC running smoothly with these simple maintenance habits. From dust cleaning to software updates, here's what you need to know.",
    category: "Tips",
    date: "2026-05-28",
    image: null,
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-16 sm:pb-0">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Blog</h1>
          <p className="mt-2 text-sm text-gray-500">Tech guides, buying advice, and tips for your next purchase</p>
        </div>

        <div className="space-y-5">
          {BLOG_POSTS.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block bg-white rounded-xl border border-gray-100 p-5 sm:p-6 hover:shadow-md hover:border-gray-200 transition-all group"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded">
                  {post.category}
                </span>
                <span className="text-[10px] text-gray-400">
                  {new Date(post.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                </span>
              </div>
              <h2 className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                {post.title}
              </h2>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed line-clamp-2">
                {post.excerpt}
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 group-hover:gap-2 transition-all">
                Read More <ArrowRight size={12} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
