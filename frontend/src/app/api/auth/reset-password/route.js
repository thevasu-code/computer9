import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request) {
  await connectDB();
  try {
    const { token, password } = await request.json();
    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const cleanToken = token.trim();

    // First check if token exists at all (ignoring expiry)
    const anyUser = await User.findOne({ resetPasswordToken: cleanToken });
    if (!anyUser) {
      return NextResponse.json({ error: 'Reset link is invalid. Please request a new one.' }, { status: 400 });
    }
    // Now check if it is expired
    if (!anyUser.resetPasswordExpires || anyUser.resetPasswordExpires < new Date()) {
      // Clear expired token
      anyUser.resetPasswordToken = undefined;
      anyUser.resetPasswordExpires = undefined;
      await anyUser.save();
      return NextResponse.json({ error: 'Reset link has expired. Please request a new password reset.' }, { status: 400 });
    }
    const user = anyUser;

    user.password = password; // pre-save hook will hash it
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return NextResponse.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (err) {
    console.error('Reset password error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
