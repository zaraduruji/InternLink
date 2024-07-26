// src/Login Page/Login.jsx

import "./Login.css";
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

function Login({ setShowLoginModal, setShowSignupModal }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  async function handleLogin(event) {
    event.preventDefault();
    if (!email || !password) {
      setError("Please fill in both fields");
      return;
    }
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password }),
        credentials: "include"
      });
      if (response.ok) {
        const data = await response.json();
        const loggedInUser = data.user;
        localStorage.setItem('user', JSON.stringify(loggedInUser));
        navigate("/home");
      } else {
        setError("Login failed");
      }
    } catch (error) {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  }

  const handleSignupClick = () => {
    setShowSignupModal(true);
  };

  return (
    <div className="login-modal-background">
      <div className="login-modal-content">
        <h2 className="login-title">Log In to InternLink</h2>
        <form onSubmit={handleLogin} className="login-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="login-input"
          />
          <div className="login-password-container">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`login-input login-password ${showPassword ? 'login-password-visible' : ''}`}
            />
            <span className="login-password-toggle-icon" onClick={togglePasswordVisibility}>
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
            </span>
          </div>
          <button type="submit" className="login-button" disabled={loading}>Log In</button>
        </form>
        <p className="login-signup-message">No account? <a href="#" onClick={handleSignupClick}>Sign Up</a></p>
        {error && <p className="login-error">{error}</p>}
      </div>
    </div>
  );
}

export default Login;
