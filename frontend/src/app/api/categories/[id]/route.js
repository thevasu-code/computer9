import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Category from '@/models/Category';
import { requireAdmin } from '@/lib/auth';

export async function GET(request, { params }) {
  await connectDB();
  const { id } = await params;
  const category = await Category.findById(id).populate('parent', 'name slug');
  if (!category) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(category);
}

export const PUT = requireAdmin(async (request, { params }) => {
  await connectDB();
  const { id } = await params;
  try {
    const body = await request.json();
    if (body.slug) {
      const existing = await Category.findOne({ slug: body.slug, _id: { $ne: id } });
      if (existing) {
        return NextResponse.json({ error: 'Category with this slug already exists' }, { status: 400 });
      }
    }
    if (body.parent === id) {
      return NextResponse.json({ error: 'Category cannot be its own parent' }, { status: 400 });
    }
    const category = await Category.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!category) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(category);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
});

export const DELETE = requireAdmin(async (request, { params }) => {
  await connectDB();
  const { id } = await params;
  const children = await Category.countDocuments({ parent: id });
  if (children > 0) {
    return NextResponse.json({ error: 'Cannot delete category with subcategories. Remove or reassign them first.' }, { status: 400 });
  }
  const category = await Category.findByIdAndDelete(id);
  if (!category) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true });
});
