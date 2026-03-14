import express from "express";
import {
  createCourse, getAllCourses, getCourseById,
  deleteCourse, getAdminStats, updateCourse,
} from "../controllers/courseController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { uploadImage } from "../config/cloudinary.js";

const router = express.Router();

router.get("/admin/stats", protect, adminOnly, getAdminStats);
router.get("/",            getAllCourses);
router.get("/:id",         getCourseById);
router.post("/",           protect, adminOnly, uploadImage.single("image"), createCourse);
router.put("/:id",         protect, adminOnly, updateCourse);
router.delete("/:id",      protect, adminOnly, deleteCourse);

export default router;