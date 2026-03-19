import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import { verifyToken } from '@/lib/auth';

function getMailTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

async function sendOrderEmails(order, billing, products) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return;
  const transporter = getMailTransporter();
  const from = process.env.SMTP_FROM || `Computer9 <${process.env.SMTP_USER}>`;
  const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

  const itemRows = products.map(p =>
    `<tr>
      <td style="padding:8px;border-bottom:1px solid #f1f3f6;">${p.title || 'Product'}</td>
      <td style="padding:8px;border-bottom:1px solid #f1f3f6;text-align:center;">${p.quantity}</td>
      <td style="padding:8px;border-bottom:1px solid #f1f3f6;text-align:right;">₹${p.price?.toLocaleString('en-IN')}</td>
    </tr>`
  ).join('');

  const baseHtml = (heading, intro) => `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#f1f3f6;">
      <div style="background:#2874f0;padding:18px 24px;border-radius:4px 4px 0 0;">
        <h2 style="color:#fff;margin:0;font-size:19px;">${heading}</h2>
      </div>
      <div style="background:#fff;padding:24px;border-radius:0 0 4px 4px;">
        ${intro}
        <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px;">
          <thead><tr style="background:#f1f3f6;">
            <th style="padding:8px;text-align:left;">Item</th>
            <th style="padding:8px;text-align:center;">Qty</th>
            <th style="padding:8px;text-align:right;">Price</th>
          </tr></thead>
          <tbody>${itemRows}</tbody>
        </table>
        <p style="font-size:15px;font-weight:700;color:#212121;text-align:right;margin:0;">Total: ₹${order.total?.toLocaleString('en-IN')}</p>
        <hr style="margin:16px 0;border:none;border-top:1px solid #e0e0e0;">
        <p style="font-size:13px;color:#444;margin:0;"><strong>Delivery to:</strong><br>${billing.name} — ${billing.phone}<br>${order.address}</p>
        <p style="font-size:12px;color:#878787;margin-top:12px;">Order ID: ${order._id}</p>
      </div>
    </div>`;

  // Email to customer
  if (billing.email) {
    await transporter.sendMail({
      from, to: billing.email,
      subject: `Order Confirmed! #${order._id}`,
      html: baseHtml(
        '🎉 Order Confirmed',
        `<p style="font-size:15px;color:#212121;">Hi <strong>${billing.name}</strong>, your order has been placed successfully!</p>`
      ),
    }).catch(() => {});
  }

  // Email to admin
  await transporter.sendMail({
    from, to: adminEmail,
    subject: `New Order #${order._id} — ₹${order.total?.toLocaleString('en-IN')}`,
    html: baseHtml(
      '📦 New Order Received',
      `<p style="font-size:15px;color:#212121;"><strong>Customer:</strong> ${billing.name} (${billing.email || 'no email'}) — ${billing.phone}</p>`
    ),
  }).catch(() => {});
}

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
        image: item.image || '',
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

    // Send confirmation emails (non-blocking)
    sendOrderEmails(order, billing, products).catch(() => {});

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
    const orders = await Order.find({ user: decoded.id })
      .sort({ createdAt: -1 })
      .populate('products.product', 'name images price');
    return NextResponse.json(orders);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
