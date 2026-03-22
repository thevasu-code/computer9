import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";
import User from "@/models/User";
import Product from "@/models/Product";
import Order from "@/models/Order";
import Cart from "@/models/Cart";
import Review from "@/models/Review";

function normalizeDocForBackup(doc) {
  if (!doc || typeof doc !== "object") return doc;
  const normalized = { ...doc };
  delete normalized.__v;
  return normalized;
}

export const GET = requireAdmin(async () => {
  await connectDB();

  try {
    const [users, products, orders, carts, reviews] = await Promise.all([
      User.find().lean(),
      Product.find().lean(),
      Order.find().lean(),
      Cart.find().lean(),
      Review.find().lean(),
    ]);

    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      note: "Includes product image URLs and all MongoDB ecommerce content.",
      collections: {
        users: users.map(normalizeDocForBackup),
        products: products.map(normalizeDocForBackup),
        orders: orders.map(normalizeDocForBackup),
        carts: carts.map(normalizeDocForBackup),
        reviews: reviews.map(normalizeDocForBackup),
      },
    };

    return new NextResponse(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename=computer9-backup-${Date.now()}.json`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Backup failed" }, { status: 500 });
  }
});

function toObjectId(value) {
  if (!value) return value;
  if (value instanceof mongoose.Types.ObjectId) return value;
  if (typeof value === "string" && mongoose.Types.ObjectId.isValid(value)) {
    return new mongoose.Types.ObjectId(value);
  }
  return value;
}

function prepDoc(doc) {
  if (!doc || typeof doc !== "object") return doc;
  const cleaned = { ...doc };
  delete cleaned.__v;

  if (cleaned._id) cleaned._id = toObjectId(cleaned._id);
  if (cleaned.user) cleaned.user = toObjectId(cleaned.user);

  return cleaned;
}

async function replaceCollection(Model, docs = []) {
  await Model.deleteMany({});
  if (!Array.isArray(docs) || docs.length === 0) return 0;
  const prepared = docs.map(prepDoc);
  await Model.insertMany(prepared, { ordered: false });
  return prepared.length;
}

export const POST = requireAdmin(async (request) => {
  await connectDB();

  try {
    const body = await request.json();
    const collections = body?.collections;

    if (!collections || typeof collections !== "object") {
      return NextResponse.json({ error: "Invalid backup format." }, { status: 400 });
    }

    const users = Array.isArray(collections.users) ? collections.users : [];
    const products = Array.isArray(collections.products) ? collections.products : [];
    const orders = Array.isArray(collections.orders) ? collections.orders : [];
    const carts = Array.isArray(collections.carts) ? collections.carts : [];
    const reviews = Array.isArray(collections.reviews) ? collections.reviews : [];

    const usersCount = await replaceCollection(User, users);
    const productsCount = await replaceCollection(Product, products);
    const ordersCount = await replaceCollection(Order, orders);
    const cartsCount = await replaceCollection(Cart, carts);
    const reviewsCount = await replaceCollection(Review, reviews);

    return NextResponse.json({
      message: "Backup restored successfully.",
      restored: {
        users: usersCount,
        products: productsCount,
        orders: ordersCount,
        carts: cartsCount,
        reviews: reviewsCount,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Restore failed" }, { status: 500 });
  }
});
