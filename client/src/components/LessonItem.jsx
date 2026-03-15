export default function LessonItem({ lesson }) {
  return (
    <div className="lesson-item">
      <span className="lesson-dot">▶</span>
      <span className="lesson-title">{lesson.title}</span>
    </div>
  );
}
