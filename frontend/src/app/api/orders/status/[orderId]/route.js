import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';

export async function PUT(request, { params }) {
  await connectDB();
  try {
    const body = await request.json();
    const order = await Order.findByIdAndUpdate(params.orderId, body, { new: true });
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    return NextResponse.json(order);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
