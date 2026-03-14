import Module from "../models/Module.js";
import Lesson from "../models/Lesson.js";

/* =========================
   CREATE MODULE (ADMIN)
========================= */
export const createModule = async (req, res) => {
  try {
    const { title, courseId, order } = req.body;

    const module = await Module.create({
      title,
      course: courseId, // ✅ FIXED (schema uses `course`)
      order,
    });

    res.status(201).json({
      message: "Module created successfully",
      module,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   GET MODULES + LESSONS
========================= */
export const getModulesByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    // 1️⃣ Get modules of this course
    const modules = await Module.find({
      course: courseId, // ✅ FIXED
    }).sort({ order: 1 });

    // 2️⃣ Attach lessons to each module
    const modulesWithLessons = await Promise.all(
      modules.map(async (module) => {
        const lessons = await Lesson.find({
          module: module._id, // ✅ FIXED
        }).sort({ createdAt: 1 });

        return {
          ...module.toObject(),
          lessons,
        };
      })
    );

    res.json(modulesWithLessons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
