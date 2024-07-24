// src/UserContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the context
export const UserContext = createContext();

// Custom hook to use the UserContext
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

// UserProvider component
export const UserProvider = ({ children }) => {
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

  // Update user function
  const updateUser = (newUserData) => {
    setUser(prevUser => {
      const updatedUser = { ...prevUser, ...newUserData };
      // Store updated user in localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  // Clear user function (for logout)
  const clearUser = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // Effect to update localStorage when user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }, [user]);

  // Value object to be provided by the context
  const value = {
    user,
    updateUser,
    clearUser
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
