import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Cart from '@/models/Cart';

export async function POST(request, { params }) {
  await connectDB();
  try {
    const { productId, quantity } = await request.json();
    let cart = await Cart.findOne({ user: params.userId });
    if (!cart) cart = new Cart({ user: params.userId, items: [] });
    const existing = cart.items.find(i => i.product.toString() === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }
    await cart.save();
    return NextResponse.json(cart);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
