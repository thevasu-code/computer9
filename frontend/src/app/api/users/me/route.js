import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

export async function GET(request) {
  const decoded = verifyToken(request);
  if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  try {
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json(user);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
