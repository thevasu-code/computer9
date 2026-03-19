import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(request, { params }) {
  await connectDB();
  try {
    const user = await User.findById(params.userId).populate('wishlist');
    return NextResponse.json(user ? user.wishlist : []);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
