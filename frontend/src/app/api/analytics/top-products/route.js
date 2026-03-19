import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';

export async function GET() {
  await connectDB();
  try {
    const orders = await Order.find();
    const productSales = {};
    orders.forEach(o => {
      o.products.forEach(p => {
        if (p.product) {
          productSales[p.product] = (productSales[p.product] || 0) + (p.quantity || 1);
        }
      });
    });
    const top = Object.entries(productSales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    const products = await Product.find({ _id: { $in: top.map(([id]) => id) } });
    return NextResponse.json(products.map(p => ({ ...p.toObject(), sold: productSales[p._id] })));
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
