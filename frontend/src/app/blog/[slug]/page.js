import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSiteUrl } from "@/lib/site";

const siteUrl = getSiteUrl();

// In future, these would come from a CMS or database
const POSTS = {
  "best-laptops-under-50000": {
    title: "Best Laptops Under ₹50,000 in 2026",
    category: "Buying Guide",
    date: "2026-06-15",
    content: `
      <p>Finding a great laptop under ₹50,000 doesn't mean compromising on performance. The market in 2026 offers excellent options with 12th/13th gen Intel processors, decent GPUs, and fast SSDs at this price point.</p>
      
      <h2>What to Look For</h2>
      <ul>
        <li><strong>Processor:</strong> Intel Core i5 12th gen or AMD Ryzen 5 5000 series minimum</li>
        <li><strong>RAM:</strong> 8GB minimum, 16GB preferred</li>
        <li><strong>Storage:</strong> 512GB SSD (avoid HDD-only options)</li>
        <li><strong>Display:</strong> Full HD (1920×1080) IPS panel</li>
        <li><strong>Battery:</strong> 6+ hours for real-world usage</li>
      </ul>

      <h2>Our Top Picks</h2>
      <p>Visit our <a href="/shop?category=Laptop">Laptops section</a> to browse the latest options with verified prices and availability.</p>

      <h2>Final Thoughts</h2>
      <p>The best laptop for you depends on your use case — gaming, office work, or content creation. Consider your primary workload before choosing between a powerful processor or a dedicated GPU.</p>
    `,
  },
  "ssd-vs-hdd-complete-guide": {
    title: "SSD vs HDD — Complete Guide for 2026",
    category: "Tech Guide",
    date: "2026-06-10",
    content: `
      <p>The choice between SSD and HDD comes down to speed vs. capacity vs. price. Here's everything you need to know.</p>

      <h2>Speed Comparison</h2>
      <p>SSDs are 5-10x faster than HDDs for read/write operations. Boot times drop from 30-60 seconds to under 10 seconds with an SSD.</p>

      <h2>Price Per GB</h2>
      <p>HDDs still win on price per gigabyte — around ₹2-3/GB vs ₹5-8/GB for SSDs. For mass storage (4TB+), HDDs remain practical.</p>

      <h2>Durability</h2>
      <p>SSDs have no moving parts, making them more resistant to drops and vibration. HDDs are sensitive to physical shock.</p>

      <h2>Recommendation</h2>
      <p>Use an SSD for your operating system and frequently used applications. Add an HDD for bulk storage like videos and backups. Browse our <a href="/shop?category=Storage">Storage section</a> for the latest deals.</p>
    `,
  },
  "how-to-choose-a-graphics-card": {
    title: "How to Choose the Right Graphics Card",
    category: "Buying Guide",
    date: "2026-06-05",
    content: `
      <p>Whether you're gaming, editing video, or doing 3D work, the GPU is the most important component. Here's how to choose wisely.</p>

      <h2>Key Specifications</h2>
      <ul>
        <li><strong>VRAM:</strong> 6GB minimum for 1080p gaming, 8GB+ for 1440p/4K</li>
        <li><strong>Clock Speed:</strong> Higher is better, but architecture matters more</li>
        <li><strong>TDP:</strong> Make sure your power supply can handle it</li>
        <li><strong>Cooling:</strong> Dual/triple fan designs run cooler and quieter</li>
      </ul>

      <h2>Budget Tiers</h2>
      <p>Under ₹20,000: Great for 1080p gaming. ₹20,000-₹40,000: Excellent 1440p performance. ₹40,000+: 4K and ray tracing capable.</p>

      <p>Check our <a href="/shop?category=Graphics">Graphics Cards section</a> for current availability and pricing.</p>
    `,
  },
  "computer-maintenance-tips": {
    title: "10 Essential Computer Maintenance Tips",
    category: "Tips",
    date: "2026-05-28",
    content: `
      <p>A well-maintained computer lasts longer and performs better. Follow these 10 tips to keep your PC in top shape.</p>

      <h2>Hardware Maintenance</h2>
      <ol>
        <li><strong>Clean dust regularly</strong> — Use compressed air every 3-6 months</li>
        <li><strong>Monitor temperatures</strong> — Keep CPU below 80°C under load</li>
        <li><strong>Check cables</strong> — Loose connections cause random shutdowns</li>
        <li><strong>Replace thermal paste</strong> — Every 2-3 years for optimal cooling</li>
        <li><strong>Keep ventilation clear</strong> — Don't block intake/exhaust fans</li>
      </ol>

      <h2>Software Maintenance</h2>
      <ol start="6">
        <li><strong>Update your OS</strong> — Security patches are critical</li>
        <li><strong>Update drivers</strong> — Especially GPU drivers for stability</li>
        <li><strong>Run disk cleanup</strong> — Remove temp files monthly</li>
        <li><strong>Scan for malware</strong> — Use Windows Defender at minimum</li>
        <li><strong>Backup your data</strong> — 3-2-1 rule: 3 copies, 2 media types, 1 offsite</li>
      </ol>

      <p>Need replacement parts? Browse our <a href="/shop">full catalog</a> for components and accessories.</p>
    `,
  },
};

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = POSTS[slug];
  if (!post) return { title: "Post Not Found | Computer9" };

  return {
    title: post.title,
    description: post.content.replace(/<[^>]+>/g, "").trim().slice(0, 160),
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: `${post.title} | Computer9 Blog`,
      description: post.content.replace(/<[^>]+>/g, "").trim().slice(0, 160),
      type: "article",
      publishedTime: post.date,
    },
  };
}

export async function generateStaticParams() {
  return Object.keys(POSTS).map((slug) => ({ slug }));
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = POSTS[slug];

  if (!post) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Post Not Found</h1>
          <Link href="/blog" className="text-sm text-blue-600 font-medium">← Back to Blog</Link>
        </div>
      </div>
    );
  }

  // Article schema
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    datePublished: post.date,
    author: { "@type": "Organization", name: "Computer9" },
    publisher: { "@type": "Organization", name: "Computer9", url: siteUrl },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <div className="min-h-screen bg-gray-50 pb-16 sm:pb-0">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 mb-6">
            <ArrowLeft size={14} />
            Back to Blog
          </Link>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded">
                {post.category}
              </span>
              <span className="text-xs text-gray-400">
                {new Date(post.date).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-6">
              {post.title}
            </h1>

            <div
              className="prose prose-sm sm:prose max-w-none prose-headings:text-gray-900 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>
        </article>
      </div>
    </>
  );
}
