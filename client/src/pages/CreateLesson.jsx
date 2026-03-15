import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/api';
import './AdminForms.css';

export default function CreateLesson() {
  const { moduleId } = useParams(); // ✅ This is now a real moduleId
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const [moduleName, setModuleName] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    videoUrl: '',
    content: '',
    order: 1
  });

  // Fetch module name for display
  useEffect(() => {
    // We can't directly GET /modules/:moduleId but we can show the ID for now
    // If you add a GET /modules/single/:id route later, use it here
    setModuleName(moduleId);
  }, [moduleId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append('title', formData.title);
    data.append('videoUrl', formData.videoUrl);
    data.append('content', formData.content);
    data.append('order', formData.order);
    data.append('module', moduleId); // ✅ Now correctly a moduleId
    if (pdfFile) data.append('notesPdf', pdfFile);

    try {
      await API.post('/lessons', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert("Lecture published successfully!");
      navigate(-1); // Go back to ManageCourse
    } catch (err) {
      alert(err.response?.data?.message || "Upload failed. Ensure file is a PDF.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <form className="admin-form" onSubmit={handleSubmit}>
        <h2>Add New Lecture</h2>
        <p className="form-subtitle">Adding lecture to module</p>
        
        <div className="input-group">
          <label>Lecture Title</label>
          <input 
            type="text" 
            required 
            placeholder="e.g. Introduction to Java"
            onChange={(e) => setFormData({...formData, title: e.target.value})} 
          />
        </div>

        <div className="input-row">
          <div className="input-group">
            <label>Sequence Number (Order)</label>
            <input 
              type="number" 
              min="1" 
              value={formData.order} 
              onChange={(e) => setFormData({...formData, order: e.target.value})} 
            />
          </div>
        </div>

        <div className="input-group">
          <label>Video Lecture URL</label>
          <input 
            type="text" 
            required 
            placeholder="Paste YouTube or Vimeo link"
            onChange={(e) => setFormData({...formData, videoUrl: e.target.value})} 
          />
        </div>

        <div className="input-group">
          <label>Upload PDF Notes (Optional)</label>
          <input 
            type="file" 
            accept="application/pdf" 
            onChange={(e) => setPdfFile(e.target.files[0])} 
          />
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Processing..." : "Publish Lecture"}
        </button>
      </form>
    </div>
  );
}