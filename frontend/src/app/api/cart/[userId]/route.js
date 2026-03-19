import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Cart from '@/models/Cart';

export async function GET(request, { params }) {
  const { userId } = await params;
  await connectDB();
  try {
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    return NextResponse.json(cart || { items: [] });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
