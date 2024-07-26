import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../UserContext';
import './ProfileSetup.css';

const employmentTypes = ["Select one", "Full-time", "Part-time", "Contract", "Temporary", "Internship", "Volunteer", "Other"];

const ProfileJobTitle = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error('Error parsing user data from localStorage', error);
      return null;
    }
  });
  const updateUser = (newUserData) => {
    setUser(prevUser => {
      const updatedUser = { ...prevUser, ...newUserData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  const [jobTitle, setJobTitle] = useState(user ? user.jobTitle : '');
  const [companyName, setCompanyName] = useState(user ? user.companyName : '');
  const [employmentType, setEmploymentType] = useState(user ? user.employmentType : '');
  const [error, setError] = useState("");

  const handleSaveProfile = async (event) => {
    event.preventDefault();

    const profileData = {
      userId: user.id,
      jobTitle,
      companyName,
      employmentType
    };

    try {
      const response = await fetch('http://localhost:3000/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        const data = await response.json();
        updateUser(data.user);
        navigate("/congratulations"); // Redirect to the congratulations page
      } else {
        setError('Failed to save profile');
        console.log('Failed to save profile with status:', response.status);
      }
    } catch (error) {
      setError('An error occurred');
      console.log('An error occurred:', error);
    }
  };

  return (
    <div className='profile-setup-form'>
      <h2>Your profile helps you discover new people and opportunities</h2>
      <form onSubmit={handleSaveProfile}>
        <label>
          Most recent job title *
          <input
            type="text"
            placeholder="Enter job title..."
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            required
          />
        </label>
        <label>
          Employment type
          <select
            value={employmentType}
            onChange={(e) => setEmploymentType(e.target.value)}
            required
          >
            {employmentTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </label>
        <label>
          Most recent company *
          <input
            type="text"
            placeholder="Enter company name..."
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
          />
        </label>
        {error && <div className="error">{error}</div>}
        <button type="submit" className='profile-setup-button'>Finish</button>
      </form>
    </div>
  );
}

export default ProfileJobTitle;
