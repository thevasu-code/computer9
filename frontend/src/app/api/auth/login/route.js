import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { signToken } from '@/lib/auth';

export async function POST(request) {
  await connectDB();
  try {
    const { email, password } = await request.json();
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    const payload = { id: user._id, isAdmin: user.isAdmin };
    if (user.isAdmin) payload.role = 'admin';
    const token = signToken(payload);
    return NextResponse.json({ token, user });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
