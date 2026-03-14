import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
  title:     { type: String, required: true, trim: true },
  content:   { type: String, required: true },
  type:      { type: String, enum: ['info', 'warning', 'success', 'urgent'], default: 'info' },
  pinned:    { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('Announcement', announcementSchema);