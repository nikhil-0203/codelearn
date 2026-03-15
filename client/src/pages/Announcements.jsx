import React, { useEffect, useState } from 'react';
import API from '../api/api';
import './Announcements.css';

const TYPE_CONFIG = {
  info:    { icon: '📢', label: 'Info',    color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
  success: { icon: '✅', label: 'Update',  color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  warning: { icon: '⚠️', label: 'Warning', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  urgent:  { icon: '🚨', label: 'Urgent',  color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
};

const timeAgo = (date) => {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60)   return 'just now';
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
};

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [filter, setFilter]               = useState('all');

  useEffect(() => {
    API.get('/announcements')
      .then(res => { setAnnouncements(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = filter === 'all'
    ? announcements
    : filter === 'pinned'
      ? announcements.filter(a => a.pinned)
      : announcements.filter(a => a.type === filter);

  const pinnedCount = announcements.filter(a => a.pinned).length;

  return (
    <div className="ann-page">
      <div className="ann-hero">
        <h1>📢 Announcements</h1>
        <p>Stay up to date with the latest news and updates from your institution.</p>
      </div>

      <div className="ann-body">
        {/* Filter tabs */}
        <div className="ann-filters">
          {['all', 'pinned', 'urgent', 'info', 'success', 'warning'].map(f => (
            <button
              key={f}
              className={`ann-filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? `All (${announcements.length})`
                : f === 'pinned' ? `📌 Pinned (${pinnedCount})`
                : `${TYPE_CONFIG[f]?.icon} ${TYPE_CONFIG[f]?.label}`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="ann-loading">
            {[1,2,3].map(i => <div key={i} className="ann-skeleton" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="ann-empty">
            <div className="ann-empty-icon">📭</div>
            <h3>No announcements</h3>
            <p>Nothing here yet. Check back later.</p>
          </div>
        ) : (
          <div className="ann-list">
            {filtered.map(ann => {
              const cfg = TYPE_CONFIG[ann.type] || TYPE_CONFIG.info;
              return (
                <div
                  key={ann._id}
                  className={`ann-card ${ann.pinned ? 'ann-pinned' : ''}`}
                  style={{ borderLeft: `4px solid ${cfg.color}` }}
                >
                  <div className="ann-card-header">
                    <div className="ann-card-left">
                      <span className="ann-type-badge" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                        {cfg.icon} {cfg.label}
                      </span>
                      {ann.pinned && <span className="ann-pin-badge">📌 Pinned</span>}
                    </div>
                    <div className="ann-card-meta">
                      <span className="ann-author">By {ann.createdBy?.name || 'Admin'}</span>
                      <span className="ann-time">{timeAgo(ann.createdAt)}</span>
                    </div>
                  </div>
                  <h3 className="ann-title">{ann.title}</h3>
                  <p className="ann-content">{ann.content}</p>
                  <div className="ann-date">
                    {new Date(ann.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}