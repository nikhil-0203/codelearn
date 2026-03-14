import User from "../models/User.js";
import Course from "../models/Course.js";
import Module from "../models/Module.js";
import Lesson from "../models/Lesson.js";

export const getAdminStats = async (req, res) => {
  try {
    const users = await User.countDocuments();
    const courses = await Course.countDocuments();
    const modules = await Module.countDocuments();
    const lessons = await Lesson.countDocuments();

    res.json({
      users,
      courses,
      modules,
      lessons,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
