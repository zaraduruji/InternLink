// src/ProfileSetup/ProfileName.jsx

import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../UserContext';
import './ProfileSetup.css';

const ProfileName = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useContext(UserContext);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState("");

  const handleSaveName = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch('http://localhost:3000/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          firstName,
          lastName,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        updateUser(data.user);
        navigate("/profile-location");
      } else {
        setError('Failed to save name');
      }
    } catch (error) {
      setError('An error occurred');
    }
  };

  return (
    <div className='profile-setup-form'>
      <h2>Make the most of your professional life</h2>
      <form onSubmit={handleSaveName}>
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
        {error && <div className="error">{error}</div>}
        <button type="submit" className='profile-setup-button'>Continue</button>
      </form>
    </div>
  );
}

export default ProfileName;
