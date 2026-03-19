import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Cart from '@/models/Cart';

export async function POST(request, { params }) {
  await connectDB();
  try {
    const { productId } = await request.json();
    const cart = await Cart.findOne({ user: params.userId });
    if (!cart) return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    cart.items = cart.items.filter(i => i.product.toString() !== productId);
    await cart.save();
    return NextResponse.json(cart);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
