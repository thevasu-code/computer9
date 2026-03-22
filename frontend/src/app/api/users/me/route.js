import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import Cart from '@/models/Cart';
import Order from '@/models/Order';
import { verifyToken } from '@/lib/auth';

export async function GET(request) {
  const decoded = verifyToken(request);
  if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  try {
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const userObj = user.toObject();

    // Support both current and legacy field names that may already exist in DB.
    let phone = userObj.phone || userObj.phoneNumber || userObj.mobile || '';
    let address = userObj.billingAddress?.address || userObj.address || '';
    let pincode = userObj.billingAddress?.pincode || userObj.pin || userObj.pincode || '';

    if (!phone || !address || !pincode) {
      const lastOrder = await Order.findOne({ user: decoded.id })
        .sort({ createdAt: -1 })
        .select('paymentInfo address');

      if (lastOrder) {
        if (!phone) {
          phone =
            lastOrder.paymentInfo?.phone ||
            lastOrder.paymentInfo?.contact ||
            '';
        }

        if (!address || !pincode) {
          const orderAddress = (lastOrder.address || '').trim();
          if (orderAddress) {
            const parts = orderAddress.split(',').map((p) => p.trim()).filter(Boolean);
            const maybePin = parts.length ? parts[parts.length - 1] : '';
            const isPin = /^\d{4,8}$/.test(maybePin);

            if (!pincode && isPin) pincode = maybePin;
            if (!address) {
              address = isPin ? parts.slice(0, -1).join(', ') : orderAddress;
            }
          }
        }
      }
    }

    userObj.phone = phone || '';
    userObj.billingAddress = {
      address: address || '',
      pincode: pincode || '',
    };

    return NextResponse.json(userObj);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function PUT(request) {
  const decoded = verifyToken(request);
  if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();

  try {
    const body = await request.json();
    const update = {
      phone: typeof body.phone === 'string' ? body.phone.trim() : '',
      billingAddress: {
        address: typeof body.billingAddress?.address === 'string' ? body.billingAddress.address.trim() : '',
        pincode: typeof body.billingAddress?.pincode === 'string' ? body.billingAddress.pincode.trim() : '',
      },
    };

    const user = await User.findByIdAndUpdate(decoded.id, update, { new: true }).select('-password');
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json(user);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(request) {
  const decoded = verifyToken(request);
  if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();

  try {
    await Cart.deleteMany({ user: decoded.id });
    await Order.updateMany({ user: decoded.id }, { $set: { user: null } });
    const deleted = await User.findByIdAndDelete(decoded.id);
    if (!deleted) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json({ message: 'Account deleted successfully' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
