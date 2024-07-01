// src/Home Page/Home.jsx

import React from 'react';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <header className="home-header">
        <div className="logo">InternLink</div>
        <div className="search-bar">
          <input type="text" placeholder="Search" />
        </div>
        <div className="notifications">
          <span className="notification-icon">🔔</span>
        </div>
      </header>

      <div className="stories-lineup">
        <div className="story"></div>
        <div className="story"></div>
        <div className="story"></div>
        <div className="story"></div>
        <div className="story"></div>
      </div>

      <div className="listings">
        <div className="listing">Job/Internship 1</div>
        <div className="listing">Job/Internship 2</div>
        <div className="listing">Job/Internship 3</div>
        <div className="listing">Job/Internship 4</div>
        <div className="listing">Job/Internship 5</div>
      </div>

      <nav className="navbar">
        <span className="nav-icon">🏠</span>
        <span className="nav-icon">👥</span>
        <span className="nav-icon">👤</span>
      </nav>
    </div>
  );
};

export default Home;
