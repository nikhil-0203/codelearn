import { useState } from "react";
import LessonItem from "./LessonItem";

export default function ModuleAccordion({ module }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="module-card">
      <div
        className="module-header"
        onClick={() => setOpen(!open)}
      >
        <h3>{module.title}</h3>
        <span>{open ? "−" : "+"}</span>
      </div>

      {open && (
        <div className="lesson-list">
          {module.lessons?.length > 0 ? (
            module.lessons.map((lesson) => (
              <LessonItem key={lesson._id} lesson={lesson} />
            ))
          ) : (
            <p className="empty">No lessons yet</p>
          )}
        </div>
      )}
    </div>
  );
}
