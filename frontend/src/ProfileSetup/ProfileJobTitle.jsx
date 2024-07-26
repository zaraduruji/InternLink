import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../UserContext';
import './ProfileSetup.css';

const employmentTypes = ["Select one", "Full-time", "Part-time", "Contract", "Temporary", "Internship", "Volunteer", "Other"];
const years = Array.from(new Array(50), (val, index) => new Date().getFullYear() - index); // Array of last 50 years for dropdown

const ProfileJobTitle = () => {
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
  const updateUser = (newUserData) => {
    setUser(prevUser => {
      const updatedUser = { ...prevUser, ...newUserData };
      // Store updated user in localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };
  const [jobTitle, setJobTitle] = useState(user ? user.jobTitle : '');
  const [companyName, setCompanyName] = useState(user ? user.companyName : '');
  const [employmentType, setEmploymentType] = useState(user ? user.employmentType : '');
  const [isStudent, setIsStudent] = useState(false);
  const [school, setSchool] = useState('');
  const [startYear, setStartYear] = useState('');
  const [endYear, setEndYear] = useState('');
  const [isOver16, setIsOver16] = useState(true);
  const [dob, setDob] = useState({ month: '', day: '', year: '' });
  const [error, setError] = useState("");

  const handleSaveProfile = async (event) => {
    event.preventDefault();

    const profileData = {
      userId: user.id,
      isStudent,
      isOver16,
      jobTitle: isStudent ? '' : jobTitle,
      companyName: isStudent ? '' : companyName,
      employmentType: isStudent ? '' : employmentType,
      school: isStudent ? school : '',
      startYear: isStudent ? startYear : '',
      endYear: isStudent ? endYear : '',
      dob: isOver16 ? null : dob
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
        navigate("/home"); // Redirect to the home page
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
        {!isStudent && (
          <>
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
          </>
        )}
        <label>
          I'm a student
          <input
            type="checkbox"
            checked={isStudent}
            onChange={(e) => setIsStudent(e.target.checked)}
          />
        </label>
        {isStudent && (
          <>
            <label>
              School or College/University *
              <input
                type="text"
                placeholder="Enter school name..."
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                required
              />
            </label>
            <label>
              Start year *
              <select
                value={startYear}
                onChange={(e) => setStartYear(e.target.value)}
                required
              >
                <option value="">-</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </label>
            <label>
              End year (or expected) *
              <select
                value={endYear}
                onChange={(e) => setEndYear(e.target.value)}
                required
              >
                <option value="">-</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </label>
            <label>
              I'm over 16
              <input
                type="checkbox"
                checked={isOver16}
                onChange={(e) => setIsOver16(e.target.checked)}
              />
            </label>
            {!isOver16 && (
              <>
                <label>
                  Date of birth
                  <div className="dob-container">
                    <select
                      value={dob.month}
                      onChange={(e) => setDob({ ...dob, month: e.target.value })}
                      required
                    >
                      <option value="">Month</option>
                      {[...Array(12).keys()].map(i => (
                        <option key={i} value={i + 1}>{i + 1}</option>
                      ))}
                    </select>
                    <select
                      value={dob.day}
                      onChange={(e) => setDob({ ...dob, day: e.target.value })}
                      required
                    >
                      <option value="">Day</option>
                      {[...Array(31).keys()].map(i => (
                        <option key={i} value={i + 1}>{i + 1}</option>
                      ))}
                    </select>
                    <select
                      value={dob.year}
                      onChange={(e) => setDob({ ...dob, year: e.target.value })}
                      required
                    >
                      <option value="">Year</option>
                      {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </label>
              </>
            )}
          </>
        )}
        {error && <div className="error">{error}</div>}
        <button type="submit" className='profile-setup-button'>Finish</button>
      </form>
    </div>
  );
}

export default ProfileJobTitle;
