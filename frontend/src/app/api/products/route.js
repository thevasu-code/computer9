import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { requireAdmin } from '@/lib/auth';
import { normalizeProductSeo, validateProductSeo } from '@/lib/seo';

export async function GET(request) {
  await connectDB();

  const { searchParams } = new URL(request.url);
  const pageParam = searchParams.get('page');
  const limitParam = searchParams.get('limit');

  if (pageParam || limitParam) {
    const page = Math.max(1, Number.parseInt(pageParam || '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(limitParam || '30', 10) || 30));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Product.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Product.countDocuments(),
    ]);

    return NextResponse.json({
      items,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  }

  const products = await Product.find();
  return NextResponse.json(products, {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
  });
}

export const POST = requireAdmin(async (request) => {
  await connectDB();
  try {
    const body = await request.json();
    if (body?.seo) {
      body.seo = normalizeProductSeo(body.seo);
      const seoErrors = validateProductSeo(body.seo);
      if (seoErrors.length > 0) {
        return NextResponse.json({ error: seoErrors.join(' ') }, { status: 400 });
      }
    }
    const product = await Product.create(body);
    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
});
