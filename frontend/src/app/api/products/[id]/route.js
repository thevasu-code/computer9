import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { requireAdmin } from '@/lib/auth';
import { normalizeProductSeo, validateProductSeo } from '@/lib/seo';

export async function GET(request, { params }) {
  const { id } = await params;
  await connectDB();
  try {
    const product = await Product.findById(id);
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    return NextResponse.json(product);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export const PUT = requireAdmin(async (request, { params }) => {
  const { id } = await params;
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
    const product = await Product.findByIdAndUpdate(id, body, { new: true });
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    return NextResponse.json(product);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
});

export const DELETE = requireAdmin(async (request, { params }) => {
  const { id } = await params;
  await connectDB();
  try {
    const product = await Product.findByIdAndDelete(id);
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    return NextResponse.json({ message: 'Product deleted' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
});
