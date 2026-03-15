import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import API from '../api/api';
import './CreateModule.css';

export default function CreateModule() {
  const { courseId } = useParams(); // ✅ matches route: /admin/create-module/:courseId
  const [title, setTitle] = useState('');
  const [order, setOrder] = useState(1);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // ✅ Correct endpoint: POST /modules with courseId in body
      await API.post('/modules', { title, courseId, order });
      alert("Module created successfully!");
      navigate(`/admin/manage-course/${courseId}`);
    } catch (err) {
      alert("Failed to create module. Check your permissions.");
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <div className="form-wrapper">
          <div className="form-card modern-light">
            <header className="form-header">
              <h2>Add New Module</h2>
              <p>Create a new section for your curriculum</p>
            </header>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Module Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Getting Started with Node.js" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required 
                />
              </div>
              <div className="input-group">
                <label>Module Order (Sequence)</label>
                <input 
                  type="number" 
                  min="1"
                  value={order}
                  onChange={(e) => setOrder(Number(e.target.value))}
                />
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => navigate(-1)} className="cancel-btn">Cancel</button>
                <button type="submit" className="submit-btn">Create Module</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}