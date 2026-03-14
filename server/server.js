import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes         from "./routes/authRoutes.js";
import courseRoutes       from "./routes/courseRoutes.js";
import moduleRoutes       from "./routes/moduleRoutes.js";
import adminRoutes        from "./routes/adminRoutes.js";
import lessonRoutes       from "./routes/lessonRoutes.js";
import enrollmentRoutes   from "./routes/enrollmentRoutes.js";
import paymentRoutes      from "./routes/paymentRoutes.js";
import progressRoutes     from "./routes/progressRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import commentRoutes      from "./routes/commentRoutes.js";

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ── CORS ──────────────────────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:3000",
  process.env.CLIENT_URL, // set this on Render to your Vercel URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

app.use(express.json());

// Static uploads (fallback for local dev only)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── ROUTES ───────────────────────────────────────────────────────
app.get("/", (req, res) => res.send("CodeLearn Pro API is running 🚀"));

app.use("/api/auth",          authRoutes);
app.use("/api/courses",       courseRoutes);
app.use("/api/modules",       moduleRoutes);
app.use("/api/lessons",       lessonRoutes);
app.use("/api/admin",         adminRoutes);
app.use("/api/enrollment",    enrollmentRoutes);
app.use("/api/payment",       paymentRoutes);
app.use("/api/progress",      progressRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/comments",      commentRoutes);

// ── DATABASE + SERVER ─────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error("MongoDB connection failed:", err));