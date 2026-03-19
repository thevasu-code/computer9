import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';

export async function GET(request, { params }) {
  const { userId } = await params;
  await connectDB();
  try {
    const orders = await Order.find({ user: userId }).populate('products.product');
    return NextResponse.json(orders);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  const { userId } = await params;
  await connectDB();
  try {
    const body = await request.json();
    const order = await Order.create({ ...body, user: userId });
    return NextResponse.json(order, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
