import React, { createContext, useContext, useState, useEffect } from 'react';


export const UserContext = createContext();


export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};


export const UserProvider = ({ children }) => {
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


  const clearUser = () => {
    setUser(null);
    localStorage.removeItem('user');
  };


  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }, [user]);


  const value = {
    user,
    updateUser,
    clearUser
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
