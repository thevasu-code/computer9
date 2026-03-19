import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Cart from '@/models/Cart';

export async function POST(request, { params }) {
  const { userId } = await params;
  await connectDB();
  try {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    cart.items = [];
    await cart.save();
    return NextResponse.json(cart);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
