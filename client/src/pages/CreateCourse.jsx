import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';
import Sidebar from '../components/Sidebar';
import './CreateCourse.css';

export default function CreateCourse() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: 'Beginner',
    category: 'Academic',
    subject: '',
    accessType: 'free', // ✅ New field
    price: 0 // ✅ New field
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (image) data.append("image", image);

    try {
      await API.post('/courses', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert("Published successfully!");
      navigate('/admin/dashboard');
    } catch (err) {
      alert("Error publishing content. Please check permissions.");
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <div className="create-course-container">
          <div className="create-card">
            <div className="create-header">
              <h2>Upload College Content</h2>
              <p>Configure course access and details</p>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Thumbnail</label>
                <div className="image-upload-wrapper" onClick={() => document.getElementById('imageInput').click()}>
                  {preview ? <img src={preview} alt="Preview" /> : <span>Click to upload image</span>}
                  <input id="imageInput" type="file" hidden onChange={handleImageChange} />
                </div>
              </div>

              <div className="form-group">
                <label>Content Title</label>
                <input type="text" placeholder="e.g. Data Warehousing & Mining" required
                  onChange={(e) => setFormData({...formData, title: e.target.value})} />
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Access Type</label>
                  <select onChange={(e) => setFormData({...formData, accessType: e.target.value})}>
                    <option value="free">Free (Public)</option>
                    <option value="approval">Request Approval</option>
                    <option value="paid">Paid Access</option>
                  </select>
                </div>
                {formData.accessType === 'paid' && (
                  <div className="form-group flex-1">
                    <label>Price (₹)</label>
                    <input type="number" placeholder="Enter amount" 
                      onChange={(e) => setFormData({...formData, price: e.target.value})} />
                  </div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Category</label>
                  <select onChange={(e) => setFormData({...formData, category: e.target.value})}>
                    <option value="Academic">College Subject</option>
                    <option value="Coding">Coding Program</option>
                  </select>
                </div>
                <div className="form-group flex-1">
                  <label>Subject / Language</label>
                  <input type="text" placeholder="e.g. CSE, Java" required
                    onChange={(e) => setFormData({...formData, subject: e.target.value})} />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea placeholder="Enter subject details..." rows="4" required
                  onChange={(e) => setFormData({...formData, description: e.target.value})} />
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => navigate('/admin/dashboard')} className="cancel-btn">Cancel</button>
                <button type="submit" className="submit-btn">Publish Content</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}