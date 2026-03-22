import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import { getSiteUrl } from "@/lib/site";

export default async function sitemap() {
  const siteUrl = getSiteUrl();
  const now = new Date();

  const staticRoutes = [
    "",
    "/shop",
    "/account/login",
    "/account/register",
    "/privacy-policy",
    "/terms-and-conditions",
    "/return-and-refund",
    "/shipping-information",
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  try {
    await connectDB();
    const products = await Product.find().select("_id updatedAt").lean();

    const productRoutes = products.map((product) => ({
      url: `${siteUrl}/product/${product._id}`,
      lastModified: product.updatedAt || now,
      changeFrequency: "daily",
      priority: 0.8,
    }));

    return [...staticRoutes, ...productRoutes];
  } catch {
    return staticRoutes;
  }
}
