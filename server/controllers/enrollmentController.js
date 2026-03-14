import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';

export const requestAccess = async (req, res) => {
  try {
    const { courseId } = req.params;

    const existing = await Enrollment.findOne({ userId: req.user.id, courseId });
    if (existing) {
      return res.status(400).json({ message: "You already have a request for this course", status: existing.status });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const accessType = course.accessType?.trim().toLowerCase();
    const status = accessType === 'free' ? 'approved' : 'pending';

    const newRequest = new Enrollment({ userId: req.user.id, courseId, status });
    await newRequest.save();

    res.status(201).json({ message: status === 'approved' ? "Access granted!" : "Request sent successfully", status });
  } catch (err) {
    res.status(500).json({ error: "Could not send request" });
  }
};

export const getPendingRequests = async (req, res) => {
  try {
    const requests = await Enrollment.find({ status: 'pending' })
      .populate('userId', 'name email')
      .populate('courseId', 'title accessType');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch requests" });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    await Enrollment.findByIdAndUpdate(req.params.requestId, { status });
    res.json({ message: `Request ${status}` });
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
};

export const getEnrollmentStatus = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      userId: req.user.id,
      courseId: req.params.courseId
    });
    res.json({ status: enrollment ? enrollment.status : 'none' });
  } catch (err) {
    res.status(500).send("Server Error");
  }
};