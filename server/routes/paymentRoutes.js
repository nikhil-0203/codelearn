import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { createOrder, verifyPayment } from '../controllers/paymentController.js';

const router = express.Router();

router.post('/create-order/:courseId', protect, createOrder);
router.post('/verify/:courseId', protect, verifyPayment);

export default router;
