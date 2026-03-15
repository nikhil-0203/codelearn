import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));
  const [menuOpen, setMenuOpen] = useState(false);

  
  const avatarSrc = user?.avatar ? `${BACKEND_URL}${user.avatar}` : null;

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
    window.location.reload();
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="modern-navbar">
      <div className="nav-container">
        <div className="nav-left">
          <Link to="/" className="nav-logo">
            <span className="logo-icon">YB</span>
            <span className="logo-text">YBIT<span className="logo-accent">Learn</span></span>
          </Link>
        </div>

        <div className={`nav-right ${menuOpen ? "open" : ""}`}>
          <Link to="/" className={`nav-link ${isActive("/") ? "active" : ""}`}>Courses</Link>
          <Link to="/my-learning" className={`nav-link ${isActive("/my-learning") ? "active" : ""}`}>My Learning</Link>
          <Link to="/announcements" className={`nav-link ${isActive("/announcements") ? "active" : ""}`}>📢 Notices</Link>
          <Link to="/about" className={`nav-link ${isActive("/about") ? "active" : ""}`}>About</Link>

          {user?.role === "admin" && (
            <>
              <div className="nav-divider" />
              <Link to="/admin/dashboard" className={`nav-link admin-link ${isActive("/admin/dashboard") ? "active" : ""}`}>Dashboard</Link>
              <Link to="/admin/create-course" className={`nav-link admin-link ${isActive("/admin/create-course") ? "active" : ""}`}>+ Course</Link>
            </>
          )}

          <div className="nav-divider" />

          <div className="user-section">
            <Link to="/profile" className="user-avatar" title="My Profile">
              {avatarSrc
                ? <img src={avatarSrc} alt="avatar" className="nav-avatar-img" />
                : user?.name?.charAt(0).toUpperCase() || "U"
              }
            </Link>
            <div className="user-info">
              <span className="user-name">{user?.name || "User"}</span>
              <span className="user-role">{user?.role || "student"}</span>
            </div>
            <button onClick={logout} className="logout-btn-modern" title="Logout">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Logout
            </button>
          </div>
        </div>

        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          <span /><span /><span />
        </button>
      </div>
    </nav>
  );
}