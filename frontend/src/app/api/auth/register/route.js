import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request) {
  await connectDB();
  try {
    const body = await request.json();
    const user = new User(body);
    await user.save();
    return NextResponse.json(user, { status: 201 });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return NextResponse.json({ error: messages.join(', ') }, { status: 400 });
    }
    if (err.code === 11000 && err.keyPattern?.email) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
