import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request, { params }) {
  await connectDB();
  try {
    const { productId } = await request.json();
    const user = await User.findById(params.userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if (!user.wishlist.includes(productId)) {
      user.wishlist.push(productId);
      await user.save();
    }
    return NextResponse.json(user.wishlist);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
