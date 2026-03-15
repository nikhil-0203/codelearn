import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import API from '../api/api';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [stats, setStats] = useState({ users: 0, courses: 0, lessons: 0 });
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [requests, setRequests] = useState([]);
  const [progressData, setProgressData] = useState([]);
  const [view, setView] = useState('courses');
  const [searchTerm, setSearchTerm] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [filterLevel, setFilterLevel] = useState('All');
  const [editingCourse, setEditingCourse] = useState(null);

  // Announcements state
  const [announcements, setAnnouncements]     = useState([]);
  const [annForm, setAnnForm]                 = useState({ title: '', content: '', type: 'info', pinned: false });
  const [annSaving, setAnnSaving]             = useState(false);
  const [editingAnn, setEditingAnn]           = useState(null);

  
  const user = JSON.parse(localStorage.getItem('user'));

  const fetchData = async () => {
    try {
      const statsRes = await API.get("/courses/admin/stats");
      setStats(statsRes.data);

      const coursesRes = await API.get('/courses');
      setCourses(coursesRes.data);
      setFilteredCourses(coursesRes.data);

      const studentsRes = await API.get('/auth/users');
      const studentData = studentsRes.data.filter(u => u.role === 'student');
      setStudents(studentData);
      setFilteredStudents(studentData);

      const requestsRes = await API.get('/enrollment/pending');
      setRequests(requestsRes.data);

      const progressRes = await API.get('/progress/admin/all');
      setProgressData(progressRes.data);

      const annRes = await API.get('/announcements');
      setAnnouncements(annRes.data);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    }
  };

  useEffect(() => { fetchData(); }, [view]);

  useEffect(() => {
    let result = courses.filter(course =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.subject?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filterLevel !== 'All') result = result.filter(c => c.level === filterLevel);
    setFilteredCourses(result);
  }, [searchTerm, filterLevel, courses]);

  useEffect(() => {
    const result = students.filter(s =>
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.email.toLowerCase().includes(studentSearch.toLowerCase())
    );
    setFilteredStudents(result);
  }, [studentSearch, students]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        await API.delete(`/courses/${id}`);
        fetchData();
      } catch {
        alert("Failed to delete course.");
      }
    }
  };

  const handleEnrollAction = async (requestId, action) => {
    try {
      await API.put(`/enrollment/${requestId}`, { status: action });
      alert(`Student ${action === 'approved' ? 'Approved' : 'Rejected'}`);
      fetchData();
    } catch {
      alert("Action failed.");
    }
  };

  const handleUpdateCourse = async () => {
    try {
      await API.put(`/courses/${editingCourse._id}`, {
        accessType: editingCourse.accessType,
        price: editingCourse.price,
      });
      alert("Course updated successfully!");
      setEditingCourse(null);
      fetchData();
    } catch {
      alert("Failed to update course.");
    }
  };

  const getAccessLabel = (type) => {
    if (!type) return 'free';
    const t = type.trim().toLowerCase();
    if (t === 'paid' || t === 'pais') return 'paid';
    if (t.startsWith('approv')) return 'approval';
    return 'free';
  };

  const handleSaveAnn = async (e) => {
    e.preventDefault();
    setAnnSaving(true);
    try {
      if (editingAnn) {
        await API.put(`/announcements/${editingAnn._id}`, annForm);
      } else {
        await API.post('/announcements', annForm);
      }
      setAnnForm({ title: '', content: '', type: 'info', pinned: false });
      setEditingAnn(null);
      fetchData();
    } catch { alert('Failed to save announcement.'); }
    finally { setAnnSaving(false); }
  };

  const handleDeleteAnn = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    await API.delete(`/announcements/${id}`);
    fetchData();
  };

  const startEditAnn = (ann) => {
    setEditingAnn(ann);
    setAnnForm({ title: ann.title, content: ann.content, type: ann.type, pinned: ann.pinned });
  };

  const ANN_COLORS = { info:'#2563eb', success:'#16a34a', warning:'#d97706', urgent:'#dc2626' };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">

        {/* ── Header ── */}
        <header className="dashboard-header">
          <div className="header-info">
            <h1>Admin Control Center</h1>
            <p>Welcome back, <strong>{user?.name || 'Admin'}</strong> 👋</p>
          </div>
          <div className="header-actions">
            <div className="toggle-group">
              <button className={`toggle-btn ${view === 'courses'  ? 'active' : ''}`} onClick={() => setView('courses')}>Courses</button>
              <button className={`toggle-btn ${view === 'students' ? 'active' : ''}`} onClick={() => setView('students')}>Students</button>
              <button className={`toggle-btn ${view === 'requests' ? 'active' : ''}`} onClick={() => setView('requests')}>Requests</button>
              <button className={`toggle-btn ${view === 'progress' ? 'active' : ''}`} onClick={() => setView('progress')}>Progress</button>
              <button className={`toggle-btn ${view === 'announcements' ? 'active' : ''}`} onClick={() => setView('announcements')}>📢 Notices</button>
            </div>
            <Link to="/admin/create-course" className="create-btn">+ Create Course</Link>
          </div>
        </header>

        {/* ── Stats ── */}
        <div className="stats-container">
          <div className="stat-card highlight">
            <span className="stat-icon">🎓</span>
            <h3>Total Students</h3>
            <p>{stats.users}</p>
          </div>
          <div className="stat-card">
            <span className="stat-icon">📚</span>
            <h3>Active Courses</h3>
            <p>{stats.courses}</p>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🎬</span>
            <h3>Total Lessons</h3>
            <p>{stats.lessons}</p>
          </div>
          <div className="stat-card revenue">
            <span className="stat-icon">💰</span>
            <h3>Paid Courses</h3>
            <p>{courses.filter(c => getAccessLabel(c.accessType) === 'paid').length}</p>
            <span className="stat-sub">Payment-enabled</span>
          </div>
        </div>

        {/* ── Views ── */}
        {view === 'courses' && (
          <>
            <div className="filter-bar">
              <input type="text" placeholder="Search courses..." className="search-input"
                onChange={(e) => setSearchTerm(e.target.value)} />
              <select className="level-select" onChange={(e) => setFilterLevel(e.target.value)}>
                <option value="All">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <div className="modern-grid">
              {filteredCourses.map((course) => {
                const accessLabel = getAccessLabel(course.accessType);
                return (
                  <div key={course._id} className="modern-card">
                    <div className="card-image-section">
                      <span className={`access-badge access-${accessLabel}`}>{accessLabel}</span>
                      {course.image
                        ? <img src={`${BACKEND_URL}${course.image}`} alt={course.title} className="course-thumb" />
                        : <div className="thumb-placeholder">{course.subject?.substring(0, 3).toUpperCase()}</div>
                      }
                      <span className="lang-badge">{course.subject}</span>
                    </div>
                    <div className="card-body">
                      <span className={`level-badge ${course.level?.toLowerCase()}`}>{course.level}</span>
                      <h3>{course.title}</h3>
                      {accessLabel === 'paid' && (
                        <p style={{ color: '#16a34a', fontWeight: 700, fontSize: '0.9rem' }}>₹{course.price || 0}</p>
                      )}
                      <div className="card-actions">
                        <Link to={`/admin/manage-course/${course._id}`} className="manage-link">Manage Lectures</Link>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => setEditingCourse({ ...course })} className="edit-btn">Edit</button>
                          <button onClick={() => handleDelete(course._id)} className="delete-btn">Delete</button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {view === 'students' && (
          <div className="student-table-container">
            <div className="student-header">
              <h2 className="section-title">Registered Students</h2>
              <input type="text" placeholder="Search by name or email..." className="student-search"
                value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)} />
            </div>
            <table className="admin-table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Joined Date</th></tr>
              </thead>
              <tbody>
                {filteredStudents.map(s => (
                  <tr key={s._id}>
                    <td className="student-name">{s.name}</td>
                    <td>{s.email}</td>
                    <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {view === 'requests' && (
          <div className="student-table-container">
            <h2 className="section-title">Pending Enrollment Requests</h2>
            <table className="admin-table">
              <thead>
                <tr><th>Student</th><th>Course</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {requests.length > 0 ? requests.map(req => (
                  <tr key={req._id}>
                    <td>{req.userId?.name}</td>
                    <td>{req.courseId?.title}</td>
                    <td><span className="request-status">Pending</span></td>
                    <td>
                      <button onClick={() => handleEnrollAction(req._id, 'approved')} className="approve-btn">Approve</button>
                      <button onClick={() => handleEnrollAction(req._id, 'rejected')} className="reject-btn">Reject</button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="4" className="no-data">No pending requests found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {view === 'progress' && (
          <div className="student-table-container">
            <h2 className="section-title">Student Progress Tracker</h2>
            <table className="admin-table" style={{ marginTop: 16 }}>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Course</th>
                  <th>Progress</th>
                  <th>Lessons</th>
                  <th>Last Accessed</th>
                </tr>
              </thead>
              <tbody>
                {progressData.length > 0 ? progressData.map((p, i) => (
                  <tr key={i}>
                    <td>
                      <div className="student-name">{p.student?.name}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{p.student?.email}</div>
                    </td>
                    <td>{p.course?.title}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ flex: 1, height: 8, background: '#f1f5f9', borderRadius: 6, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', width: p.percent + '%',
                            background: p.percent === 100 ? '#22c55e' : '#2563eb',
                            borderRadius: 6, transition: 'width 0.4s'
                          }} />
                        </div>
                        <span style={{
                          fontWeight: 700, fontSize: '0.82rem', minWidth: 36,
                          color: p.percent === 100 ? '#16a34a' : '#2563eb'
                        }}>{p.percent}%</span>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{p.completedLessons}/{p.totalLessons}</td>
                    <td style={{ fontSize: '0.82rem', color: '#64748b' }}>
                      {p.lastAccessedAt
                        ? new Date(p.lastAccessedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '—'}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="no-data">No progress data yet. Students need to start learning!</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Announcements view ── */}
        {view === 'announcements' && (
          <div className="student-table-container">
            <h2 className="section-title">📢 Manage Announcements</h2>

            {/* Create / Edit form */}
            <form onSubmit={handleSaveAnn} className="ann-admin-form">
              <h3>{editingAnn ? 'Edit Announcement' : 'New Announcement'}</h3>
              <div className="ann-form-row">
                <input
                  type="text" placeholder="Title" required
                  value={annForm.title}
                  onChange={e => setAnnForm(f => ({...f, title: e.target.value}))}
                  className="ann-input"
                />
                <select
                  value={annForm.type}
                  onChange={e => setAnnForm(f => ({...f, type: e.target.value}))}
                  className="ann-select"
                >
                  <option value="info">📢 Info</option>
                  <option value="success">✅ Update</option>
                  <option value="warning">⚠️ Warning</option>
                  <option value="urgent">🚨 Urgent</option>
                </select>
                <label className="ann-pin-check">
                  <input type="checkbox" checked={annForm.pinned}
                    onChange={e => setAnnForm(f => ({...f, pinned: e.target.checked}))} />
                  📌 Pin
                </label>
              </div>
              <textarea
                placeholder="Write your announcement content here..."
                required rows={4}
                value={annForm.content}
                onChange={e => setAnnForm(f => ({...f, content: e.target.value}))}
                className="ann-textarea"
              />
              <div className="ann-form-actions">
                {editingAnn && (
                  <button type="button" className="cancel-btn"
                    onClick={() => { setEditingAnn(null); setAnnForm({ title:'', content:'', type:'info', pinned:false }); }}>
                    Cancel
                  </button>
                )}
                <button type="submit" className="submit-btn" disabled={annSaving}>
                  {annSaving ? 'Saving...' : editingAnn ? '✓ Update' : '+ Post Announcement'}
                </button>
              </div>
            </form>

            {/* Announcements list */}
            <div className="ann-admin-list">
              {announcements.length === 0 ? (
                <p style={{color:'#94a3b8', padding:'20px 0'}}>No announcements yet.</p>
              ) : announcements.map(ann => (
                <div key={ann._id} className="ann-admin-item"
                  style={{ borderLeft: `4px solid ${ANN_COLORS[ann.type] || '#2563eb'}` }}>
                  <div className="ann-admin-item-info">
                    <div className="ann-admin-item-top">
                      <strong>{ann.title}</strong>
                      {ann.pinned && <span className="ann-pin-tag">📌 Pinned</span>}
                      <span className="ann-type-tag" style={{ color: ANN_COLORS[ann.type] }}>
                        {ann.type}
                      </span>
                    </div>
                    <p>{ann.content.substring(0, 100)}{ann.content.length > 100 ? '…' : ''}</p>
                    <small>{new Date(ann.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</small>
                  </div>
                  <div className="ann-admin-item-actions">
                    <button className="edit-btn" onClick={() => startEditAnn(ann)}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDeleteAnn(ann._id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ── Edit Course Modal ── */}
      {editingCourse && (
        <div className="modal-overlay" onClick={() => setEditingCourse(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3>Edit Course Access</h3>
            <p className="modal-course-name">{editingCourse.title}</p>

            <div className="form-group">
              <label>Access Type</label>
              <select
                value={editingCourse.accessType || 'free'}
                onChange={e => setEditingCourse({
                  ...editingCourse,
                  accessType: e.target.value,
                  price: e.target.value !== 'paid' ? 0 : editingCourse.price
                })}
              >
                <option value="free">Free (Public)</option>
                <option value="approval">Request Approval</option>
                <option value="paid">Paid Access</option>
              </select>
            </div>

            {(editingCourse.accessType === 'paid' || editingCourse.accessType === 'pais') && (
              <div className="form-group">
                <label>Price (₹)</label>
                <input
                  type="number"
                  min="1"
                  value={editingCourse.price || ''}
                  placeholder="Enter price e.g. 99"
                  onChange={e => setEditingCourse({ ...editingCourse, price: e.target.value })}
                />
              </div>
            )}

            <div className="modal-actions">
              <button onClick={() => setEditingCourse(null)} className="cancel-btn">Cancel</button>
              <button onClick={handleUpdateCourse} className="submit-btn">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}