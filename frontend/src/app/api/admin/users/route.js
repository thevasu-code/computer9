import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import Order from '@/models/Order';
import { requireAdmin } from '@/lib/auth';

export const GET = requireAdmin(async () => {
  await connectDB();
  try {
    const users = await User.find().select('-password');
    const userIds = users.map((u) => u._id);

    const phonesByUser = await Order.aggregate([
      {
        $match: {
          user: { $in: userIds },
          'paymentInfo.phone': { $exists: true, $nin: [null, ''] },
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$user',
          phone: { $first: '$paymentInfo.phone' },
        },
      },
    ]);

    const phoneMap = new Map(phonesByUser.map((row) => [String(row._id), row.phone]));
    const mergedUsers = users.map((userDoc) => {
      const user = userDoc.toObject();
      if (!user.phone) {
        user.phone = phoneMap.get(String(user._id)) || '';
      }
      return user;
    });

    return NextResponse.json(mergedUsers);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
});
