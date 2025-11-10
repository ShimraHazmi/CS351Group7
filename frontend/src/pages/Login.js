import React from "react";
import { useNavigate } from "react-router-dom";
import { FiUser, FiClipboard, FiPhoneCall, FiUsers } from "react-icons/fi";
import "../login.css"; // your styling file

const Login = () => {
  const navigate = useNavigate();

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

          <form className="login-form">
            <label>Email</label>
            <input type="email" placeholder="name@example.com" />

            <div className="password-row">
              <label>Password</label>
              <a href="#">Forgot password?</a>
            </div>
            <input type="password" placeholder="Enter your password" />

            <button type="button" className="signin-btn" onClick={() => navigate("/dashboard")}>
              Sign in
            </button>

            <div className="signup-row">
              <p>Don't have an account?</p>
            </div>

            <button type="button" className="create-btn">
              Create an account
            </button>
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

