import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/api';
import './CourseDetailsStudent.css';

export default function CourseDetailsStudent() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    API.get(`/courses/${id}`)
      .then((res) => setCourse(res.data))
      .catch(console.error);
  }, [id]);

  if (!course) return <div className="loading-state">Loading Course...</div>;

  return (
    <div className="student-detail-container">
      {/* Hero Header */}
      <div className="course-hero">
        <div className="hero-content">
          <span className="badge-light">{course.level || 'Beginner'}</span>
          <h1>{course.title}</h1>
          <p>{course.description}</p>
          <button 
            className="start-learning-btn" 
            onClick={() => navigate(`/player/${course._id}`)}
          >
            Start Learning Now
          </button>
        </div>
      </div>

      {/* Curriculum Section */}
      <div className="curriculum-section">
        <div className="section-title">
          <h2>Course Content</h2>
          <span>{course.modules?.length} Modules • {course.totalLessons || '0'} Lessons</span>
        </div>

        <div className="module-accordion">
          {course.modules?.map((mod, index) => (
            <div key={mod._id} className="accordion-item">
              <div className="accordion-header">
                <span className="mod-number">{index + 1}</span>
                <h4>{mod.title}</h4>
              </div>
              <div className="accordion-body">
                {mod.lessons?.map((lesson) => (
                  <div key={lesson._id} className="lesson-preview">
                    <span className="icon">{lesson.videoType === 'note' ? '📄' : '▶️'}</span>
                    <span className="lesson-name">{lesson.title}</span>
                    <span className="preview-tag">Preview</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}