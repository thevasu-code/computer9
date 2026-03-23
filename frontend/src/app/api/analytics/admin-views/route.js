import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/auth';
import AdminPanelView from '@/models/AdminPanelView';
import PageViewEvent from '@/models/PageViewEvent';

const isValidAdminPath = (path) => typeof path === 'string' && path.startsWith('/admin') && path.length <= 200;

const getSinceDate = (range) => {
  const now = new Date();
  if (range === 'weekly') return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
};

export const GET = requireAdmin(async (request) => {
  await connectDB();

  try {
    const range = new URL(request.url).searchParams.get('range') === 'weekly' ? 'weekly' : 'monthly';
    const since = getSinceDate(range);

    const [totalViews, uniqueVisitorIds, byPageAgg] = await Promise.all([
      PageViewEvent.countDocuments({ scope: 'admin', viewedAt: { $gte: since } }),
      PageViewEvent.distinct('visitorId', { scope: 'admin', viewedAt: { $gte: since } }),
      PageViewEvent.aggregate([
        { $match: { scope: 'admin', viewedAt: { $gte: since } } },
        {
          $group: {
            _id: '$path',
            views: { $sum: 1 },
            uniqueVisitors: { $addToSet: '$visitorId' },
            lastViewedAt: { $max: '$viewedAt' },
          },
        },
        {
          $project: {
            _id: 0,
            path: '$_id',
            views: 1,
            uniqueAdmins: { $size: '$uniqueVisitors' },
            lastViewedAt: 1,
          },
        },
        { $sort: { views: -1, path: 1 } },
      ]),
    ]);

    return NextResponse.json({
      totalViews,
      uniqueAdminCount: uniqueVisitorIds.length,
      byPage: byPageAgg,
      range,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
});

export const POST = requireAdmin(async (request, _context, user) => {
  await connectDB();

  try {
    const body = await request.json().catch(() => ({}));
    const path = body?.path;

    if (!isValidAdminPath(path)) {
      return NextResponse.json({ error: 'Invalid admin path' }, { status: 400 });
    }

    await AdminPanelView.findOneAndUpdate(
      { path },
      {
        $setOnInsert: { path },
        $inc: { views: 1 },
        $set: { lastViewedAt: new Date() },
        $addToSet: { uniqueViewerIds: user.id },
      },
      { upsert: true, new: true }
    );

    await PageViewEvent.create({
      scope: 'admin',
      path,
      visitorId: String(user.id),
      viewedAt: new Date(),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
});
