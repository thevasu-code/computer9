import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import mongoose from "mongoose";
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

  if (!slug) {
    return { title: defaultTitle, description: defaultDescription };
  }

  try {
    const product = await findProduct(slug);
    if (!product) {
      return { title: defaultTitle, description: defaultDescription };
    }

    const metaTitle = product.seo?.metaTitle?.trim() || `${product.name} - Buy Online at Best Price | Computer9`;
    const metaDescription =
      product.seo?.metaDescription?.trim() ||
      product.description?.trim()?.slice(0, 160) ||
      `Buy ${product.name} at ₹${product.price?.toLocaleString("en-IN")} with secure checkout and fast delivery. ${defaultDescription}`;
    const keywords = buildProductSeoKeywords(product);
    const ogImage = product.seo?.ogImage || (Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : product.image);
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

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  let product = null;
  let structuredData = null;

  try {
    const raw = await findProduct(slug);
    if (raw) {
      product = JSON.parse(JSON.stringify(raw));
      structuredData = buildProductStructuredData(raw, siteUrl);
    }
  } catch {
    product = null;
    structuredData = null;
  }

  return (
    <>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      <ProductDetailClient product={product} />
    </>
  );
}
