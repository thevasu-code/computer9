import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import mongoose from 'mongoose';

export async function GET(request, { params }) {
  const { slug } = await params;
  await connectDB();

  try {
    // First try slug lookup
    let product = await Product.findOne({ slug }).lean();
    // Fallback to ObjectId
    if (!product && mongoose.Types.ObjectId.isValid(slug)) {
      product = await Product.findById(slug).lean();
    }
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}