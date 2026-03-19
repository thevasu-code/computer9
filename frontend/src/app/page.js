
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import HomeClient from './HomeClient';

// ISR: rebuild this page at most every 60 seconds — served from CDN cache
export const revalidate = 60;

export default async function Home() {
  try {
    await connectDB();
    const raw = await Product.find()
      .select('name price originalPrice images image category')
      .lean();
    const products = JSON.parse(JSON.stringify(raw));
    return <HomeClient initialProducts={products} />;
  } catch {
    return <HomeClient initialProducts={[]} />;
  }
}
