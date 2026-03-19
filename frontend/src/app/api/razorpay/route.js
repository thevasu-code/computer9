import Razorpay from 'razorpay';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { amount, billing, cart } = await request.json();
    if (!amount || !billing || !cart) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `order_rcptid_${Date.now()}`,
      notes: {
        name: billing.name,
        email: billing.email,
        address: billing.address,
      },
    });

    return NextResponse.json({ order, key: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
