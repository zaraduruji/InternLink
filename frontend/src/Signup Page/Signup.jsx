import React, { useState } from 'react';
import './Signup.css';
import { useNavigate } from 'react-router-dom';

const Signup = ({ setShowLoginModal, setShowSignupModal }) => {
  const navigate = useNavigate();
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
        localStorage.setItem('user', JSON.stringify(data.user));
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
        <p className='signup-agreement'>
          By clicking Continue to join or sign in, you agree to InternLink’s
          <a href="/user-agreement" target="_blank" rel="noopener noreferrer"> User Agreement</a>,
          <a href="/privacy-policy" target="_blank" rel="noopener noreferrer"> Privacy Policy</a>,
          and
          <a href="/cookie-policy" target="_blank" rel="noopener noreferrer"> Cookie Policy</a>.
        </p>
        <button type="submit" className='signup-button'>Agree & Join</button>
        <p className='signup-message'>Already on InternLink? <a href="#" onClick={handleLoginClick}>Log In</a></p>
      </form>
    </div>
  );
}

export default Signup;
