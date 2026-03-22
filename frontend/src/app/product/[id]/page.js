import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import ProductDetailClient from "./ProductDetailClient";
import { buildProductSeoKeywords, buildProductStructuredData } from "@/lib/seo";

const defaultTitle = "Product | Computer9";
const defaultDescription = "Explore product details, pricing, and availability on Computer9.";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "";

export async function generateMetadata({ params }) {
  const { id } = await params;

  if (!id) {
    return {
      title: defaultTitle,
      description: defaultDescription,
    };
  }

  try {
    await connectDB();
    const product = await Product.findById(id).lean();

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
    const canonicalUrl = product.seo?.canonicalUrl?.trim() || (siteUrl ? `${siteUrl}/product/${product._id}` : undefined);
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
  const { id } = await params;
  let structuredData = null;

  try {
    await connectDB();
    const product = await Product.findById(id).lean();
    if (product) {
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
      <ProductDetailClient id={id} />
    </>
  );
}
