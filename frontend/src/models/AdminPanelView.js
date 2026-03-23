import mongoose from 'mongoose';

const AdminPanelViewSchema = new mongoose.Schema(
  {
    path: { type: String, required: true, unique: true, index: true },
    views: { type: Number, default: 0 },
    uniqueViewerIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    lastViewedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.AdminPanelView || mongoose.model('AdminPanelView', AdminPanelViewSchema);
