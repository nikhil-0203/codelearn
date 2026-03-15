import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/api';
import './Login.css';

export default function Login() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {

    e.preventDefault();
    setLoading(true);

    try {

      const res = await API.post('/auth/login', { email, password });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      if (res.data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }

      window.location.reload();

    } catch (err) {

      alert(err.response?.data?.message || "Invalid Email or Password");

    } finally {
      setLoading(false);
    }

  };

  return (

    <div className="auth-container">

      <div className="auth-card">

        <div className="auth-header">
          <h2>🎓 CodeLearn</h2>
          <p>Login to continue your learning journey</p>
        </div>

        <form onSubmit={handleLogin}>

          <div className="input-group">

            <label>Email Address</label>

            <input
              type="email"
              placeholder="name@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

          </div>

          <div className="input-group">

            <label>Password</label>

            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Authenticating..." : "Login"}
          </button>

        </form>

        <p className="auth-footer">
          Don't have an account?
          <Link to="/register"> Create New Account</Link>
        </p>

      </div>

    </div>

  );

}