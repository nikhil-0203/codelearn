import Course from "../models/Course.js";
import User from "../models/User.js";

// ── Admin stats ───────────────────────────────────────────────────
export const getAdminStats = async (req, res) => {
  try {
    const userCount   = await User.countDocuments();
    const courseCount = await Course.countDocuments();
    res.json({ users: userCount, courses: courseCount, lessons: courseCount * 5 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Create course ─────────────────────────────────────────────────
export const createCourse = async (req, res) => {
  try {
    const { title, description, level, subject, category, accessType, price } = req.body;
    const imagePath = req.file ? req.file.path : "";

    const course = await Course.create({
      title, description, level, subject, category,
      image: imagePath,
      accessType: accessType || "free",
      price: accessType === "paid" ? (Number(price) || 0) : 0,
      createdBy: req.user._id,
    });
    res.status(201).json({ message: "Published!", course });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Get all courses ───────────────────────────────────────────────
export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate("createdBy", "name").sort({ createdAt: -1 });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Get single course by ID ───────────────────────────────────────
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Update course accessType/price ───────────────────────────────
export const updateCourse = async (req, res) => {
  try {
    const { accessType, price } = req.body;
    const updated = await Course.findByIdAndUpdate(
      req.params.id,
      {
        accessType: accessType || "free",
        price: accessType === "paid" ? (Number(price) || 0) : 0,
      },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Course not found" });
    res.json({ message: "Updated!", course: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Delete course ─────────────────────────────────────────────────
export const deleteCourse = async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};