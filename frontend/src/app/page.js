
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import HomeClient from './HomeClient';

// ISR: rebuild this page at most every 60 seconds — served from CDN cache
export const revalidate = 60;

export default async function Home() {
  try {
    await connectDB();
    const [raw, rawCategories] = await Promise.all([
      Product.find()
        .select('name slug price originalPrice images image category brand stock rating reviews createdAt')
        .lean(),
      Category.find({ isActive: true })
        .sort({ order: 1, name: 1 })
        .select('name slug image')
        .lean(),
    ]);
    const products = JSON.parse(JSON.stringify(raw));
    const categories = JSON.parse(JSON.stringify(rawCategories));
    return <HomeClient initialProducts={products} categories={categories} />;
  } catch {
    return <HomeClient initialProducts={[]} categories={[]} />;
  }
}
