import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { getSiteUrl } from "@/lib/site";

export default async function sitemap() {
  const siteUrl = getSiteUrl();
  const now = new Date();

  const staticRoutes = [
    { path: "", priority: 1.0, changeFrequency: "daily" },
    { path: "/shop", priority: 0.9, changeFrequency: "daily" },
    { path: "/account/login", priority: 0.3, changeFrequency: "monthly" },
    { path: "/account/register", priority: 0.3, changeFrequency: "monthly" },
    { path: "/privacy-policy", priority: 0.2, changeFrequency: "yearly" },
    { path: "/terms-and-conditions", priority: 0.2, changeFrequency: "yearly" },
    { path: "/return-and-refund", priority: 0.2, changeFrequency: "yearly" },
    { path: "/shipping-information", priority: 0.2, changeFrequency: "yearly" },
  ].map((route) => ({
    url: `${siteUrl}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  try {
    await connectDB();

    const [products, categories] = await Promise.all([
      Product.find({ "seo.noIndex": { $ne: true } }).select("_id slug updatedAt").lean(),
      Category.find({ isActive: true }).select("slug updatedAt").lean(),
    ]);

    const productRoutes = products.map((product) => ({
      url: `${siteUrl}/product/${product.slug || product._id}`,
      lastModified: product.updatedAt || now,
      changeFrequency: "daily",
      priority: 0.8,
    }));

    const categoryRoutes = categories
      .filter((cat) => cat.slug)
      .map((cat) => ({
        url: `${siteUrl}/shop?category=${encodeURIComponent(cat.slug)}`,
        lastModified: cat.updatedAt || now,
        changeFrequency: "weekly",
        priority: 0.7,
      }));

    return [...staticRoutes, ...categoryRoutes, ...productRoutes];
  } catch {
    return staticRoutes;
  }
}
