import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  completedLessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
  totalLessons: { type: Number, default: 0 },
  percent: { type: Number, default: 0 },
  lastAccessedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// One progress doc per user per course
progressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export default mongoose.model('Progress', progressSchema);