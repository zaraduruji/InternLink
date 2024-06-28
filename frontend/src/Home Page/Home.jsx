// src/Home Page/Home.jsx

import React from 'react';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <header className="header">
        <h1>Welcome to InternLink</h1>
      </header>
      <div className="content">
        <aside className="sidebar">
          <p>Sidebar</p>
        </aside>
        <main className="main-content">
          <p>Welcome you have successfully logged in!</p>
        </main>
        <aside className="right-sidebar">
          <p>Right Sidebar</p>
        </aside>
      </div>
    </div>
  );
};

export default Home;
