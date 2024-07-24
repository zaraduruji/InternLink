// src/components/LinkedInCallback.js
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';

const LinkedInCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { updateUser } = useUser();

  useEffect(() => {
    const fetchLinkedInData = async () => {
      const searchParams = new URLSearchParams(location.search);
      const code = searchParams.get('code');
      const state = searchParams.get('state');

      try {
        const response = await fetch(`http://localhost:3000/auth/linkedIn/callback?code=${code}&state=${state}`);
        const data = await response.json();

        if (data.success) {
          // Update user profile with LinkedIn data
          updateUser({
            ...data.profile,
            profilePicture: `data:image/jpeg;base64,${data.profilePicture}`
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
  }, [location, navigate, updateUser]);

  return <div>Loading...</div>;
};

export default LinkedInCallback;
