import express from "express";
import { createModule, getModulesByCourse } from "../controllers/moduleController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, adminOnly, createModule);
router.get("/:courseId", protect, getModulesByCourse); // ✅ added protect

export default router;