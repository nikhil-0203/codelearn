import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      required: true,
    },
    videoUrl: {
      type: String,
    },
    content: {
      type: String,
    },
    // ✅ Added field for Lesson-specific PDF notes
    notesPdf: {
      type: String,
      default: "",
    },
    order: {
      type: Number,
      default: 1, // Determines if this is Lesson 1, 2, or 3
    },
  },
  { timestamps: true }
);

export default mongoose.model("Lesson", lessonSchema);