// src/Signup Page/Signup.jsx

import React, { useState } from 'react';
import './Signup.css';
import { useNavigate } from 'react-router-dom';

const Signup = ({ setShowLoginModal, setShowSignupModal }) => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState("");

  async function handleSignup(event) {
    event.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          email,
          password,
          confirmPassword,
          role
        }),
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data)
        navigate("/projects");

        if (data.error) {
          setError(data.error);
        }
      } else {
        setError('Signup failed');
      }

    } catch (error) {
      setError('An error occurred');
    }
  }

  function navigateToLogin() {
    navigate("/login");
  }

  return (
    <div className='signup-form'>
      <h2>Sign Up for InternLink</h2>
      <form onSubmit={handleSignup}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
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
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <select name='role' onChange={(e) => setRole(e.target.value)} required>
          <option value="">Select Role</option>
          <option value="employee">Employee/Recruiter</option>
          <option value="student">Student</option>
        </select>
        {error && <div className="error">{error}</div>}
        <button type="submit" className='signup-button'>Sign Up</button>
        <p>Already have an account? <a className='login-link' onClick={navigateToLogin}>Login</a></p>
      </form>
  </div>
  );
}

export default Signup;
