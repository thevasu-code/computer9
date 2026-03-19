import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';

export async function GET() {
  await connectDB();
  try {
    const orders = await Order.find();
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = orders.length;
    return NextResponse.json({ totalRevenue, totalOrders });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
