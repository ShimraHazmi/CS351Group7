import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiUser, FiClipboard, FiPhoneCall, FiUsers } from "react-icons/fi";
import { authAPI } from "../api/auth";
import "../css/login.css"; 

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation()
  const params = new URLSearchParams(location.search);
  const err = params.get("error");
  const hasSession = params.get("session") === true;
  const [checking, setChecking] = useState(true);

  // If already logged in (session cookie exists), skip this page
  useEffect(() => {
    let mounted = true;
    if (err || !hasSession) {
      setChecking(false);
      return; 
    }

    (async () => {
      try {
        const data = await authAPI.me();
        if (mounted && data?.ok) {
          localStorage.setItem("user", JSON.stringify(data.user));
          navigate("/dashboard", { replace: true });
          setChecking(false);
        }
      } finally {
        if (mounted) setChecking(false);
      }
    })();
    return () => { mounted = false; };
  }, [navigate, err]);

  const handleGoogleSignIn = () => {
    authAPI.login(`${window.location.origin}/dashboard`);
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
            <span>Sign in to continue engaging with your community</span>
          </div>

          {/* No email/password form anymore — OAuth only */}
          <div className="login-form" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {err && (
              <div
                className="error-message"
                style={{
                  background: "#fee2e2",
                  border: "1px solid #ef4444",
                  color: "#991b1b",
                  padding: 12,
                  borderRadius: 6,
                  marginBottom: 8,
                  fontSize: 14,
                }}
              >
                {err === "access_denied" ? "Login canceled." : `Login failed: ${err}`}
              </div>
            )}

            <button
              type="button"
              className="signin-btn"
              onClick={handleGoogleSignIn}
              disabled={checking}
            >
              {checking ? "Checking session…" : "Continue with Google"}
            </button>

            {/* GoogleOAuth */}
            <div className="googleauth">
              <small style={{ color: "#0369a1", fontSize: 12 }}>
                We use Google to securely sign you in. No passwords stored here.
              </small>
            </div>
          </div>
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

