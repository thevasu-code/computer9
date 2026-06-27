import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { getSiteUrl } from "@/lib/site";
import CategoryPageClient from "./CategoryPageClient";

export const revalidate = 60;

const siteUrl = getSiteUrl();

async function findCategory(slug) {
  await connectDB();
  // Try by slug first, then by name (case-insensitive)
  let category = await Category.findOne({ slug }).lean();
  if (!category) {
    const decoded = decodeURIComponent(slug).replace(/-/g, " ");
    category = await Category.findOne({ name: new RegExp(`^${decoded}$`, "i") }).lean();
  }
  return category;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const category = await findCategory(slug);

  if (!category) {
    return { title: "Category Not Found | Computer9" };
  }

  const title = `${category.name} - Buy Online at Best Prices | Computer9`;
  const description = category.description?.trim() ||
    `Shop ${category.name} at Computer9. Browse the latest ${category.name.toLowerCase()} with secure checkout, fast delivery, and best prices in India.`;

  return {
    title,
    description,
    alternates: { canonical: `${siteUrl}/category/${category.slug}` },
    openGraph: {
      title,
      description,
      type: "website",
      url: `${siteUrl}/category/${category.slug}`,
      images: category.image ? [{ url: category.image, alt: category.name }] : undefined,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function CategoryPage({ params }) {
  const { slug } = await params;

  let category = null;
  let products = [];
  let breadcrumbSchema = null;

  try {
    category = await findCategory(slug);
    if (category) {
      products = await Product.find({ category: category.name })
        .select("name slug price originalPrice images category brand stock rating reviews createdAt")
        .sort({ createdAt: -1 })
        .lean();
      products = JSON.parse(JSON.stringify(products));

      // Breadcrumb schema
      breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "Shop", item: `${siteUrl}/shop` },
          { "@type": "ListItem", position: 3, name: category.name, item: `${siteUrl}/category/${category.slug}` },
        ],
      };
    }
  } catch {
    category = null;
    products = [];
  }

  if (!category) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Category Not Found</h1>
          <p className="text-gray-500">This category doesn&apos;t exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const categoryData = JSON.parse(JSON.stringify(category));

  return (
    <>
      {breadcrumbSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      )}
      <CategoryPageClient category={categoryData} products={products} />
    </>
  );
}
