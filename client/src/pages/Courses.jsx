import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/api';
import './Courses.css';


const CATEGORIES = ['All', 'Coding', 'Academic', 'General'];
const LEVELS     = ['All', 'Beginner', 'Intermediate', 'Advanced'];
const ACCESS     = ['All', 'Free', 'Paid', 'Approval'];
const SORT_OPTIONS = [
  { value: 'newest',  label: 'Newest First' },
  { value: 'oldest',  label: 'Oldest First' },
  { value: 'az',      label: 'A → Z' },
  { value: 'za',      label: 'Z → A' },
  { value: 'price-lo',label: 'Price: Low → High' },
  { value: 'price-hi',label: 'Price: High → Low' },
];

const normalizeAccess = (t) => {
  if (!t) return 'free';
  const s = t.trim().toLowerCase();
  if (s === 'paid' || s === 'pais') return 'paid';
  if (s.startsWith('approv')) return 'approval';
  return 'free';
};

export default function Courses() {
  const [courses, setCourses]   = useState([]);
  const [search, setSearch]     = useState('');
  const [level, setLevel]       = useState('All');
  const [category, setCategory] = useState('All');
  const [access, setAccess]     = useState('All');
  const [sort, setSort]         = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    API.get('/courses')
      .then((res) => { setCourses(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = courses.filter(c => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        c.title?.toLowerCase().includes(q) ||
        c.subject?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.category?.toLowerCase().includes(q);
      const matchLevel    = level    === 'All' || c.level === level;
      const matchCategory = category === 'All' || c.category === category;
      const matchAccess   = access   === 'All' || normalizeAccess(c.accessType) === access.toLowerCase();
      return matchSearch && matchLevel && matchCategory && matchAccess;
    });

    // Sort
    switch (sort) {
      case 'az':       result = [...result].sort((a,b) => a.title.localeCompare(b.title)); break;
      case 'za':       result = [...result].sort((a,b) => b.title.localeCompare(a.title)); break;
      case 'oldest':   result = [...result].sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt)); break;
      case 'price-lo': result = [...result].sort((a,b) => (a.price||0) - (b.price||0)); break;
      case 'price-hi': result = [...result].sort((a,b) => (b.price||0) - (a.price||0)); break;
      default:         result = [...result].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return result;
  }, [courses, search, level, category, access, sort]);

  const activeFiltersCount = [
    level !== 'All', category !== 'All', access !== 'All'
  ].filter(Boolean).length;

  const clearAll = () => { setSearch(''); setLevel('All'); setCategory('All'); setAccess('All'); setSort('newest'); };

  return (
    <div className="courses-page">

      {/* ── Hero ── */}
      <div className="courses-hero">
        <div className="hero-inner">
          <span className="hero-badge">📚 YBIT Learning Platform</span>
          <h1>Explore Learning Paths</h1>
          <p>Master Coding and Academic subjects with our expert curriculum.</p>
          <div className="hero-search">
            <span className="search-icon-hero">🔍</span>
            <input
              type="text"
              placeholder="Search by title, subject, description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch('')}>✕</button>
            )}
          </div>
          {/* Quick stats */}
          <div className="hero-quick-stats">
            <span>📚 {courses.length} Courses</span>
            <span>🆓 {courses.filter(c => normalizeAccess(c.accessType) === 'free').length} Free</span>
            <span>🎓 {[...new Set(courses.map(c => c.subject))].length} Subjects</span>
          </div>
        </div>
      </div>

      <div className="courses-body">

        {/* ── Filter toolbar ── */}
        <div className="filter-toolbar">
          {/* Category tabs */}
          <div className="category-tabs">
            {CATEGORIES.map(cat => (
              <button key={cat} className={`cat-tab ${category === cat ? 'active' : ''}`}
                onClick={() => setCategory(cat)}>{cat}</button>
            ))}
          </div>

          <div className="toolbar-right">
            {/* Advanced filter toggle */}
            <button className={`adv-filter-btn ${showFilters ? 'open' : ''}`}
              onClick={() => setShowFilters(s => !s)}>
              ⚙ Filters {activeFiltersCount > 0 && <span className="filter-badge">{activeFiltersCount}</span>}
            </button>
            {/* Sort */}
            <select className="sort-select" value={sort} onChange={e => setSort(e.target.value)}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <span className="results-count">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* ── Advanced filters panel ── */}
        {showFilters && (
          <div className="adv-filters-panel">
            <div className="afp-group">
              <label>Difficulty Level</label>
              <div className="afp-pills">
                {LEVELS.map(l => (
                  <button key={l} className={`afp-pill ${level === l ? 'active' : ''}`}
                    onClick={() => setLevel(l)}>{l}</button>
                ))}
              </div>
            </div>
            <div className="afp-group">
              <label>Access Type</label>
              <div className="afp-pills">
                {ACCESS.map(a => (
                  <button key={a} className={`afp-pill ${access === a ? 'active' : ''}`}
                    onClick={() => setAccess(a)}>{a}</button>
                ))}
              </div>
            </div>
            {activeFiltersCount > 0 && (
              <button className="clear-filters-btn" onClick={clearAll}>✕ Clear all filters</button>
            )}
          </div>
        )}

        {/* ── Active filter chips ── */}
        {(search || activeFiltersCount > 0) && (
          <div className="active-chips">
            {search && <span className="chip">🔍 "{search}" <button onClick={() => setSearch('')}>✕</button></span>}
            {level !== 'All' && <span className="chip">{level} <button onClick={() => setLevel('All')}>✕</button></span>}
            {category !== 'All' && <span className="chip">{category} <button onClick={() => setCategory('All')}>✕</button></span>}
            {access !== 'All' && <span className="chip">{access} <button onClick={() => setAccess('All')}>✕</button></span>}
            <button className="chip chip-clear" onClick={clearAll}>Clear all</button>
          </div>
        )}

        {/* ── Grid ── */}
        {loading ? (
          <div className="courses-loading">
            {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton-card" />)}
          </div>
        ) : filtered.length > 0 ? (
          <div className="student-grid">
            {filtered.map((course) => {
              const accessLabel = normalizeAccess(course.accessType);
              return (
                <div key={course._id} className="student-card">
                  <div className="card-image-wrapper">
                    {course.image
                      ? <img src={`${BACKEND_URL}${course.image}`} alt={course.title} className="course-img" />
                      : <div className="course-img-placeholder">{course.subject?.substring(0,2).toUpperCase()||'NA'}</div>
                    }
                    <div className="card-img-overlay">
                      <span className="overlay-view-btn">View Course →</span>
                    </div>
                    <div className="card-tags">
                      <span className="lang-tag">{course.subject}</span>
                      {accessLabel !== 'free' && (
                        <span className={`access-tag access-${accessLabel}`}>
                          {accessLabel === 'paid' ? `₹${course.price||0}` : 'Approval'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="card-content">
                    <div className="card-meta">
                      <span className="level-badge-small">{course.level||'Beginner'}</span>
                      <span className="cat-badge-small">{course.category}</span>
                      <span className={`access-badge-small access-${accessLabel}`}>
                        {accessLabel === 'free' ? '🆓 Free' : accessLabel === 'paid' ? '💳 Paid' : '🔐 Approval'}
                      </span>
                    </div>
                    <h3>{course.title}</h3>
                    <p>{course.description?.substring(0, 85)}...</p>
                    <div className="card-footer">
                      <Link to={`/course/${course._id}`} className="enroll-btn">Enroll Now</Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-results">
            <div className="empty-icon">🔎</div>
            <h3>No courses found</h3>
            <p>Try adjusting your search or filters</p>
            <button className="empty-clear-btn" onClick={clearAll}>Clear all filters</button>
          </div>
        )}
      </div>
    </div>
  );
}