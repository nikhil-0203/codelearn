import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">CL</div>
        <span>CodeLearn</span>
      </div>

      <nav className="sidebar-nav">
        {/* ✅ Updated paths to match App.js sub-routes */}
        <NavLink 
          to="/admin/dashboard" 
          className={({isActive}) => isActive ? "nav-link active" : "nav-link"}
        >
          Dashboard
        </NavLink>
        
        <NavLink 
          to="/admin/create-course" 
          className={({isActive}) => isActive ? "nav-link active" : "nav-link"}
        >
          Create Course
        </NavLink>
      </nav>
      
      <div className="sidebar-footer">
        <p>Logged in as <b>Admin</b></p>
      </div>
    </aside>
  );
}