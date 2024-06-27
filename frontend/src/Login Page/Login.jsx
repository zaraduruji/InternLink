// src/Login Page/Login.jsx

import "./Login.css";
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../UserContext";

function Login({ setShowLoginModal, setShowSignupModal }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { updateUser } = useContext(UserContext);
  const navigate = useNavigate();

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
        updateUser(loggedInUser);
        setShowLoginModal(false);
        navigate("/");
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
    setShowLoginModal(false);
    setShowSignupModal(true);
  };

  return (
    <div className="login-form">
      <h2>Log In to InternLink</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="login-button" disabled={loading}>Log In</button>
      </form>
      <p>No account? <a href="#" onClick={handleSignupClick}>Sign Up</a></p>
      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default Login;
