import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Review from '@/models/Review';

export async function GET(request, { params }) {
  const { productId } = await params;
  await connectDB();
  try {
    const reviews = await Review.find({ product: productId }).populate('user', 'name');
    return NextResponse.json(reviews);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  const { productId } = await params;
  await connectDB();
  try {
    const body = await request.json();
    const review = await Review.create({ ...body, product: productId });
    return NextResponse.json(review, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
