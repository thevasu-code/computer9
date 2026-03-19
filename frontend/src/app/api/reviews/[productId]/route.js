import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Review from '@/models/Review';

export async function GET(request, { params }) {
  await connectDB();
  try {
    const reviews = await Review.find({ product: params.productId }).populate('user', 'name');
    return NextResponse.json(reviews);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  await connectDB();
  try {
    const body = await request.json();
    const review = await Review.create({ ...body, product: params.productId });
    return NextResponse.json(review, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
