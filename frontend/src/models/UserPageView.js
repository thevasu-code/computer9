import mongoose from 'mongoose';

const UserPageViewSchema = new mongoose.Schema(
  {
    path: { type: String, required: true, unique: true, index: true },
    views: { type: Number, default: 0 },
    uniqueVisitorIds: [{ type: String }],
    lastViewedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.UserPageView || mongoose.model('UserPageView', UserPageViewSchema);
