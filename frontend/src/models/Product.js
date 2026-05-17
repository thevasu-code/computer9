import mongoose from 'mongoose';

function generateSlug(name) {
  if (!name) return '';
  return name
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 100);
}

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, index: true },
  description: { type: String },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  images: [{ type: String }],
  category: { type: String },
  brand: { type: String },
  stock: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  reviews: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    comment: String,
    rating: Number,
    createdAt: { type: Date, default: Date.now },
  }],
  tags: [{ type: String }],
  richDescription: { type: String },
  seo: {
    metaTitle: { type: String, trim: true, maxlength: 70 },
    metaDescription: { type: String, trim: true, maxlength: 160 },
    keywords: [{ type: String, trim: true }],
    ogImage: { type: String, trim: true },
    canonicalUrl: { type: String, trim: true },
    noIndex: { type: Boolean, default: false },
  },
  discount: { type: Number, default: 0 },
  specs: [{ key: String, value: String }],
}, { timestamps: true });

// Auto-generate slug before saving
ProductSchema.pre('save', function (next) {
  if (this.isModified('name') || !this.slug) {
    let slug = generateSlug(this.name);
    // Append short unique suffix if slug is empty or too generic
    if (!slug) slug = `product-${this._id}`;
    this.slug = slug;
  }
  next();
});

ProductSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  if (update.name && !update.slug) {
    update.slug = generateSlug(update.name);
  }
  next();
});

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
export { generateSlug };