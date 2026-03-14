import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    subject: { type: String, required: true },
    category: {
      type: String,
      enum: ["Coding", "Academic", "General"],
      default: "Academic",
    },
    image: { type: String, default: "" },
    // ✅ Keep field for PDF notes
    notesPdf: { type: String, default: "" }, 
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    
    // 🔒 NEW: Access Control Fields
    accessType: { 
      type: String, 
      enum: ['free', 'approval', 'paid'], 
      default: 'free' 
    },
    price: { 
      type: Number, 
      default: 0 
    },

    // ✅ Keep relationship with Lesson model
    lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lesson" }] 
  },
  { timestamps: true }
);

export default mongoose.model("Course", courseSchema);