import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/api';
import Sidebar from '../components/Sidebar';
import './ManageCourse.css';

export default function ManageCourse() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse]   = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  // Module form
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [moduleTitle, setModuleTitle]       = useState('');
  const [moduleOrder, setModuleOrder]       = useState(1);
  const [savingModule, setSavingModule]     = useState(false);

  // Add lesson form
  const [activeLessonForm, setActiveLessonForm] = useState(null);
  const [lessonData, setLessonData]             = useState({ title: '', videoUrl: '', order: 1 });
  const [pdfFile, setPdfFile]                   = useState(null);
  const [savingLesson, setSavingLesson]         = useState(false);

  // Edit lesson form
  const [editingLesson, setEditingLesson]   = useState(null); // lesson object
  const [editData, setEditData]             = useState({ title: '', videoUrl: '', order: 1 });
  const [editPdfFile, setEditPdfFile]       = useState(null);
  const [savingEdit, setSavingEdit]         = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [courseRes, modulesRes] = await Promise.all([
        API.get(`/courses/${courseId}`),
        API.get(`/modules/${courseId}`),
      ]);
      setCourse(courseRes.data);
      setModules(modulesRes.data);
    } catch (err) {
      console.error('Error loading course:', err);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Create Module ────────────────────────────────────────────────
  const handleCreateModule = async (e) => {
    e.preventDefault();
    setSavingModule(true);
    try {
      await API.post('/modules', { title: moduleTitle, courseId, order: moduleOrder });
      setModuleTitle('');
      setModuleOrder(modules.length + 2);
      setShowModuleForm(false);
      await fetchData();
    } catch (err) {
      alert('Failed to create module: ' + (err.response?.data?.message || err.message));
    } finally { setSavingModule(false); }
  };

  // ── Create Lesson ────────────────────────────────────────────────
  const handleCreateLesson = async (e, moduleId) => {
    e.preventDefault();
    setSavingLesson(true);
    try {
      const data = new FormData();
      data.append('title',    lessonData.title);
      data.append('videoUrl', lessonData.videoUrl);
      data.append('order',    lessonData.order);
      data.append('module',   moduleId);
      if (pdfFile) data.append('notesPdf', pdfFile);
      await API.post('/lessons', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setLessonData({ title: '', videoUrl: '', order: 1 });
      setPdfFile(null);
      setActiveLessonForm(null);
      await fetchData();
    } catch (err) {
      alert('Failed to add lesson: ' + (err.response?.data?.message || err.message));
    } finally { setSavingLesson(false); }
  };

  // ── Edit Lesson ──────────────────────────────────────────────────
  const startEdit = (lesson) => {
    setEditingLesson(lesson);
    setEditData({ title: lesson.title, videoUrl: lesson.videoUrl || '', order: lesson.order || 1 });
    setEditPdfFile(null);
    setActiveLessonForm(null); // close add form if open
  };

  const handleEditLesson = async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    try {
      const data = new FormData();
      data.append('title',    editData.title);
      data.append('videoUrl', editData.videoUrl);
      data.append('order',    editData.order);
      if (editPdfFile) data.append('notesPdf', editPdfFile);
      await API.put(`/lessons/${editingLesson._id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setEditingLesson(null);
      await fetchData();
    } catch (err) {
      alert('Failed to update lesson: ' + (err.response?.data?.message || err.message));
    } finally { setSavingEdit(false); }
  };

  // ── Delete Lesson ────────────────────────────────────────────────
  const handleDeleteLesson = async (lessonId, lessonTitle) => {
    if (!window.confirm(`Delete "${lessonTitle}"? This cannot be undone.`)) return;
    try {
      await API.delete(`/lessons/${lessonId}`);
      await fetchData();
    } catch (err) {
      alert('Failed to delete lesson.');
    }
  };

  const openLessonForm = (moduleId, count) => {
    setActiveLessonForm(moduleId);
    setLessonData({ title: '', videoUrl: '', order: count + 1 });
    setPdfFile(null);
    setEditingLesson(null);
  };

  if (loading) return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content"><p style={{ padding: 40 }}>Loading...</p></div>
    </div>
  );

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">

        {/* Header */}
        <div className="mc-header">
          <div>
            <button className="mc-back-btn" onClick={() => navigate('/admin/dashboard')}>← Back to Dashboard</button>
            <h1 className="mc-title">{course?.title}</h1>
            <p className="mc-subtitle">
              {modules.length} module{modules.length !== 1 ? 's' : ''} ·{' '}
              {modules.reduce((a, m) => a + (m.lessons?.length || 0), 0)} total lessons
            </p>
          </div>
          <button className="mc-add-module-btn" onClick={() => setShowModuleForm(s => !s)}>
            {showModuleForm ? '✕ Cancel' : '+ Add Module'}
          </button>
        </div>

        {/* Add Module form */}
        {showModuleForm && (
          <form className="mc-inline-form" onSubmit={handleCreateModule}>
            <h3>New Module</h3>
            <div className="mc-form-row">
              <input type="text" placeholder="Module title" value={moduleTitle}
                onChange={e => setModuleTitle(e.target.value)} required className="mc-input" />
              <input type="number" placeholder="Order" min="1" value={moduleOrder}
                onChange={e => setModuleOrder(Number(e.target.value))} className="mc-input mc-input-sm" />
              <button type="submit" className="mc-save-btn" disabled={savingModule}>
                {savingModule ? 'Saving...' : 'Create Module'}
              </button>
            </div>
          </form>
        )}

        {/* Edit Lesson Modal */}
        {editingLesson && (
          <div className="mc-modal-overlay" onClick={() => setEditingLesson(null)}>
            <div className="mc-modal" onClick={e => e.stopPropagation()}>
              <div className="mc-modal-header">
                <h3>✏️ Edit Lecture</h3>
                <button className="mc-modal-close" onClick={() => setEditingLesson(null)}>✕</button>
              </div>
              <form onSubmit={handleEditLesson}>
                <div className="mc-form-col">
                  <label className="mc-label">Lecture Title</label>
                  <input type="text" value={editData.title} required className="mc-input"
                    onChange={e => setEditData(d => ({ ...d, title: e.target.value }))} />
                </div>
                <div className="mc-form-col">
                  <label className="mc-label">Video URL</label>
                  <input type="text" value={editData.videoUrl} required className="mc-input"
                    placeholder="YouTube URL"
                    onChange={e => setEditData(d => ({ ...d, videoUrl: e.target.value }))} />
                </div>
                <div className="mc-form-row" style={{ gap: 12 }}>
                  <div className="mc-form-col" style={{ flex: '0 0 100px' }}>
                    <label className="mc-label">Order</label>
                    <input type="number" min="1" value={editData.order} className="mc-input"
                      onChange={e => setEditData(d => ({ ...d, order: Number(e.target.value) }))} />
                  </div>
                  <div className="mc-form-col" style={{ flex: 1 }}>
                    <label className="mc-label">Replace PDF Notes (optional)</label>
                    <input type="file" accept="application/pdf"
                      onChange={e => setEditPdfFile(e.target.files[0])} className="mc-file-input" />
                    {editingLesson.notesPdf && !editPdfFile && (
                      <span className="mc-existing-pdf">📄 Current PDF attached</span>
                    )}
                  </div>
                </div>
                <div className="mc-modal-actions">
                  <button type="button" className="mc-cancel-btn" onClick={() => setEditingLesson(null)}>Cancel</button>
                  <button type="submit" className="mc-save-btn" disabled={savingEdit}>
                    {savingEdit ? 'Saving...' : '✓ Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modules */}
        {modules.length === 0 ? (
          <div className="mc-empty">
            <div className="mc-empty-icon">📦</div>
            <h3>No modules yet</h3>
            <p>Click <strong>"+ Add Module"</strong> above to create the first module.</p>
          </div>
        ) : (
          <div className="mc-module-list">
            {modules.map((mod, idx) => (
              <div key={mod._id} className="mc-module-card">
                <div className="mc-module-header">
                  <div className="mc-module-info">
                    <span className="mc-module-num">Module {idx + 1}</span>
                    <h3 className="mc-module-title">{mod.title}</h3>
                    <span className="mc-lesson-count">
                      {mod.lessons?.length || 0} lesson{mod.lessons?.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <button className="mc-add-lesson-btn"
                    onClick={() => activeLessonForm === mod._id
                      ? setActiveLessonForm(null)
                      : openLessonForm(mod._id, mod.lessons?.length || 0)}>
                    {activeLessonForm === mod._id ? '✕ Cancel' : '+ Add Lecture'}
                  </button>
                </div>

                {/* Add lesson form */}
                {activeLessonForm === mod._id && (
                  <form className="mc-lesson-form" onSubmit={e => handleCreateLesson(e, mod._id)}>
                    <div className="mc-form-row">
                      <input type="text" placeholder="Lecture title" value={lessonData.title}
                        onChange={e => setLessonData(d => ({ ...d, title: e.target.value }))}
                        required className="mc-input" />
                      <input type="number" placeholder="Order" min="1" value={lessonData.order}
                        onChange={e => setLessonData(d => ({ ...d, order: Number(e.target.value) }))}
                        className="mc-input mc-input-sm" />
                    </div>
                    <div className="mc-form-row">
                      <input type="text" placeholder="YouTube URL" value={lessonData.videoUrl}
                        onChange={e => setLessonData(d => ({ ...d, videoUrl: e.target.value }))}
                        required className="mc-input" />
                    </div>
                    <div className="mc-form-row">
                      <label className="mc-pdf-label">
                        📎 PDF Notes (optional):
                        <input type="file" accept="application/pdf"
                          onChange={e => setPdfFile(e.target.files[0])} className="mc-file-input" />
                      </label>
                      <button type="submit" className="mc-save-btn" disabled={savingLesson}>
                        {savingLesson ? 'Publishing...' : '✓ Publish Lecture'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Lessons list */}
                {mod.lessons?.length > 0 ? (
                  <div className="mc-lesson-list">
                    {mod.lessons.map((lesson, lIdx) => (
                      <div key={lesson._id} className="mc-lesson-item">
                        <span className="mc-lesson-num">{lIdx + 1}</span>
                        <div className="mc-lesson-info">
                          <span className="mc-lesson-title">{lesson.title}</span>
                          <div className="mc-lesson-meta">
                            {lesson.videoUrl && (
                              <span className="mc-lesson-url">
                                🎬 {lesson.videoUrl.length > 55 ? lesson.videoUrl.substring(0,55)+'…' : lesson.videoUrl}
                              </span>
                            )}
                            {lesson.notesPdf && <span className="mc-lesson-pdf">📄 PDF attached</span>}
                          </div>
                        </div>
                        <div className="mc-lesson-btns">
                          <button className="mc-edit-lesson-btn" onClick={() => startEdit(lesson)}>
                            ✏️ Edit
                          </button>
                          <button className="mc-delete-lesson-btn" onClick={() => handleDeleteLesson(lesson._id, lesson.title)}>
                            🗑 Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mc-no-lessons">
                    No lectures yet — click <strong>"+ Add Lecture"</strong> to add one.
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}