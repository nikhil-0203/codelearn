import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import API from '../api/api';
import PaymentButton from '../components/PaymentButton';
import './CourseDetails.css';

export default function CourseDetails() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [activeVideo, setActiveVideo] = useState('');
  const [activeLesson, setActiveLesson] = useState(null);
  const [isLocked, setIsLocked] = useState(true);
  const [enrollStatus, setEnrollStatus] = useState('none');
  const [requesting, setRequesting] = useState(false);

  

  const getAccessType = (type) => {
    if (!type) return 'free';
    const t = type.trim().toLowerCase();
    if (t === 'free') return 'free';
    if (t.startsWith('paid') || t === 'pais') return 'paid';
    if (t.startsWith('approv')) return 'approval';
    return 'free';
  };

  const getEmbedUrl = (url) => {
    if (!url) return '';
    try {
      if (url.includes('youtube.com/embed/')) return url;
      let videoId = '';
      const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
      if (shortMatch) videoId = shortMatch[1];
      const watchMatch = url.match(/[?&]v=([^?&]+)/);
      if (watchMatch) videoId = watchMatch[1];
      const shortsMatch = url.match(/\/shorts\/([^?&]+)/);
      if (shortsMatch) videoId = shortsMatch[1];
      if (videoId) return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
    } catch (e) {}
    return url;
  };

  // ✅ wrapped in useCallback to fix exhaustive-deps warning
  const fetchCourseData = useCallback(async () => {
    try {
      const courseRes = await API.get(`/courses/${courseId}`);
      const courseData = courseRes.data;
      setCourse(courseData);

      // ✅ Fetch modules (which include nested lessons) — same as CoursePlayer
      const modulesRes = await API.get(`/modules/${courseId}`);
      const modules = modulesRes.data || [];
      // Flatten all lessons from all modules into one list
      const allLessons = modules.flatMap(mod => mod.lessons || []);
      setLessons(allLessons);

      const accessType = getAccessType(courseData.accessType);
      if (accessType === 'free') {
        setIsLocked(false);
        setEnrollStatus('approved');
      } else {
        const statusRes = await API.get(`/enrollment/status/${courseId}`);
        const s = statusRes.data.status;
        setEnrollStatus(s);
        if (s === 'approved') setIsLocked(false);
      }
    } catch (err) {
      console.error('Error fetching course data:', err);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]); // ✅ now safe — no warning

  const handleRequestAccess = async () => {
    setRequesting(true);
    try {
      const res = await API.post(`/enrollment/request/${courseId}`);
      setEnrollStatus(res.data.status || 'pending');
      if (res.data.status === 'approved') setIsLocked(false);
    } catch (err) {
      const msg = err.response?.data?.message || '';
      if (msg.includes('already')) {
        const statusRes = await API.get(`/enrollment/status/${courseId}`);
        setEnrollStatus(statusRes.data.status);
      }
    } finally {
      setRequesting(false);
    }
  };

  const handleLessonClick = (lesson) => {
    if (isLocked) return;
    setActiveLesson(lesson._id);
    setActiveVideo(getEmbedUrl(lesson.videoUrl));
  };

  const handlePaymentSuccess = () => {
    fetchCourseData();
  };

  const statusBadge = () => {
    const accessType = getAccessType(course?.accessType);
    if (accessType === 'free') return null;
    const map = {
      pending:  { label: '⏳ Approval Pending', cls: 'badge-pending' },
      approved: { label: '✅ Access Approved',  cls: 'badge-approved' },
      rejected: { label: '❌ Request Rejected', cls: 'badge-rejected' },
    };
    const s = map[enrollStatus];
    if (!s) return null;
    return <span className={`enroll-badge ${s.cls}`}>{s.label}</span>;
  };

  if (!course) return <div className="loading">Connecting to CodeLearn...</div>;

  const accessType = getAccessType(course.accessType);

  return (
    <div className="course-details-container">
      <div className="course-header-bar">
        <div>
          <h1 className="course-title-main">{course.title}</h1>
          <p className="course-desc-main">{course.description}</p>
          <div className="course-meta-tags">
            <span className="meta-tag">{course.level}</span>
            <span className="meta-tag">{course.subject}</span>
            <span className="meta-tag">{course.category}</span>
            <span className={`access-tag access-${accessType}`}>
              {accessType === 'free'
                ? '🆓 Free'
                : accessType === 'paid'
                ? `💰 ₹${course.price}`
                : '🔐 Approval Required'}
            </span>
          </div>
        </div>
        <div className="header-right">{statusBadge()}</div>
      </div>

      <div className="content-layout">
        {/* Video player */}
        <div className="video-player-section">
          <div className="player-wrapper">
            {isLocked ? (
              <div className="locked-overlay">
                <div className="lock-icon">🔒</div>
                <h3>Content Locked</h3>
                <p>
                  {accessType === 'paid'
                    ? `Enroll for ₹${course.price} to get full access`
                    : 'This course requires admin approval to access'}
                </p>

                {/* PAID: Razorpay button */}
                {accessType === 'paid' && enrollStatus === 'none' && (
                  <div className="unlock-actions">
                    <PaymentButton course={course} onSuccess={handlePaymentSuccess} />
                  </div>
                )}

                {/* APPROVAL: request button */}
                {accessType === 'approval' && enrollStatus === 'none' && (
                  <button
                    onClick={handleRequestAccess}
                    className="unlock-btn"
                    disabled={requesting}
                  >
                    {requesting ? 'Sending...' : '📩 Request Access'}
                  </button>
                )}

                {enrollStatus === 'pending' && (
                  <div className="status-info pending">
                    ⏳ Your request is pending admin approval.
                  </div>
                )}
                {enrollStatus === 'rejected' && (
                  <div className="status-info rejected">
                    ❌ Your request was rejected. Please contact admin.
                  </div>
                )}
              </div>
            ) : activeVideo ? (
              <iframe src={activeVideo} title="Video" allowFullScreen />
            ) : (
              <div className="welcome-box">
                <div className="welcome-icon">🎓</div>
                <h3>Welcome to {course.title}</h3>
                <p>Select a lecture from the list to start learning.</p>
              </div>
            )}
          </div>
        </div>

        {/* Curriculum */}
        <div className="curriculum-list">
          <h3>
            Course Content{' '}
            <span className="lesson-count">{lessons.length} lectures</span>
          </h3>
          {lessons.length === 0 ? (
            <p className="no-lessons">No lectures added yet.</p>
          ) : (
            lessons.map((lesson, index) => (
              <div
                key={lesson._id}
                className={`lesson-card ${isLocked ? 'lesson-locked' : ''} ${
                  activeLesson === lesson._id ? 'active' : ''
                }`}
                onClick={() => handleLessonClick(lesson)}
              >
                <div className="lesson-num">{index + 1}</div>
                <div className="lesson-meta">
                  <h4 className={isLocked ? 'blurred-text' : ''}>{lesson.title}</h4>
                  {isLocked ? (
                    <span className="lock-small">🔒 Locked</span>
                  ) : (
                    lesson.notesPdf && (
                      <a
                        href={`${BACKEND_URL}${lesson.notesPdf}`}
                        target="_blank"
                        rel="noreferrer"
                        className="notes-link"
                        onClick={(e) => e.stopPropagation()}
                      >
                        📄 View PDF Notes
                      </a>
                    )
                  )}
                </div>
                {isLocked && <span className="lesson-lock-icon">🔒</span>}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}