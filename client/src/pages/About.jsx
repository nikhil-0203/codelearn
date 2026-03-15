import React from 'react';
import { Link } from 'react-router-dom';
import './About.css';

const STATS = [
  { value: '500+', label: 'Students Enrolled' },
  { value: '30+',  label: 'Courses Available' },
  { value: '15+',  label: 'Expert Instructors' },
  { value: '95%',  label: 'Satisfaction Rate' },
];

const FEATURES = [
  { icon: '🎬', title: 'Video Lectures',     desc: 'High-quality recorded lectures you can rewatch anytime at your own pace.' },
  { icon: '📄', title: 'PDF Notes',          desc: 'Downloadable notes for every lesson so you can study offline too.' },
  { icon: '📊', title: 'Progress Tracking',  desc: 'Real-time progress saved to your account — pick up right where you left off.' },
  { icon: '💳', title: 'Flexible Access',    desc: 'Free, approval-based, and paid courses to suit every type of learner.' },
  { icon: '🏆', title: 'Certificates',       desc: 'Earn certificates on course completion to showcase your skills.' },
  { icon: '📱', title: 'Learn Anywhere',     desc: 'Fully responsive — learn from your laptop, tablet, or phone.' },
];

const TEAM = [
  { name: 'Nikhil Fendre',      role: 'Full Stack Developer',  avatar: 'N', color: '#2563eb' },
  { name: 'Harshad Naik',       role: 'Full Stack Developer',  avatar: 'H', color: '#7c3aed' },
  { name: 'Utkarsh Parulekar',  role: 'Frontend Developer',    avatar: 'U', color: '#0891b2' },
  { name: 'Atharv Satardekar',  role: 'Backend Developer',     avatar: 'A', color: '#059669' },
];

export default function About() {
  return (
    <div className="about-page">

      {/* ── Hero ── */}
      <section className="about-hero">
        <div className="about-hero-inner">
          <span className="about-badge">🎓 About YBITLearn</span>
          <h1>Empowering Future <span>Engineers</span></h1>
          <p>YBITLearn is a professional e-learning platform built by students, for students — designed to bridge the gap between college education and real-world tech skills.</p>
          <div className="hero-cta-row">
            <Link to="/" className="hero-cta-primary">Explore Courses →</Link>
            <Link to="/register" className="hero-cta-secondary">Join Free</Link>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="about-stats">
        {STATS.map((s, i) => (
          <div key={i} className="about-stat">
            <div className="about-stat-value">{s.value}</div>
            <div className="about-stat-label">{s.label}</div>
          </div>
        ))}
      </section>

      {/* ── Mission ── */}
      <section className="about-section">
        <div className="about-section-inner">
          <div className="about-mission-text">
            <span className="section-badge">Our Mission</span>
            <h2>Quality Education for Every Student</h2>
            <p>We believe every student deserves access to quality learning resources regardless of their financial background. That's why we offer a mix of free, approval-based, and affordable paid courses — so no student is left behind.</p>
            <p>Our platform is built with modern technologies and designed to make learning engaging, measurable, and rewarding.</p>
            <div className="mission-points">
              <div className="mp-item"><span>✓</span> Structured curriculum from beginner to advanced</div>
              <div className="mp-item"><span>✓</span> Learn coding, academics, and general skills</div>
              <div className="mp-item"><span>✓</span> Track your growth with real-time analytics</div>
            </div>
          </div>
          <div className="about-mission-visual">
            <div className="visual-card vc-1"><div className="vc-icon">🚀</div><div className="vc-text">Launch your career</div></div>
            <div className="visual-card vc-2"><div className="vc-icon">💡</div><div className="vc-text">Learn by doing</div></div>
            <div className="visual-card vc-3"><div className="vc-icon">🎯</div><div className="vc-text">Achieve your goals</div></div>
            <div className="visual-card vc-4"><div className="vc-icon">🏅</div><div className="vc-text">Get certified</div></div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="about-section bg-light">
        <div className="about-section-inner centered">
          <span className="section-badge">Platform Features</span>
          <h2>Everything You Need to Succeed</h2>
          <p className="section-sub">All the tools and resources packed into one clean, easy-to-use platform.</p>
          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="about-section">
        <div className="about-section-inner centered">
          <span className="section-badge">Our Team</span>
          <h2>Built with Passion</h2>
          <p className="section-sub">A dedicated team of developers and educators who believe in the power of learning.</p>
          <div className="team-grid">
            {TEAM.map((t, i) => (
              <div key={i} className="team-card">
                <div className="team-avatar" style={{ background: t.color }}>{t.avatar}</div>
                <h3>{t.name}</h3>
                <p>{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="about-cta-banner">
        <h2>Ready to Start Learning?</h2>
        <p>Join hundreds of students already growing their skills on YBITLearn.</p>
        <div className="hero-cta-row">
          <Link to="/register" className="hero-cta-primary">Get Started Free →</Link>
          <Link to="/" className="hero-cta-white">Browse Courses</Link>
        </div>
      </section>

    </div>
  );
}