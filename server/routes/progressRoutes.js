import express from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import {
  markLesson,
  recordLessonOpen,
  getCourseProgress,
  getMyLearning,
  getCourseProgressAdmin,
  getAllProgressAdmin,
} from '../controllers/progressController.js';

const router = express.Router();

// Student
router.post('/mark/:courseId/:lessonId',   protect, markLesson);
router.post('/open/:courseId/:lessonId',   protect, recordLessonOpen); // ✅ auto-track on open
router.get('/course/:courseId',            protect, getCourseProgress);
router.get('/my-learning',                 protect, getMyLearning);

// Admin
router.get('/admin/all',                   protect, adminOnly, getAllProgressAdmin);
router.get('/admin/course/:courseId',      protect, adminOnly, getCourseProgressAdmin);

export default router;