import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import mongoose from "mongoose";
import { redirect } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";
import { buildProductSeoKeywords, buildProductStructuredData } from "@/lib/seo";
import { getSiteUrl } from "@/lib/site";

export const revalidate = 60;

const defaultTitle = "Product | Computer9";
const defaultDescription = "Explore product details, pricing, and availability on Computer9.";
const siteUrl = getSiteUrl();

async function findProduct(identifier) {
  await connectDB();
  let product = await Product.findOne({ slug: identifier }).lean();
  if (!product && mongoose.Types.ObjectId.isValid(identifier)) {
    product = await Product.findById(identifier).lean();
  }
  return product;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  if (!slug) return { title: defaultTitle, description: defaultDescription };

  try {
    const product = await findProduct(slug);
    if (!product) return { title: defaultTitle, description: defaultDescription };

    const metaTitle = product.seo?.metaTitle?.trim() || `${product.name} - Buy Online at Best Price | Computer9`;
    const metaDescription =
      product.seo?.metaDescription?.trim() ||
      product.description?.trim()?.slice(0, 160) ||
      `Buy ${product.name} at ₹${product.price?.toLocaleString("en-IN")} with secure checkout and fast delivery.`;
    const keywords = buildProductSeoKeywords(product);
    const ogImage = product.seo?.ogImage || product.images?.[0] || product.image;
    const productSlug = product.slug || product._id;
    const canonicalUrl = product.seo?.canonicalUrl?.trim() || `${siteUrl}/product/${productSlug}`;
    const noIndex = Boolean(product.seo?.noIndex);

    return {
      title: metaTitle,
      description: metaDescription,
      keywords,
      alternates: { canonical: canonicalUrl },
      robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
      openGraph: {
        title: metaTitle,
        description: metaDescription,
        type: "website",
        url: canonicalUrl,
        images: ogImage ? [{ url: ogImage, width: 800, height: 800, alt: product.name }] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title: metaTitle,
        description: metaDescription,
        images: ogImage ? [ogImage] : undefined,
      },
    };
  } catch {
    return { title: defaultTitle, description: defaultDescription };
  }
}

function buildBreadcrumbSchema(product) {
  const productSlug = product.slug || product._id;
  const items = [
    { name: "Home", url: siteUrl },
    { name: "Shop", url: `${siteUrl}/shop` },
  ];
  if (product.category) {
    items.push({ name: product.category, url: `${siteUrl}/category/${encodeURIComponent(product.category.toLowerCase().replace(/\s+/g, "-"))}` });
  }
  items.push({ name: product.name, url: `${siteUrl}/product/${productSlug}` });

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  let product = null;
  let structuredData = null;
  let breadcrumbSchema = null;
  let relatedProducts = [];

  try {
    const raw = await findProduct(slug);
    if (raw) {
      // #9: Redirect ObjectID URLs to slug URLs
      if (mongoose.Types.ObjectId.isValid(slug) && raw.slug && raw.slug !== slug) {
        redirect(`/product/${raw.slug}`);
      }

      product = JSON.parse(JSON.stringify(raw));
      structuredData = buildProductStructuredData(raw, siteUrl);
      breadcrumbSchema = buildBreadcrumbSchema(raw);

      // #3: Related products (same category, exclude current)
      if (raw.category) {
        const related = await Product.find({
          category: raw.category,
          _id: { $ne: raw._id },
        })
          .select("name slug price originalPrice images category brand rating")
          .limit(5)
          .lean();
        relatedProducts = JSON.parse(JSON.stringify(related));
      }
    }
  } catch (err) {
    // If redirect was called, it throws — let it propagate
    if (err?.digest?.includes("NEXT_REDIRECT")) throw err;
    product = null;
  }

  return (
    <>
      {structuredData && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      )}
      {breadcrumbSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      )}
      <ProductDetailClient product={product} relatedProducts={relatedProducts} />
    </>
  );
}
