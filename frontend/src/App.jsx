import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import Welcome from './Welcome Page/welcome';
import Login from './Login Page/Login';
import Signup from './Signup Page/Signup';
import { UserContext } from './UserContext';
import { PostProvider } from './PostContext';
import Home from './Home Page/Home';
import ProfileName from './ProfileSetup/ProfileName';
import ProfileLocation from './ProfileSetup/ProfileLocation';
import ProfileJobTitle from './ProfileSetup/ProfileJobTitle';
import Profile from './Profile Page/Profile';
import ProfileView from './Profile Page/ProfileView';
import Friends from './Friends Page/Friends';
import Notifications from './Notifications Page/Notifications.jsx';
import CreatePost from './CreatePost/CreatePost.jsx';
import LinkedInCallback from './LinkedInCallback.jsx';
import Congratulations from './Congratulations Page/Congratulations.jsx';

const client = new ApolloClient({
  uri: 'http://localhost:3000/graphql',
  cache: new InMemoryCache()
});

function App() {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error('Error parsing user data from localStorage', error);
      return null;
    }
  });

  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);

  const updateUser = (newUser) => {
    setUser(prevUser => ({ ...prevUser, ...newUser }));
  };

  const openCreatePostModal = () => setIsCreatePostModalOpen(true);
  const closeCreatePostModal = () => setIsCreatePostModalOpen(false);

  useEffect(() => {
    localStorage.setItem('user', JSON.stringify(user));
  }, [user]);

  return (
    <ApolloProvider client={client}>
          <Router>
            <CreatePost isOpen={isCreatePostModalOpen} onClose={closeCreatePostModal} />
            <Routes>
              <Route path="/" element={<Welcome />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/home" element={<Home openCreatePostModal={openCreatePostModal} />} />
              <Route path="/profile-setup" element={<ProfileName />} />
              <Route path="/profile-location" element={<ProfileLocation />} />
              <Route path="/profile-job-title" element={<ProfileJobTitle />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/:id" element={<ProfileView />} />
              <Route path="/friends" element={<Friends />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/auth/linkedin/callback" element={<LinkedInCallback />} />
              <Route path="/congratulations" element={<Congratulations />} />
            </Routes>
          </Router>
    </ApolloProvider>
  );
}

export default App;
