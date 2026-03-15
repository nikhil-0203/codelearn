import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/api';
import './Login.css';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/auth/register', formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Join the student community today</p>
        </div>
        
        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Full Name</label>
            <input 
              type="text" 
              placeholder="Nikhil Fendre" 
              required 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
            />
          </div>
          <div className="input-group">
            <label>Email Address</label>
            <input 
              type="email" 
              placeholder="name@college.com" 
              required 
              onChange={(e) => setFormData({...formData, email: e.target.value})} 
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              required 
              onChange={(e) => setFormData({...formData, password: e.target.value})} 
            />
          </div>
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Creating Account..." : "Create Free Account"}
          </button>
        </form>
        <p className="auth-footer">
          Already a student? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}