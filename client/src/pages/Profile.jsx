import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/api';
import './Profile.css';

const YEARS = ['First Year', 'Second Year', 'Third Year', 'Final Year'];
const DIVISIONS = ['A', 'B', 'C', 'D'];

export default function Profile() {
  const [user, setUser]           = useState(JSON.parse(localStorage.getItem('user')) || {});
  const [fullUser, setFullUser]   = useState(null);
  const [courses, setCourses]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'edit' | 'password'
  const [saving, setSaving]       = useState(false);
  const [saveMsg, setSaveMsg]     = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarPreview, setAvatarPreview]     = useState(null);

  

  const [form, setForm] = useState({
    name: '', phone: '', rollNo: '', college: '',
    department: '', year: '', division: '', bio: '',
    linkedin: '', github: '',
  });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  // Load full profile + courses
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [profileRes, coursesRes] = await Promise.all([
          API.get('/auth/profile'),
          API.get('/progress/my-learning'),
        ]);
        const u = profileRes.data;
        setFullUser(u);
        setCourses(coursesRes.data);
        setForm({
          name:       u.name       || '',
          phone:      u.phone      || '',
          rollNo:     u.rollNo     || '',
          college:    u.college    || '',
          department: u.department || '',
          year:       u.year       || '',
          division:   u.division   || '',
          bio:        u.bio        || '',
          linkedin:   u.linkedin   || '',
          github:     u.github     || '',
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true); setSaveMsg('');
    try {
      const res = await API.put('/auth/profile', form);
      setFullUser(res.data.user);
      // Update localStorage name
      const stored = JSON.parse(localStorage.getItem('user'));
      localStorage.setItem('user', JSON.stringify({ ...stored, name: res.data.user.name }));
      setUser({ ...user, name: res.data.user.name });
      setSaveMsg('✅ Profile updated successfully!');
      setActiveTab('info');
    } catch (err) {
      setSaveMsg('❌ ' + (err.response?.data?.message || 'Update failed'));
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setSaveMsg('❌ New passwords do not match'); return;
    }
    setSaving(true); setSaveMsg('');
    try {
      await API.put('/auth/profile', {
        currentPassword: pwForm.currentPassword,
        newPassword:     pwForm.newPassword,
      });
      setSaveMsg('✅ Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setActiveTab('info');
    } catch (err) {
      setSaveMsg('❌ ' + (err.response?.data?.message || 'Failed'));
    } finally {
      setSaving(false);
    }
  };

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  // Stats
  const totalEnrolled  = courses.length;
  const totalCompleted = courses.filter(c => c.percent === 100).length;
  const inProgress     = courses.filter(c => c.percent > 0 && c.percent < 100).length;
  const overallPercent = totalEnrolled > 0
    ? Math.round(courses.reduce((a, c) => a + c.percent, 0) / totalEnrolled) : 0;

  const displayUser = fullUser || user;

  const avatarSrc = avatarPreview
    || (fullUser?.avatar ? `${BACKEND_URL}${fullUser.avatar}` : null);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Show local preview immediately
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarUploading(true);
    setSaveMsg('');
    try {
      const data = new FormData();
      data.append('avatar', file);
      const res = await API.post('/auth/avatar', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFullUser(res.data.user);
      // Update localStorage so navbar refreshes
      const stored = JSON.parse(localStorage.getItem('user'));
      localStorage.setItem('user', JSON.stringify({ ...stored, avatar: res.data.user.avatar }));
      setSaveMsg('✅ Profile photo updated!');
    } catch (err) {
      setSaveMsg('❌ ' + (err.response?.data?.message || 'Upload failed'));
      setAvatarPreview(null);
    } finally {
      setAvatarUploading(false);
    }
  };

  return (
    <div className="profile-page">

      {/* ── Cover + Avatar ── */}
      <div className="profile-cover">
        <div className="cover-gradient" />
        <div className="profile-top">
          <div className="profile-avatar-wrap">
            <div className="profile-avatar">
              {avatarSrc
                ? <img src={avatarSrc} alt="avatar" className="profile-avatar-img" />
                : <span>{displayUser?.name?.charAt(0).toUpperCase() || 'U'}</span>
              }
            </div>
            {/* Upload button overlay */}
            <label className="avatar-upload-label" title="Change photo">
              {avatarUploading ? '⏳' : '📷'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: 'none' }}
                onChange={handleAvatarChange}
                disabled={avatarUploading}
              />
            </label>
          </div>
          <div className="profile-name-block">
            <h1>{displayUser?.name || 'Student'}</h1>
            <p>{displayUser?.email}</p>
            <div className="profile-top-tags">
              <span className={`profile-role-tag ${displayUser?.role === 'admin' ? 'tag-admin' : 'tag-student'}`}>
                {displayUser?.role === 'admin' ? '⚡ Admin' : '🎓 Student'}
              </span>
              {fullUser?.rollNo && <span className="profile-roll-tag">Roll No: {fullUser.rollNo}</span>}
              {fullUser?.year   && <span className="profile-roll-tag">{fullUser.year}</span>}
            </div>
          </div>
          <button className="edit-profile-top-btn" onClick={() => { setActiveTab('edit'); setSaveMsg(''); }}>
            ✏ Edit Profile
          </button>
        </div>
      </div>

      <div className="profile-body">

        {/* ── Stats ── */}
        <div className="profile-stats-row">
          <div className="profile-stat"><div className="ps-value">{totalEnrolled}</div><div className="ps-label">Enrolled</div></div>
          <div className="profile-stat"><div className="ps-value">{inProgress}</div><div className="ps-label">In Progress</div></div>
          <div className="profile-stat"><div className="ps-value">{totalCompleted}</div><div className="ps-label">Completed</div></div>
          <div className="profile-stat"><div className="ps-value">{overallPercent}%</div><div className="ps-label">Avg Progress</div></div>
        </div>

        {/* ── Save message ── */}
        {saveMsg && (
          <div className={`save-msg ${saveMsg.startsWith('✅') ? 'success' : 'error'}`}>
            {saveMsg}
          </div>
        )}

        {/* ── Tabs ── */}
        <div className="profile-tabs">
          <button className={`ptab ${activeTab === 'info'     ? 'active' : ''}`} onClick={() => { setActiveTab('info');     setSaveMsg(''); }}>Profile Info</button>
          <button className={`ptab ${activeTab === 'edit'     ? 'active' : ''}`} onClick={() => { setActiveTab('edit');     setSaveMsg(''); }}>Edit Profile</button>
          <button className={`ptab ${activeTab === 'password' ? 'active' : ''}`} onClick={() => { setActiveTab('password'); setSaveMsg(''); }}>Change Password</button>
          <button className={`ptab ${activeTab === 'courses'  ? 'active' : ''}`} onClick={() => { setActiveTab('courses');  setSaveMsg(''); }}>My Courses</button>
        </div>

        {/* ── TAB: Profile Info ── */}
        {activeTab === 'info' && (
          <div className="profile-grid">
            <div className="profile-section-card">
              <h3>Personal Information</h3>
              <div className="info-row"><span className="info-label">Full Name</span><span className="info-value">{fullUser?.name || '—'}</span></div>
              <div className="info-row"><span className="info-label">Email</span><span className="info-value">{fullUser?.email || '—'}</span></div>
              <div className="info-row"><span className="info-label">Phone</span><span className="info-value">{fullUser?.phone || '—'}</span></div>
              <div className="info-row"><span className="info-label">Role</span><span className="info-value" style={{textTransform:'capitalize'}}>{fullUser?.role || '—'}</span></div>
              {fullUser?.bio && <div className="info-row"><span className="info-label">Bio</span><span className="info-value">{fullUser.bio}</span></div>}
            </div>

            <div className="profile-section-card">
              <h3>College Information</h3>
              <div className="info-row"><span className="info-label">Roll No</span><span className="info-value">{fullUser?.rollNo || '—'}</span></div>
              <div className="info-row"><span className="info-label">College</span><span className="info-value">{fullUser?.college || '—'}</span></div>
              <div className="info-row"><span className="info-label">Department</span><span className="info-value">{fullUser?.department || '—'}</span></div>
              <div className="info-row"><span className="info-label">Year</span><span className="info-value">{fullUser?.year || '—'}</span></div>
              <div className="info-row"><span className="info-label">Division</span><span className="info-value">{fullUser?.division || '—'}</span></div>
            </div>

            {(fullUser?.linkedin || fullUser?.github) && (
              <div className="profile-section-card">
                <h3>Social Links</h3>
                {fullUser?.linkedin && (
                  <div className="info-row">
                    <span className="info-label">LinkedIn</span>
                    <a href={fullUser.linkedin} target="_blank" rel="noreferrer" className="info-link">View Profile →</a>
                  </div>
                )}
                {fullUser?.github && (
                  <div className="info-row">
                    <span className="info-label">GitHub</span>
                    <a href={fullUser.github} target="_blank" rel="noreferrer" className="info-link">View Profile →</a>
                  </div>
                )}
              </div>
            )}

            <div className="profile-section-card">
              <div className="section-card-header">
                <h3>Learning Progress</h3>
              </div>
              <div className="overall-progress-wrap">
                <svg viewBox="0 0 120 120" className="progress-ring-svg">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#f1f5f9" strokeWidth="10"/>
                  <circle cx="60" cy="60" r="50" fill="none"
                    stroke={overallPercent === 100 ? '#22c55e' : '#2563eb'}
                    strokeWidth="10" strokeLinecap="round"
                    strokeDasharray={`${(overallPercent/100)*314} 314`}
                    transform="rotate(-90 60 60)"
                    style={{transition:'stroke-dasharray 0.8s ease'}}
                  />
                  <text x="60" y="58" textAnchor="middle" className="ring-pct">{overallPercent}%</text>
                  <text x="60" y="74" textAnchor="middle" className="ring-label">complete</text>
                </svg>
                <div className="progress-ring-info">
                  <div className="pri-row"><span className="pri-dot" style={{background:'#2563eb'}}/><span>{inProgress} in progress</span></div>
                  <div className="pri-row"><span className="pri-dot" style={{background:'#22c55e'}}/><span>{totalCompleted} completed</span></div>
                  <div className="pri-row"><span className="pri-dot" style={{background:'#e2e8f0'}}/><span>{totalEnrolled} total enrolled</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: Edit Profile ── */}
        {activeTab === 'edit' && (
          <form onSubmit={handleSaveProfile} className="edit-form-card">
            <h3>Edit Your Profile</h3>

            <div className="edit-section-title">Personal Details</div>
            <div className="edit-grid">
              <div className="edit-field">
                <label>Full Name *</label>
                <input type="text" value={form.name} onChange={set('name')} required placeholder="Your full name"/>
              </div>
              <div className="edit-field">
                <label>Phone Number</label>
                <input type="tel" value={form.phone} onChange={set('phone')} placeholder="e.g. 9876543210"/>
              </div>
            </div>
            <div className="edit-field full-width">
              <label>Bio</label>
              <textarea value={form.bio} onChange={set('bio')} rows={3} placeholder="Tell us a bit about yourself..."/>
            </div>

            <div className="edit-section-title">College Information</div>
            <div className="edit-grid">
              <div className="edit-field">
                <label>Roll Number</label>
                <input type="text" value={form.rollNo} onChange={set('rollNo')} placeholder="e.g. YBIT2021CSE042"/>
              </div>
              <div className="edit-field">
                <label>College Name</label>
                <input type="text" value={form.college} onChange={set('college')} placeholder="e.g. YBIT College of Engineering"/>
              </div>
              <div className="edit-field">
                <label>Department / Branch</label>
                <input type="text" value={form.department} onChange={set('department')} placeholder="e.g. Computer Science"/>
              </div>
              <div className="edit-field">
                <label>Year</label>
                <select value={form.year} onChange={set('year')}>
                  <option value="">Select Year</option>
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div className="edit-field">
                <label>Division</label>
                <select value={form.division} onChange={set('division')}>
                  <option value="">Select Division</option>
                  {DIVISIONS.map(d => <option key={d} value={d}>Division {d}</option>)}
                </select>
              </div>
            </div>

            <div className="edit-section-title">Social Links</div>
            <div className="edit-grid">
              <div className="edit-field">
                <label>LinkedIn URL</label>
                <input type="url" value={form.linkedin} onChange={set('linkedin')} placeholder="https://linkedin.com/in/yourname"/>
              </div>
              <div className="edit-field">
                <label>GitHub URL</label>
                <input type="url" value={form.github} onChange={set('github')} placeholder="https://github.com/yourname"/>
              </div>
            </div>

            <div className="edit-form-actions">
              <button type="button" className="cancel-edit-btn" onClick={() => setActiveTab('info')}>Cancel</button>
              <button type="submit" className="save-edit-btn" disabled={saving}>
                {saving ? 'Saving...' : '💾 Save Changes'}
              </button>
            </div>
          </form>
        )}

        {/* ── TAB: Change Password ── */}
        {activeTab === 'password' && (
          <form onSubmit={handleChangePassword} className="edit-form-card">
            <h3>Change Password</h3>
            <div className="edit-field">
              <label>Current Password</label>
              <input type="password" value={pwForm.currentPassword} required
                onChange={e => setPwForm(f => ({...f, currentPassword: e.target.value}))}
                placeholder="Enter your current password"/>
            </div>
            <div className="edit-grid">
              <div className="edit-field">
                <label>New Password</label>
                <input type="password" value={pwForm.newPassword} required
                  onChange={e => setPwForm(f => ({...f, newPassword: e.target.value}))}
                  placeholder="Min. 6 characters"/>
              </div>
              <div className="edit-field">
                <label>Confirm New Password</label>
                <input type="password" value={pwForm.confirmPassword} required
                  onChange={e => setPwForm(f => ({...f, confirmPassword: e.target.value}))}
                  placeholder="Re-enter new password"/>
              </div>
            </div>
            <div className="edit-form-actions">
              <button type="button" className="cancel-edit-btn" onClick={() => setActiveTab('info')}>Cancel</button>
              <button type="submit" className="save-edit-btn" disabled={saving}>
                {saving ? 'Updating...' : '🔒 Update Password'}
              </button>
            </div>
          </form>
        )}

        {/* ── TAB: My Courses ── */}
        {activeTab === 'courses' && (
          <div className="profile-section-card">
            <div className="section-card-header">
              <h3>My Courses</h3>
              <Link to="/my-learning" className="see-all-link">See All →</Link>
            </div>
            {loading ? <p className="loading-text">Loading...</p>
            : courses.length === 0 ? (
              <div className="no-courses">
                <p>No courses enrolled yet.</p>
                <Link to="/" className="browse-link">Browse Courses</Link>
              </div>
            ) : (
              <div className="course-progress-list">
                {courses.map(course => (
                  <div key={course._id} className="cpl-item">
                    <div className="cpl-info">
                      <span className="cpl-title">{course.title}</span>
                      <span className="cpl-subject">{course.subject} · {course.level}</span>
                    </div>
                    <div className="cpl-bar-wrap">
                      <div className="cpl-bar">
                        <div className="cpl-fill" style={{ width: course.percent+'%', background: course.percent===100?'#22c55e':'#2563eb' }}/>
                      </div>
                      <span className="cpl-pct">{course.percent}%</span>
                    </div>
                    <Link to={`/course-player/${course._id}`} className="cpl-continue">
                      {course.percent === 100 ? 'Review' : 'Continue'}
                    </Link>
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