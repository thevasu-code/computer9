import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/auth';
import UserPageView from '@/models/UserPageView';
import PageViewEvent from '@/models/PageViewEvent';

const isValidUserPath = (path) => {
  if (typeof path !== 'string') return false;
  if (!path.startsWith('/')) return false;
  if (path.startsWith('/admin')) return false;
  if (path.startsWith('/api')) return false;
  return path.length <= 200;
};

const isValidVisitorId = (visitorId) => typeof visitorId === 'string' && visitorId.length > 5 && visitorId.length <= 100;

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
      PageViewEvent.countDocuments({ scope: 'user', viewedAt: { $gte: since } }),
      PageViewEvent.distinct('visitorId', { scope: 'user', viewedAt: { $gte: since } }),
      PageViewEvent.aggregate([
        { $match: { scope: 'user', viewedAt: { $gte: since } } },
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
            uniqueVisitors: { $size: '$uniqueVisitors' },
            lastViewedAt: 1,
          },
        },
        { $sort: { views: -1, path: 1 } },
      ]),
    ]);

    return NextResponse.json({
      totalViews,
      uniqueVisitorCount: uniqueVisitorIds.length,
      byPage: byPageAgg,
      range,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
});

export async function POST(request) {
  await connectDB();

  try {
    const body = await request.json().catch(() => ({}));
    const path = body?.path;
    const visitorId = body?.visitorId;

    if (!isValidUserPath(path) || !isValidVisitorId(visitorId)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    await UserPageView.findOneAndUpdate(
      { path },
      {
        $setOnInsert: { path },
        $inc: { views: 1 },
        $set: { lastViewedAt: new Date() },
        $addToSet: { uniqueVisitorIds: visitorId },
      },
      { upsert: true, new: true }
    );

    await PageViewEvent.create({
      scope: 'user',
      path,
      visitorId,
      viewedAt: new Date(),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
