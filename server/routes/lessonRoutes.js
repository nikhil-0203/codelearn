import express from "express";
import {
  createLesson, getLessonsByModule, toggleLessonProgress,
  updateLesson, deleteLesson,
} from "../controllers/lessonController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { uploadPdf } from "../config/cloudinary.js";

const router = express.Router();

router.post("/",               protect, adminOnly, uploadPdf.single("notesPdf"), createLesson);
router.get("/module/:moduleId", protect, getLessonsByModule);
router.patch("/progress",       protect, toggleLessonProgress);
router.put("/:id",             protect, adminOnly, uploadPdf.single("notesPdf"), updateLesson);
router.delete("/:id",          protect, adminOnly, deleteLesson);

export default router;