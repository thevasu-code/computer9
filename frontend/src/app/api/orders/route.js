import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { verifyToken } from '@/lib/auth';
import { getSiteUrl } from '@/lib/site';

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
  const defaultFrom = "Computer9 <admin@computer9.in>";
  const from = process.env.SMTP_FROM || defaultFrom;
  const adminEmail = process.env.ADMIN_EMAIL || "admin@computer9.in";
  const siteUrl = getSiteUrl();

  const rupee = 'Rs ';

  // Format order time in IST
  const orderTime = new Date(order.createdAt || Date.now()).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'full',
    timeStyle: 'short',
  });

  const itemRows = products.map(p => {
    const productSlug = p?.product?.slug ? String(p.product.slug) : (p?.product ? String(p.product) : '');
    const productLink = productSlug ? `${siteUrl}/product/${productSlug}` : '';
    return (
    `<tr>
      <td style="padding:10px 8px;border-bottom:1px solid #f1f3f6;font-size:14px;">
        <div style="font-weight:600;color:#1f2937;">${p.title || 'Product'}</div>
        ${productLink ? `<a href="${productLink}" style="display:inline-block;margin-top:4px;font-size:12px;color:#1d4ed8;text-decoration:none;">View Product</a>` : ''}
      </td>
      <td style="padding:10px 8px;border-bottom:1px solid #f1f3f6;text-align:center;font-size:14px;">${p.quantity}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #f1f3f6;text-align:right;font-size:14px;font-weight:600;">${rupee}${Number(p.price || 0).toLocaleString('en-IN')}</td>
    </tr>`
    );
  }).join('');

  const paymentId = order.paymentInfo?.razorpayPaymentId || order.paymentInfo?.transactionId || 'N/A';
  const paymentMethod = order.paymentInfo?.method || 'Online Payment';

  const baseHtml = (heading, intro, accentColor) => `
    <!DOCTYPE html><html><body style="margin:0;padding:0;background:#f1f3f6;font-family:Arial,sans-serif;">
    <div style="max-width:580px;margin:24px auto;border-radius:6px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
      <div style="background:${accentColor};padding:20px 28px;display:flex;align-items:center;justify-content:space-between;">
        <h2 style="color:#fff;margin:0;font-size:20px;font-weight:700;">${heading}</h2>
        <span style="color:#ffffff;font-size:18px;font-weight:800;letter-spacing:0.3px;">Computer9</span>
      </div>
      <div style="background:#fff;padding:28px;">
        ${intro}
        <div style="background:#f8f9ff;border-left:4px solid ${accentColor};padding:10px 14px;border-radius:0 4px 4px 0;margin:16px 0;font-size:13px;color:#444;">
          <strong>Order ID:</strong> ${order._id}<br>
          <strong>Order Time:</strong> ${orderTime}<br>
          <strong>Payment:</strong> ${paymentMethod} &nbsp;|&nbsp; Ref: ${paymentId}
        </div>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <thead><tr style="background:#f1f3f6;">
            <th style="padding:10px 8px;text-align:left;font-size:13px;color:#555;">Item</th>
            <th style="padding:10px 8px;text-align:center;font-size:13px;color:#555;">Qty</th>
            <th style="padding:10px 8px;text-align:right;font-size:13px;color:#555;">Price</th>
          </tr></thead>
          <tbody>${itemRows}</tbody>
        </table>
        <div style="text-align:right;padding:8px 0;border-top:2px solid #e0e0e0;margin-top:4px;">
          <span style="font-size:16px;font-weight:700;color:#212121;">Total: ${rupee}${Number(order.total || 0).toLocaleString('en-IN')}</span>
        </div>
        <hr style="margin:20px 0;border:none;border-top:1px solid #f0f0f0;">
        <div style="font-size:13px;color:#444;line-height:1.8;">
          <strong>Deliver to:</strong><br>
          ${billing.name}<br>
          ${billing.phone}<br>
          ${order.address}
        </div>
      </div>
      <div style="background:#f8f8f8;padding:12px 28px;text-align:center;font-size:11px;color:#aaa;border-top:1px solid #eee;">
        &copy; ${new Date().getFullYear()} Computer9. All rights reserved.
      </div>
    </div>
    </body></html>`;

  // Email to customer
  if (billing.email) {
    await transporter.sendMail({
      from,
      to: billing.email,
      subject: `Order Confirmed! #${order._id} \u2014 ${rupee}${Number(order.total || 0).toLocaleString('en-IN')}`,
      html: baseHtml(
        '&#x1F389; Order Confirmed!',
        `<p style="font-size:15px;color:#212121;margin:0 0 4px;">Hi <strong>${billing.name}</strong>,</p>
         <p style="font-size:14px;color:#555;margin:0;">Your order has been placed successfully. We will notify you once it is shipped.</p>`,
        '#2874f0'
      ),
    }).catch(() => {});
  }

  // Email to admin
  await transporter.sendMail({
    from,
    to: adminEmail,
    subject: `New Order #${order._id} \u2014 ${rupee}${Number(order.total || 0).toLocaleString('en-IN')}`,
    html: baseHtml(
      '&#x1F4E6; New Order Received',
      `<p style="font-size:15px;color:#212121;margin:0 0 4px;"><strong>Customer:</strong> ${billing.name}</p>
       <p style="font-size:14px;color:#555;margin:0;">
         Email: ${billing.email || 'N/A'} &nbsp;|&nbsp; Phone: ${billing.phone}
       </p>`,
      '#388e3c'
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

    // Fill missing product titles/images from DB so emails always show real item names.
    const productIds = products
      .map((p) => p.product)
      .filter(Boolean)
      .map((id) => String(id));

    if (productIds.length > 0) {
      const dbProducts = await Product.find({ _id: { $in: productIds } })
        .select('name title images image')
        .lean();

      const productMap = new Map(dbProducts.map((p) => [String(p._id), p]));
      products = products.map((p) => {
        const dbProduct = productMap.get(String(p.product));
        return {
          ...p,
          title: p.title || dbProduct?.name || dbProduct?.title || 'Product',
          image: p.image || dbProduct?.images?.[0] || dbProduct?.image || '',
        };
      });
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
