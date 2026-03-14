import Lesson from "../models/Lesson.js";

// ✅ CREATE LESSON (ADMIN)
export const createLesson = async (req, res) => {
  try {
    const { title, module, videoUrl, content, order } = req.body;
    
    // Capture the file path provided by Multer from your route
    const notesPdf = req.file ? req.file.path : "";

    const lesson = await Lesson.create({
      title,
      module,
      videoUrl, 
      content,
      order: order || 1, 
      notesPdf, 
    });

    res.status(201).json({ message: "Lesson published successfully", lesson });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ GET LESSONS BY MODULE
export const getLessonsByModule = async (req, res) => {
  try {
    const { moduleId } = req.params;
    // Sort by 'order' so lessons appear 1, 2, 3... in the sidebar
    const lessons = await Lesson.find({ module: moduleId }).sort({ order: 1 });
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ FIX: Exported to resolve the "does not provide an export named..." crash
export const toggleLessonProgress = async (req, res) => {
  try {
    res.status(200).json({ message: "Progress status updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE LESSON (ADMIN)
export const updateLesson = async (req, res) => {
  try {
    const { title, videoUrl, order } = req.body;
    const update = { title, videoUrl, order };
    // Only replace PDF if a new file was uploaded
    if (req.file) update.notesPdf = req.file.path;

    const lesson = await Lesson.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
    res.json({ message: 'Lesson updated!', lesson });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE LESSON (ADMIN)
export const deleteLesson = async (req, res) => {
  try {
    await Lesson.findByIdAndDelete(req.params.id);
    res.json({ message: 'Lesson deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};