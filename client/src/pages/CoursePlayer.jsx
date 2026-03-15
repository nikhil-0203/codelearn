import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api/api';
import './CoursePlayer.css';

const getYouTubeVideoId = (url) => {
  if (!url) return '';
  const patterns = [
    /youtu\.be\/([^?&\s]+)/,
    /[?&]v=([^?&\s]+)/,
    /\/shorts\/([^?&\s]+)/,
    /\/embed\/([^?&\s]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1].trim();
  }
  return '';
};

const buildEmbedUrl = (videoId) =>
  `https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0&modestbranding=1&origin=${window.location.origin}`;

export default function CoursePlayer() {
  const { courseId } = useParams();
  const [course, setCourse]             = useState(null);
  const [modules, setModules]           = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [completedLessons, setCompleted]= useState([]);
  const [totalLessons, setTotalLessons] = useState(0);
  const [percent, setPercent]           = useState(0);
  const [sidebarOpen, setSidebarOpen]   = useState(true);
  const [saving, setSaving]             = useState(false);
  const [loadError, setLoadError]       = useState('');
  const [embedUrl, setEmbedUrl]         = useState('');
  const [showNote, setShowNote]         = useState(false);

  const iframeRef       = useRef(null);
  const progressTimer   = useRef(null);
  const hasAutoMarked   = useRef(false);
  const activeLessonRef = useRef(null);
  const completedRef    = useRef([]);

  useEffect(() => { activeLessonRef.current = activeLesson; }, [activeLesson]);
  useEffect(() => { completedRef.current = completedLessons; }, [completedLessons]);

  // ── Load course + modules ────────────────────────────────────────
  useEffect(() => {
    const loadAll = async () => {
      try {
        const [courseRes, modulesRes] = await Promise.all([
          API.get(`/courses/${courseId}`),
          API.get(`/modules/${courseId}`),
        ]);
        setCourse(courseRes.data);
        const mods = modulesRes.data || [];
        setModules(mods);
        const first = mods[0]?.lessons?.[0];
        if (first) setActiveLesson(first);
      } catch (err) {
        console.error(err);
        setLoadError('Failed to load. Please refresh.');
      }
    };
    loadAll();
  }, [courseId]);

  // ── Load saved progress ──────────────────────────────────────────
  useEffect(() => {
    API.get(`/progress/course/${courseId}`)
      .then(res => {
        setCompleted(res.data.completedLessons || []);
        setPercent(res.data.percent || 0);
        setTotalLessons(res.data.totalLessons || 0);
      })
      .catch(() => {});
  }, [courseId]);

  // ── Save progress ────────────────────────────────────────────────
  const saveProgress = useCallback(async (lessonId, forceComplete = false) => {
    if (!lessonId) return;
    const done = completedRef.current.map(id => id.toString()).includes(lessonId.toString());
    if (forceComplete && done) return;
    setSaving(true);
    try {
      const res = await API.post(`/progress/mark/${courseId}/${lessonId}`, {
        completed: forceComplete ? true : !done,
      });
      setCompleted(res.data.completedLessons || []);
      setPercent(res.data.percent || 0);
      setTotalLessons(res.data.totalLessons || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }, [courseId]);

  // ── postMessage listener: track YouTube video progress ──────────
  useEffect(() => {
    const onMessage = (e) => {
      if (!e.origin.includes('youtube.com')) return;
      let data;
      try { data = JSON.parse(e.data); } catch { return; }

      // playerState: 1 = playing, 2 = paused, 0 = ended
      if (data.event === 'onStateChange') {
        const state = data.info;

        if (state === 1) {
          // Playing — start polling
          if (progressTimer.current) clearInterval(progressTimer.current);
          progressTimer.current = setInterval(() => {
            // Ask iframe for current time + duration via postMessage
            iframeRef.current?.contentWindow?.postMessage(
              JSON.stringify({ event: 'listening' }), '*'
            );
            iframeRef.current?.contentWindow?.postMessage(
              JSON.stringify({ event: 'command', func: 'getVideoData' }), '*'
            );
          }, 2000);
        } else {
          // Paused or ended
          if (progressTimer.current) clearInterval(progressTimer.current);
          // If ended (state 0) → mark complete
          if (state === 0 && !hasAutoMarked.current) {
            const lesson = activeLessonRef.current;
            if (lesson) {
              const alreadyDone = completedRef.current
                .map(id => id.toString()).includes(lesson._id.toString());
              if (!alreadyDone) {
                hasAutoMarked.current = true;
                saveProgress(lesson._id, true);
              }
            }
          }
        }
      }

      // getCurrentTime response — check 80% threshold
      if (data.event === 'infoDelivery' && data.info) {
        const current  = data.info.currentTime;
        const duration = data.info.duration;
        if (current && duration && duration > 0) {
          if ((current / duration) >= 0.8 && !hasAutoMarked.current) {
            const lesson = activeLessonRef.current;
            if (lesson) {
              const alreadyDone = completedRef.current
                .map(id => id.toString()).includes(lesson._id.toString());
              if (!alreadyDone) {
                hasAutoMarked.current = true;
                saveProgress(lesson._id, true);
              }
            }
          }
        }
      }
    };

    window.addEventListener('message', onMessage);
    return () => {
      window.removeEventListener('message', onMessage);
      if (progressTimer.current) clearInterval(progressTimer.current);
    };
  }, [saveProgress]);

  // ── When active lesson changes ───────────────────────────────────
  useEffect(() => {
    if (!activeLesson?._id) return;

    hasAutoMarked.current = false;
    if (progressTimer.current) clearInterval(progressTimer.current);

    const isNote = activeLesson.videoType === 'note';
    setShowNote(isNote);

    if (!isNote) {
      const vid = getYouTubeVideoId(activeLesson.videoUrl);
      setEmbedUrl(vid ? buildEmbedUrl(vid) : '');
    } else {
      setEmbedUrl('');
    }

    API.post(`/progress/open/${courseId}/${activeLesson._id}`)
      .then(res => setTotalLessons(res.data.totalLessons || 0))
      .catch(() => {});

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLesson?._id]);

  const isLessonDone = (lessonId) =>
    completedLessons.map(id => id.toString()).includes(lessonId?.toString());

  const getNextLesson = useCallback(() => {
    if (!modules.length || !activeLesson) return null;
    let found = false;
    for (const mod of modules) {
      for (const lesson of (mod.lessons || [])) {
        if (found) return lesson;
        if (lesson._id === activeLesson._id) found = true;
      }
    }
    return null;
  }, [modules, activeLesson]);

  const computedTotal = modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);
  const displayTotal  = computedTotal || totalLessons;

  if (!course) return (
    <div className="player-loader">
      <div className="loader-spinner" />
      <p>Loading Classroom...</p>
      {loadError && <p style={{color:'#ef4444', marginTop:8}}>{loadError}</p>}
    </div>
  );

  const nextLesson = getNextLesson();

  return (
    <div className="player-layout">

      {/* ── Top bar ── */}
      <div className="player-topbar">
        <Link to="/my-learning" className="topbar-back">← My Learning</Link>
        <div className="topbar-center">
          <span className="topbar-title">{course.title}</span>
        </div>
        <div className="topbar-progress">
          <div className="topbar-progress-track">
            <div className="topbar-progress-fill" style={{ width: percent + '%' }} />
          </div>
          <span className="topbar-progress-text">{percent}% complete</span>
        </div>
        <button className="sidebar-toggle-btn" onClick={() => setSidebarOpen(o => !o)}>
          {sidebarOpen ? '✕ Hide' : '☰ Curriculum'}
        </button>
      </div>

      <div className="player-body">
        <div className={`video-section ${!sidebarOpen ? 'expanded' : ''}`}>
          <div className="video-wrapper">

            {/* Note view */}
            {showNote && activeLesson && (
              <div className="note-view">
                <div className="note-icon">📄</div>
                <h2>{activeLesson.title}</h2>
                <a href={activeLesson.videoUrl} target="_blank" rel="noreferrer" className="note-link">
                  Open Resource →
                </a>
              </div>
            )}

            {/* No lesson selected */}
            {!activeLesson && (
              <div className="note-view">
                <div className="note-icon">▶</div>
                <h2>{modules.length === 0 ? 'No lessons added yet' : 'Select a lesson to start'}</h2>
              </div>
            )}

            {/* YouTube iframe — key forces remount on lesson change */}
            {embedUrl && !showNote && (
              <iframe
                key={embedUrl}
                ref={iframeRef}
                src={embedUrl}
                title={activeLesson?.title || 'Lecture'}
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
              />
            )}
          </div>

          {/* ── Lesson details ── */}
          <div className="lesson-details">
            <div className="lesson-details-top">
              <div>
                <h1 className="lesson-title">
                  {activeLesson?.title || (modules.length === 0 ? 'No lessons yet' : 'No lesson selected')}
                </h1>
                <p className="lesson-course-name">{course.title}</p>
                {/* PDF Notes */}
                {activeLesson?.notesPdf && (
                  <a
                    href={`${process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"}${activeLesson.notesPdf}`}
                    target="_blank"
                    rel="noreferrer"
                    className="pdf-notes-link"
                  >
                    📄 Download PDF Notes
                  </a>
                )}
              </div>
              <button
                className={`complete-btn ${isLessonDone(activeLesson?._id) ? 'completed' : ''}`}
                onClick={() => saveProgress(activeLesson?._id)}
                disabled={saving || !activeLesson}
              >
                {saving ? '...' : isLessonDone(activeLesson?._id) ? '✓ Completed' : 'Mark Complete'}
              </button>
            </div>

            <div className="progress-summary-bar">
              <div className="psb-fill" style={{ width: percent + '%' }} />
              <span className="psb-label">
                {completedLessons.length}/{displayTotal} lessons completed · {percent}%
              </span>
            </div>

            {nextLesson && (
              <div className="next-lesson-bar" onClick={() => setActiveLesson(nextLesson)}>
                <span>Up next:</span>
                <strong>{nextLesson.title}</strong>
                <span className="next-arrow">→</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Sidebar ── */}
        {sidebarOpen && (
          <div className="curriculum-sidebar">
            <div className="sidebar-header">
              <h3>Course Content</h3>
              <span className="sidebar-stats">{completedLessons.length}/{displayTotal} done</span>
            </div>
            <div className="sidebar-progress-bar">
              <div className="sidebar-progress-fill" style={{ width: percent + '%' }} />
            </div>
            {modules.length === 0 ? (
              <div className="sidebar-empty">
                <p>📭 No modules found.</p>
                <p>Add lessons from the Admin Dashboard.</p>
              </div>
            ) : (
              <div className="module-list">
                {modules.map((mod, mIdx) => (
                  <div key={mod._id} className="player-module">
                    <div className="module-header">
                      <span className="module-number">Module {mIdx + 1}</span>
                      <span className="module-title">{mod.title}</span>
                      <span className="module-count">{mod.lessons?.length || 0}</span>
                    </div>
                    <div className="lesson-list">
                      {(mod.lessons || []).length === 0 ? (
                        <div style={{padding:'10px 20px', color:'#64748b', fontSize:'0.8rem'}}>
                          No lessons in this module yet
                        </div>
                      ) : (
                        (mod.lessons || []).map((lesson) => {
                          const isActive = activeLesson?._id === lesson._id;
                          const isDone   = isLessonDone(lesson._id);
                          return (
                            <button
                              key={lesson._id}
                              className={`lesson-btn ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}
                              onClick={() => setActiveLesson(lesson)}
                            >
                              <span className={`lesson-status-dot ${isDone ? 'done' : isActive ? 'active' : ''}`} />
                              <span className="lesson-type-icon">
                                {lesson.videoType === 'note' ? '📄' : '▶'}
                              </span>
                              <span className="lesson-btn-title">{lesson.title}</span>
                              {isDone && <span className="done-tick">✓</span>}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}