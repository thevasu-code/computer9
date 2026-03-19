import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { requireAdmin } from '@/lib/auth';

export const PUT = requireAdmin(async (request, { params }) => {
  const { id } = await params;
  await connectDB();
  try {
    const body = await request.json();
    const user = await User.findByIdAndUpdate(id, body, { new: true }).select('-password');
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json(user);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
});

export const DELETE = requireAdmin(async (request, { params }) => {
  const { id } = await params;
  await connectDB();
  try {
    await User.findByIdAndDelete(id);
    return NextResponse.json({ message: 'User deleted' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
});
