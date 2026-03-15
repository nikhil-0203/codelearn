import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/api';
import './MyLearning.css';



export default function MyLearning() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ Uses new progress API — returns real DB progress
    API.get('/progress/my-learning')
      .then((res) => {
        setCourses(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching learning data:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="loading-state">
      <div className="loading-spinner" />
      <p>Loading your classroom...</p>
    </div>
  );

  const totalPercent = courses.length > 0
    ? Math.round(courses.reduce((acc, c) => acc + c.percent, 0) / courses.length)
    : 0;

  return (
    <div className="learning-container">
      <header className="learning-header">
        <div className="learning-header-left">
          <h1>My Learning</h1>
          <p>Pick up right where you left off</p>
        </div>
        {courses.length > 0 && (
          <div className="overall-progress-card">
            <div className="opc-circle">
              <svg viewBox="0 0 36 36" className="opc-svg">
                <path className="opc-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="opc-fill" strokeDasharray={`${totalPercent}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <text x="18" y="20.35" className="opc-text">{totalPercent}%</text>
              </svg>
            </div>
            <div>
              <div className="opc-label">Overall Progress</div>
              <div className="opc-sub">{courses.length} course{courses.length !== 1 ? 's' : ''} enrolled</div>
            </div>
          </div>
        )}
      </header>

      {courses.length > 0 ? (
        <div className="learning-grid">
          {courses.map((course) => {
            const isComplete = course.percent === 100;
            return (
              <div key={course._id} className={`learning-card ${isComplete ? 'completed-card' : ''}`}>
                <div className="card-banner" style={{
                  background: course.image
                    ? `url(${BACKEND_URL}${course.image}) center/cover`
                    : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
                }}>
                  <span className={`status-tag ${isComplete ? 'tag-complete' : ''}`}>
                    {isComplete ? '🎉 Completed' : '📖 In Progress'}
                  </span>
                </div>

                <div className="card-body">
                  <div className="card-meta-row">
                    <span className="card-subject">{course.subject}</span>
                    <span className="card-level">{course.level}</span>
                  </div>
                  <h3>{course.title}</h3>

                  {/* ✅ Real progress from DB */}
                  <div className="progress-container">
                    <div className="progress-bar">
                      <div
                        className={`progress-fill ${isComplete ? 'fill-complete' : ''}`}
                        style={{ width: `${course.percent}%` }}
                      />
                    </div>
                    <div className="progress-meta">
                      <span className="progress-text">{course.percent}% completed</span>
                      <span className="progress-lessons">
                        {course.completedLessons}/{course.totalLessons} lessons
                      </span>
                    </div>
                  </div>

                  {course.lastAccessedAt && (
                    <p className="last-accessed">
                      Last accessed: {new Date(course.lastAccessedAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                    </p>
                  )}

                  <Link
                    to={`/course-player/${course._id}`}
                    className={`continue-btn ${isComplete ? 'btn-review' : ''}`}
                  >
                    {isComplete ? 'Review Course' : 'Continue Learning →'}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-learning">
          <div className="empty-icon">📚</div>
          <h2>No courses enrolled yet</h2>
          <p>Browse our catalog and start your learning journey!</p>
          <Link to="/" className="explore-link">Browse Courses</Link>
        </div>
      )}
    </div>
  );
}