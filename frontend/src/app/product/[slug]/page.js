import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import mongoose from "mongoose";
import ProductDetailClient from "./ProductDetailClient";
import { buildProductSeoKeywords, buildProductStructuredData } from "@/lib/seo";
import { getSiteUrl } from "@/lib/site";

const defaultTitle = "Product | Computer9";
const defaultDescription = "Explore product details, pricing, and availability on Computer9.";
const siteUrl = getSiteUrl();

async function findProduct(identifier) {
  await connectDB();
  // First try slug lookup
  let product = await Product.findOne({ slug: identifier }).lean();
  // Fallback to ObjectId
  if (!product && mongoose.Types.ObjectId.isValid(identifier)) {
    product = await Product.findById(identifier).lean();
  }
  return product;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;

  if (!slug) {
    return {
      title: defaultTitle,
      description: defaultDescription,
    };
  }

  try {
    const product = await findProduct(slug);

    if (!product) {
      return {
        title: defaultTitle,
        description: defaultDescription,
      };
    }

    const metaTitle = product.seo?.metaTitle?.trim() || `${product.name} | Computer9`;
    const metaDescription = product.seo?.metaDescription?.trim() || product.description?.trim() || defaultDescription;
    const keywords = buildProductSeoKeywords(product);
    const ogImage = product.seo?.ogImage || (Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : product.image);
    const productSlug = product.slug || product._id;
    const canonicalUrl = product.seo?.canonicalUrl?.trim() || (siteUrl ? `${siteUrl}/product/${productSlug}` : undefined);
    const noIndex = Boolean(product.seo?.noIndex);

    return {
      title: metaTitle,
      description: metaDescription,
      keywords,
      alternates: canonicalUrl ? { canonical: canonicalUrl } : undefined,
      robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
      openGraph: {
        title: metaTitle,
        description: metaDescription,
        type: "website",
        images: ogImage ? [{ url: ogImage }] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title: metaTitle,
        description: metaDescription,
        images: ogImage ? [ogImage] : undefined,
      },
    };
  } catch {
    return {
      title: defaultTitle,
      description: defaultDescription,
    };
  }
}

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  let structuredData = null;
  let productId = slug;

  try {
    const product = await findProduct(slug);
    if (product) {
      productId = product.slug || product._id;
      structuredData = buildProductStructuredData(product, siteUrl);
    }
  } catch {
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
      <ProductDetailClient slug={productId} />
    </>
  );
}