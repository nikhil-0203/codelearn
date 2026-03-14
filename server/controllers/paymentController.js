import crypto from 'crypto';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';

const isPaidCourse = (type) => {
  if (!type) return false;
  const t = type.trim().toLowerCase();
  return t === 'paid' || t === 'pais'; // ✅ handles DB typo
};

const getRazorpay = async () => {
  const Razorpay = (await import('razorpay')).default;
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

export const createOrder = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (!isPaidCourse(course.accessType)) {
      return res.status(400).json({ message: 'This course does not require payment' });
    }

    // ✅ Razorpay minimum is ₹1 = 100 paise
    const priceInPaise = Math.max((course.price || 1) * 100, 100);

    const razorpay = await getRazorpay();
    const order = await razorpay.orders.create({
      amount: priceInPaise,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`.substring(0, 40),
      notes: {
        courseId: course._id.toString(),
        userId: req.user.id,
      },
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error('createOrder error:', err);
    res.status(500).json({ error: 'Could not create order', detail: err.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const courseId = req.params.courseId;

    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = hmac.digest('hex');

    if (digest !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    const existing = await Enrollment.findOne({ userId: req.user.id, courseId });
    if (existing) {
      await Enrollment.findByIdAndUpdate(existing._id, { status: 'approved' });
    } else {
      await Enrollment.create({ userId: req.user.id, courseId, status: 'approved' });
    }

    res.json({ message: 'Payment verified. Access granted!' });
  } catch (err) {
    console.error('verifyPayment error:', err);
    res.status(500).json({ error: 'Verification failed', detail: err.message });
  }
};