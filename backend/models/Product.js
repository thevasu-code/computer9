const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  images: [{ type: String }], // Array of image URLs
  category: { type: String },
  brand: { type: String },
  stock: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  reviews: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    comment: String,
    rating: Number,
    createdAt: { type: Date, default: Date.now }
  }],
  tags: [{ type: String }],
  richDescription: { type: String },
  discount: { type: Number, default: 0 },
  specs: [{ key: String, value: String }],
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
