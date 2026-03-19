import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import { verifyToken } from '@/lib/auth';

// Create order after payment
export async function POST(request) {
  await connectDB();
  try {
    const body = await request.json();
    const { billing, cart, items, total, paymentInfo, razorpayOrderId, razorpayPaymentId } = body;

    if (!total || !billing) {
      return NextResponse.json({ error: 'Missing order data' }, { status: 400 });
    }

    // Decode user from token if present
    let userId = null;
    try {
      const decoded = verifyToken(request);
      if (decoded && decoded.id) userId = decoded.id;
    } catch {}

    // Support both checkout format (items) and legacy format (cart)
    let products;
    if (items && Array.isArray(items)) {
      products = items.map(item => ({
        product: item.product,
        title: item.title || '',
        quantity: item.quantity,
        price: item.price,
        image: '',
      }));
    } else if (cart && Array.isArray(cart)) {
      products = cart.map(item => ({
        product: item.product?._id,
        title: item.product?.name || item.product?.title || '',
        quantity: item.quantity,
        price: item.product?.price,
        image: item.product?.images?.[0] || '',
      }));
    } else {
      return NextResponse.json({ error: 'Missing cart/items' }, { status: 400 });
    }

    const order = await Order.create({
      ...(userId ? { user: userId } : {}),
      products,
      total,
      address: `${billing.address}, ${billing.pincode}`,
      paymentInfo: {
        ...paymentInfo,
        razorpayOrderId,
        razorpayPaymentId,
        name: billing.name,
        email: billing.email,
        phone: billing.phone,
      },
    });
    return NextResponse.json(order, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

// Get orders for authenticated user
export async function GET(request) {
  const decoded = verifyToken(request);
  if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  try {
    const orders = await Order.find({ user: decoded.id }).sort({ createdAt: -1 });
    return NextResponse.json(orders);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
