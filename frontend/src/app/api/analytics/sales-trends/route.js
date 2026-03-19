import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';

export async function GET() {
  await connectDB();
  try {
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const orders = await Order.find({ createdAt: { $gte: since } });
    const trends = {};
    orders.forEach(o => {
      const day = o.createdAt.toISOString().slice(0, 10);
      trends[day] = (trends[day] || 0) + o.total;
    });
    return NextResponse.json(trends);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
