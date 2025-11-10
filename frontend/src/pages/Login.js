import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiUser, FiClipboard, FiPhoneCall, FiUsers } from "react-icons/fi";
import { authAPI } from "../api/auth";
import "../login.css"; 

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log("Attempting login with:", email);

    try {
      const result = await authAPI.login(email, password);
      
      if (result.success) {
        console.log("Login successful!");
        localStorage.setItem('user', JSON.stringify(result.user));
        navigate("/dashboard");
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Unable to connect to server. Make sure backend is running on port 8000.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Left side - Form */}
      <div className="login-left">
        <div className="login-card">
          <div className="login-header">
            <FiUser size={24} className="login-icon" />
            <h2>CivicConnect</h2>
            <p>Welcome back</p>
            <span>Sign in to your account to continue engaging with your community</span>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <label>Email</label>
            <input 
              type="email" 
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />

            <div className="password-row">
              <label>Password</label>
              <button type="button" onClick={() => console.log("Forgot password (not implemented)")}>
                Forgot password?
              </button>
            </div>
            <input 
              type="password" 
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />

            {error && (
              <div className="error-message" style={{
                background: '#fee2e2',
                border: '1px solid #ef4444',
                color: '#991b1b',
                padding: '12px',
                borderRadius: '6px',
                marginBottom: '16px',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}

            <button type="submit" className="signin-btn" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>

            <div className="signup-row">
              <p>Don't have an account?</p>
            </div>

            <button type="button" className="create-btn" onClick={() => console.log("Create account (not implemented)")}>
              Create an account
            </button>

            {/* TESTING FIX ME*/}
            <div style={{
              marginTop: '20px',
              padding: '12px',
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '6px',
              textAlign: 'center'
            }}>
              <small style={{color: '#0369a1', fontSize: '12px'}}>
                Test: testing@gmail.com / testing123
              </small>
            </div>
          </form>
        </div>
      </div>

      {/* Right side - Image and Text */}
      <div className="login-right">
        <div className="overlay-content">
          <h2>Empower Your Voice in Democracy</h2>
          <p>
            Join thousands of citizens making their communities better through
            active participation, transparent governance, and meaningful dialogue.
          </p>

          <div className="info-item">
            <FiClipboard size={20} />
            <div>
              <h3>Vote on Local Issues</h3>
              <p>Participate in polls and initiatives that shape your community</p>
            </div>
          </div>

          <div className="info-item">
            <FiPhoneCall size={20} />
            <div>
              <h3>Connect with Representatives</h3>
              <p>Direct communication with elected officials and civic leaders</p>
            </div>
          </div>

          <div className="info-item">
            <FiUsers size={20} />
            <div>
              <h3>Join Community Discussions</h3>
              <p>Engage in thoughtful dialogue about what matters most</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

