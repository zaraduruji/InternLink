// src/Signup Page/Signup.jsx

import React, { useState, useContext } from 'react';
import './Signup.css';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../UserContext';

const Signup = ({ setShowLoginModal, setShowSignupModal }) => {
  const navigate = useNavigate();
  const { updateUser } = useContext(UserContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState("");

  async function handleSignup(event) {
    event.preventDefault();
    console.log('Signup initiated with email:', email);

    try {
      const response = await fetch('http://localhost:3000/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
        }),
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Signup successful:', data);
        updateUser(data.user);
        navigate("/profile-setup");
        if (data.error) {
          setError(data.error);
        }
      } else {
        setError('Signup failed');
        console.log('Signup failed with status:', response.status);
        const errorData = await response.json();
        console.log('Error details:', errorData);
      }

    } catch (error) {
      setError('An error occurred');
      console.log('An error occurred:', error);
    }
  }

  const handleLoginClick = () => {
    setShowSignupModal(false);
    setShowLoginModal(true);
  };

  return (
    <div className='signup-modal'>
      <h2 className='signup-title'>Make the most of your professional life</h2>
      <form onSubmit={handleSignup} className='signup-form'>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className='signup-input'
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className='signup-input'
        />
        {error && <div className="signup-error">{error}</div>}
        <button type="submit" className='signup-button'>Agree & Join</button>
        <p className='signup-message'>Already on InternLink? <a href="#" onClick={handleLoginClick}>Log In</a></p>
      </form>
    </div>
  );
}

export default Signup;
