import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import { requireAdmin } from "@/lib/auth";

function generateSlug(name) {
  if (!name) return "";
  return name
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}

// POST /api/admin/fix-slugs — generate slugs for all products missing them
export const POST = requireAdmin(async () => {
  await connectDB();

  const products = await Product.find({
    $or: [{ slug: { $exists: false } }, { slug: "" }, { slug: null }],
  });

  let fixed = 0;
  for (const product of products) {
    let slug = generateSlug(product.name);
    if (!slug) slug = `product-${product._id}`;

    // Ensure uniqueness
    const existing = await Product.findOne({ slug, _id: { $ne: product._id } });
    if (existing) slug = `${slug}-${product._id.toString().slice(-6)}`;

    product.slug = slug;
    await product.save();
    fixed++;
  }

  return NextResponse.json({ message: `Fixed ${fixed} products`, fixed });
});
