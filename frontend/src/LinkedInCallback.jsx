// src/components/LinkedInCallback.js
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';

const LinkedInCallback = () => {
  const location = useLocation();
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
    setUser((prevUser) => {
      const updatedUser = { ...prevUser, ...newUserData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  useEffect(() => {
    const fetchLinkedInData = async () => {
      const searchParams = new URLSearchParams(location.search);
      const code = searchParams.get('code');
      const state = searchParams.get('state');

      try {
        const response = await fetch(`http://localhost:3000/auth/linkedIn/callback?code=${code}&state=${state}`);
const data = await response.json();

if (data.success && data.profilePicture) {
  console.log(user.id, data);
  const response = await fetch('http://localhost:3000/uploadPicture', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId: user.id,
      profilePicture: data.profilePicture
    }),
  });

  const result = await response.json();
          updateUser({
            ...result
          });
          navigate('/profile'); // Redirect to profile page
        } else {
          console.error('LinkedIn authentication failed');
          navigate('/profile'); // Redirect to profile page even on failure
        }
      } catch (error) {
        console.error('Error fetching LinkedIn data:', error);
        navigate('/profile');
      }
    };

    fetchLinkedInData();
  }, []);

  return <div>Loading...</div>;
};

export default LinkedInCallback;
