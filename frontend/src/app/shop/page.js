import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";
import ShopClient from "./ShopClient";

export const revalidate = 60;

export const metadata = {
  title: "Shop Computers & Accessories",
  description:
    "Browse laptops, desktops, components, networking gear and accessories at Computer9. Filter by price, brand, category and specifications.",
  openGraph: {
    title: "Shop Computers & Accessories | Computer9",
    description:
      "Browse laptops, desktops, components, networking gear and accessories at Computer9.",
  },
};

export default async function ShopPage({ searchParams }) {
  const params = await searchParams;
  const categoryFilter = params?.category || "";
  const brandFilter = params?.brand || "";

  try {
    await connectDB();

    const query = {};
    if (categoryFilter) query.category = categoryFilter;
    if (brandFilter) query.brand = brandFilter;

    const [products, categories] = await Promise.all([
      Product.find(query)
        .select("name slug price originalPrice images category brand stock rating reviews tags createdAt")
        .sort({ createdAt: -1 })
        .lean(),
      Category.find({ isActive: true })
        .sort({ order: 1, name: 1 })
        .select("name slug image")
        .lean(),
    ]);

    const serialized = JSON.parse(JSON.stringify(products));
    const serializedCategories = JSON.parse(JSON.stringify(categories));

    return (
      <ShopClient
        initialProducts={serialized}
        categories={serializedCategories}
        initialCategory={categoryFilter}
        initialBrand={brandFilter}
      />
    );
  } catch {
    return <ShopClient initialProducts={[]} categories={[]} initialCategory="" initialBrand="" />;
  }
}
