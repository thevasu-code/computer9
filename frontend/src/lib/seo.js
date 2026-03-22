const META_TITLE_MAX = 70;
const META_DESCRIPTION_MAX = 160;

function toTrimmedString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function clampText(value, max) {
  return value.length > max ? value.slice(0, max) : value;
}

function uniqueNonEmpty(items) {
  return [...new Set(items.map((item) => toTrimmedString(item)).filter(Boolean))];
}

function isValidHttpUrl(value) {
  if (!value) return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function normalizeProductSeo(seo = {}) {
  const keywordsSource = Array.isArray(seo.keywords)
    ? seo.keywords
    : typeof seo.keywords === "string"
      ? seo.keywords.split(",")
      : [];

  return {
    metaTitle: clampText(toTrimmedString(seo.metaTitle), META_TITLE_MAX),
    metaDescription: clampText(toTrimmedString(seo.metaDescription), META_DESCRIPTION_MAX),
    keywords: uniqueNonEmpty(keywordsSource).slice(0, 20),
    ogImage: toTrimmedString(seo.ogImage),
    canonicalUrl: toTrimmedString(seo.canonicalUrl),
    noIndex: Boolean(seo.noIndex),
  };
}

export function validateProductSeo(seo = {}) {
  const errors = [];
  const canonicalUrl = toTrimmedString(seo.canonicalUrl);
  const ogImage = toTrimmedString(seo.ogImage);

  if (canonicalUrl && !isValidHttpUrl(canonicalUrl)) {
    errors.push("SEO canonical URL must be a valid http/https URL.");
  }
  if (ogImage && !isValidHttpUrl(ogImage)) {
    errors.push("SEO social image must be a valid http/https URL.");
  }

  return errors;
}

export function buildProductSeoKeywords(product = {}) {
  const explicit = Array.isArray(product?.seo?.keywords) ? product.seo.keywords : [];
  if (explicit.length > 0) return uniqueNonEmpty(explicit).slice(0, 20);

  const tags = Array.isArray(product.tags) ? product.tags : [];
  const fallback = [product.name, product.category, product.brand, ...tags];
  return uniqueNonEmpty(fallback).slice(0, 12);
}

export function buildProductStructuredData(product = {}, siteUrl = "") {
  const productId = product?._id ? String(product._id) : "";
  const productUrl = siteUrl && productId ? `${siteUrl}/product/${productId}` : undefined;
  const images = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
  const primaryImage = images[0] || product.image;
  const offerUrl = product.seo?.canonicalUrl || productUrl;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.seo?.metaDescription || product.description || "",
    image: images.length > 0 ? images : primaryImage ? [primaryImage] : undefined,
    sku: product.sku || productId || undefined,
    brand: product.brand
      ? {
          "@type": "Brand",
          name: product.brand,
        }
      : undefined,
    category: product.category || undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: typeof product.price === "number" ? product.price.toString() : undefined,
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: offerUrl,
      itemCondition: "https://schema.org/NewCondition",
    },
    aggregateRating:
      typeof product.rating === "number" && product.rating > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: Array.isArray(product.reviews) ? product.reviews.length : 0,
          }
        : undefined,
  };
}
