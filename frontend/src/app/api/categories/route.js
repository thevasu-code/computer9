import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Category from '@/models/Category';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  await connectDB();
  const categories = await Category.find().sort({ order: 1, name: 1 }).populate('parent', 'name slug');
  return NextResponse.json(categories);
}

export const POST = requireAdmin(async (request) => {
  await connectDB();
  try {
    const body = await request.json();
    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }
    if (!body.slug || !body.slug.trim()) {
      body.slug = body.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }
    const existing = await Category.findOne({ slug: body.slug });
    if (existing) {
      return NextResponse.json({ error: 'Category with this slug already exists' }, { status: 400 });
    }
    const category = await Category.create(body);
    return NextResponse.json(category, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
});
