import Progress from '../models/Progress.js';
import Lesson from '../models/Lesson.js';
import Module from '../models/Module.js';
import Enrollment from '../models/Enrollment.js';

// ── Helper: count all lessons in a course ────────────────────────
const countCourseLessons = async (courseId) => {
  // Find all modules for this course, then count their lessons
  const modules = await Module.find({ course: courseId });
  const moduleIds = modules.map(m => m._id);
  const total = await Lesson.countDocuments({ module: { $in: moduleIds } });
  return total;
};

// ── Mark a lesson complete or incomplete ─────────────────────────
export const markLesson = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const { completed } = req.body;
    const userId = req.user.id;

    const totalLessons = await countCourseLessons(courseId);

    let progress = await Progress.findOne({ userId, courseId });
    if (!progress) {
      progress = new Progress({ userId, courseId, totalLessons, completedLessons: [] });
    }

    const alreadyDone = progress.completedLessons
      .map(id => id.toString()).includes(lessonId);

    if (completed && !alreadyDone) {
      progress.completedLessons.push(lessonId);
    } else if (!completed && alreadyDone) {
      progress.completedLessons = progress.completedLessons
        .filter(id => id.toString() !== lessonId);
    }

    progress.totalLessons    = totalLessons;
    progress.percent         = totalLessons > 0
      ? Math.round((progress.completedLessons.length / totalLessons) * 100)
      : 0;
    progress.lastAccessedAt  = new Date();

    await progress.save();
    res.json({
      percent: progress.percent,
      completedLessons: progress.completedLessons,
      totalLessons: progress.totalLessons,
    });
  } catch (err) {
    console.error('markLesson error:', err);
    res.status(500).json({ error: 'Could not update progress' });
  }
};

// ── Record that a lesson was opened (updates lastAccessedAt) ─────
export const recordLessonOpen = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const userId = req.user.id;

    const totalLessons = await countCourseLessons(courseId);

    let progress = await Progress.findOne({ userId, courseId });
    if (!progress) {
      progress = new Progress({ userId, courseId, totalLessons, completedLessons: [] });
    }

    progress.totalLessons   = totalLessons;
    progress.lastAccessedAt = new Date();
    // Update percent in case total changed
    progress.percent = totalLessons > 0
      ? Math.round((progress.completedLessons.length / totalLessons) * 100)
      : 0;

    await progress.save();
    res.json({
      percent: progress.percent,
      completedLessons: progress.completedLessons,
      totalLessons: progress.totalLessons,
    });
  } catch (err) {
    console.error('recordLessonOpen error:', err);
    res.status(500).json({ error: 'Could not record lesson open' });
  }
};

// ── Get progress for one course ───────────────────────────────────
export const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;
    const progress = await Progress.findOne({ userId, courseId });
    if (!progress) {
      const totalLessons = await countCourseLessons(courseId);
      return res.json({ percent: 0, completedLessons: [], totalLessons });
    }
    res.json({
      percent: progress.percent,
      completedLessons: progress.completedLessons,
      totalLessons: progress.totalLessons,
    });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch progress' });
  }
};

// ── My Learning page ──────────────────────────────────────────────
export const getMyLearning = async (req, res) => {
  try {
    const userId = req.user.id;
    const enrollments = await Enrollment.find({ userId, status: 'approved' })
      .populate('courseId');

    const courses = await Promise.all(
      enrollments.map(async (enroll) => {
        const course = enroll.courseId;
        if (!course) return null;
        const progress = await Progress.findOne({ userId, courseId: course._id });
        const totalLessons = await countCourseLessons(course._id);
        return {
          _id:              course._id,
          title:            course.title,
          subject:          course.subject,
          level:            course.level,
          image:            course.image,
          percent:          progress?.percent || 0,
          completedLessons: progress?.completedLessons?.length || 0,
          totalLessons,
          lastAccessedAt:   progress?.lastAccessedAt || enroll.requestedAt,
        };
      })
    );

    res.json(courses.filter(Boolean));
  } catch (err) {
    console.error('getMyLearning error:', err);
    res.status(500).json({ error: 'Could not fetch learning data' });
  }
};

// ── Admin: all students progress ─────────────────────────────────
export const getAllProgressAdmin = async (req, res) => {
  try {
    const progressList = await Progress.find()
      .populate('userId', 'name email')
      .populate('courseId', 'title subject')
      .sort({ updatedAt: -1 });

    res.json(progressList.map(p => ({
      student:          p.userId,
      course:           p.courseId,
      percent:          p.percent,
      completedLessons: p.completedLessons.length,
      totalLessons:     p.totalLessons,
      lastAccessedAt:   p.lastAccessedAt,
    })));
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch progress' });
  }
};

// ── Admin: progress for one course ───────────────────────────────
export const getCourseProgressAdmin = async (req, res) => {
  try {
    const { courseId } = req.params;
    const progressList = await Progress.find({ courseId })
      .populate('userId', 'name email')
      .sort({ percent: -1 });

    res.json(progressList.map(p => ({
      student:          p.userId,
      percent:          p.percent,
      completedLessons: p.completedLessons.length,
      totalLessons:     p.totalLessons,
      lastAccessedAt:   p.lastAccessedAt,
    })));
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch progress' });
  }
};