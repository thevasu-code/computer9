import { NextResponse } from 'next/server';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request) {
  await connectDB();
  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

    const user = await User.findOne({ email: email.toLowerCase() });
    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ message: 'If that email exists, a reset link has been sent.' });
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const resetUrl = `${siteUrl}/account/reset-password?token=${token}`;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || `Computer9 <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: 'Reset your Computer9 password',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f1f3f6;">
          <div style="background:#2874f0;padding:20px 24px;border-radius:4px 4px 0 0;">
            <h2 style="color:#fff;margin:0;font-size:20px;">Password Reset Request</h2>
          </div>
          <div style="background:#fff;padding:28px 24px;border-radius:0 0 4px 4px;">
            <p style="color:#212121;font-size:15px;">Hi <strong>${user.name}</strong>,</p>
            <p style="color:#444;font-size:14px;line-height:1.6;">We received a request to reset your Computer9 account password. Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>
            <div style="text-align:center;margin:28px 0;">
              <a href="${resetUrl}" style="background:#fb641b;color:#fff;text-decoration:none;padding:12px 28px;border-radius:2px;font-size:15px;font-weight:600;display:inline-block;">Reset Password</a>
            </div>
            <p style="color:#878787;font-size:12px;">If you did not request this, you can safely ignore this email. Your password will not be changed.</p>
            <p style="color:#878787;font-size:12px;">Or copy this link:<br>${resetUrl}</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    return NextResponse.json({ error: 'Failed to send reset email. Please check SMTP configuration.' }, { status: 500 });
  }
}
