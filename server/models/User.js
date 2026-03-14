import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ["student", "admin"], default: "student" },

    // ✅ Extended student profile fields
    rollNo:     { type: String, default: "" },
    phone:      { type: String, default: "" },
    college:    { type: String, default: "" },
    department: { type: String, default: "" },
    year:       { type: String, default: "" },
    division:   { type: String, default: "" },
    bio:        { type: String, default: "" },
    linkedin:   { type: String, default: "" },
    github:     { type: String, default: "" },
    avatar:     { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);