import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      title: { type: String },
      quantity: { type: Number, default: 1 },
      price: { type: Number },
      image: { type: String },
    },
  ],
  total: { type: Number, required: true },
  status: { type: String, default: 'pending' },
  address: { type: String, required: true },
  paymentInfo: { type: Object },
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
