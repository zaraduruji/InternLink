// src/ProfileSetup/ProfileLocation.jsx

import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../UserContext';
import './ProfileSetup.css';

const ProfileLocation = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    // Initialize user state from localStorage
    const storedUser = localStorage.getItem('user');
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error('Error parsing user data from localStorage', error);
      return null;
    }
  });
  const [location, setLocation] = useState(user ? user.location : '');
  const [error, setError] = useState("");

  useEffect(() => {
    if (window.google) {
      const autocomplete = new window.google.maps.places.Autocomplete(document.getElementById('location-input'));
      autocomplete.setFields(['address_components', 'formatted_address']);
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        setLocation(place.formatted_address);
      });
    }
  }, []);
  const updateUser = (newUserData) => {
    setUser(prevUser => {
      const updatedUser = { ...prevUser, ...newUserData };
      // Store updated user in localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };
  const handleSaveLocation = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch('http://localhost:3000/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          location,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        updateUser(data.user);
        navigate("/profile-job-title");
      } else {
        setError('Failed to save location');
        console.log('Failed to save location with status:', response.status);
      }
    } catch (error) {
      setError('An error occurred');
      console.log('An error occurred:', error);
    }
  };

  return (
    <div className='profile-setup-form'>
      <h2>Welcome! What's your location?</h2>
      <form onSubmit={handleSaveLocation}>
        <input
          id="location-input"
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />
        {error && <div className="error">{error}</div>}
        <button type="submit" className='profile-setup-button'>Next</button>
      </form>
    </div>
  );
}

export default ProfileLocation;
