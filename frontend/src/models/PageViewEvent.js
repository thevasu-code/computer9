import mongoose from 'mongoose';

const PageViewEventSchema = new mongoose.Schema(
  {
    scope: { type: String, enum: ['admin', 'user'], required: true, index: true },
    path: { type: String, required: true, index: true },
    visitorId: { type: String, required: true, index: true },
    viewedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

PageViewEventSchema.index({ scope: 1, viewedAt: -1 });
PageViewEventSchema.index({ scope: 1, path: 1, viewedAt: -1 });

export default mongoose.models.PageViewEvent || mongoose.model('PageViewEvent', PageViewEventSchema);
