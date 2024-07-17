import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ApolloProvider, InMemoryCache, ApolloClient } from '@apollo/client';
import Welcome from './Welcome Page/welcome';
import Login from './Login Page/Login';
import Signup from './Signup Page/Signup';
import { UserContext } from './UserContext';
import Home from './Home Page/Home';
import ProfileName from './ProfileSetup/ProfileName';
import ProfileLocation from './ProfileSetup/ProfileLocation';
import ProfileJobTitle from './ProfileSetup/ProfileJobTitle';
import Profile from './Profile Page/Profile';
import ProfileView from './Profile Page/ProfileView';
import Friends from './Friends Page/Friends';
import NotificationCenter from './Notifications/NotificationCenter';

const client = new ApolloClient({
    uri: 'http://localhost:4000/graphql', // Update port number if changed
    cache: new InMemoryCache(),
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

  const updateUser = (newUser) => {
    setUser(newUser);
  };

  useEffect(() => {
    localStorage.setItem('user', JSON.stringify(user));
  }, [user]);

  return (
    <ApolloProvider client={client}>
      <UserContext.Provider value={{ user, updateUser }}>
        <Router>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/home" element={<Home />} />
            <Route path="/profile-setup" element={<ProfileName />} />
            <Route path="/profile-location" element={<ProfileLocation />} />
            <Route path="/profile-job-title" element={<ProfileJobTitle />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:id" element={<ProfileView />} />
            <Route path="/friends" element={<Friends />} />
            <Route path="/notifications" element={<NotificationCenter />} />
          </Routes>
        </Router>
      </UserContext.Provider>
    </ApolloProvider>
  );
}

export default App;
