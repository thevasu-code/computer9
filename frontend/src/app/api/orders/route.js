import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';

// Guest / post-payment checkout order
export async function POST(request) {
  await connectDB();
  try {
    const { billing, cart, total, paymentInfo } = await request.json();
    if (!billing || !cart || !total) {
      return NextResponse.json({ error: 'Missing order data' }, { status: 400 });
    }
    const products = cart.map(item => ({
      title: item.product.name || item.product.title,
      quantity: item.quantity,
      price: item.product.price,
      image: item.product.images?.[0] || '',
    }));
    const order = await Order.create({
      products,
      total,
      address: billing.address,
      paymentInfo,
    });
    return NextResponse.json(order, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
