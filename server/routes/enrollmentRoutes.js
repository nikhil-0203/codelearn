import express from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { requestAccess, getPendingRequests, updateStatus, getEnrollmentStatus } from '../controllers/enrollmentController.js';

const router = express.Router();

router.post('/request/:courseId', protect, requestAccess);
router.get('/pending', protect, adminOnly, getPendingRequests);
router.put('/:requestId', protect, adminOnly, updateStatus);
router.get('/status/:courseId', protect, getEnrollmentStatus);

export default router;