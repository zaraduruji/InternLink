// src/Home Page/Home.jsx

import React, { useState } from 'react';
import './Home.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faSearch, faUserFriends, faBell, faPlusSquare, faUser, faEllipsisH, faCog, faBookmark, faAdjust } from '@fortawesome/free-solid-svg-icons';
import logo from '../../public/logo.png';

const Home = () => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const toggleMore = () => {
    setIsMoreOpen(!isMoreOpen);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('light-mode');
  };

  return (
    <div className={`home-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <aside className="sidebar">
        <div className="logo-container">
          <img src={logo} alt="InternLink Logo" className="logo" />
          <span className="logo-text">InternLink</span>
        </div>
        <nav className="nav-menu">
          <div className="nav-item">
            <FontAwesomeIcon icon={faHome} className="nav-icon" />
            <span className="nav-text">Home</span>
          </div>
          <div className="nav-item">
            <FontAwesomeIcon icon={faSearch} className="nav-icon" />
            <span className="nav-text">Search</span>
          </div>
          <div className="nav-item">
            <FontAwesomeIcon icon={faUserFriends} className="nav-icon" />
            <span className="nav-text">Friends</span>
          </div>
          <div className="nav-item">
            <FontAwesomeIcon icon={faBell} className="nav-icon" />
            <span className="nav-text">Notifications</span>
          </div>
          <div className="nav-item">
            <FontAwesomeIcon icon={faPlusSquare} className="nav-icon" />
            <span className="nav-text">Create Post</span>
          </div>
          <div className="nav-item">
            <FontAwesomeIcon icon={faUser} className="nav-icon" />
            <span className="nav-text">Profile</span>
          </div>
          <div className="nav-item more" onClick={toggleMore}>
            <FontAwesomeIcon icon={faEllipsisH} className="nav-icon" />
            <span className="nav-text">More</span>
          </div>
          {isMoreOpen && (
            <div className="more-menu">
              <div className="more-item" onClick={toggleDarkMode}>
                <FontAwesomeIcon icon={faAdjust} className="more-icon" />
                <span className="more-text">Switch Appearance</span>
              </div>
              <div className="more-item">
                <FontAwesomeIcon icon={faBookmark} className="more-icon" />
                <span className="more-text">Saved</span>
              </div>
            </div>
          )}
        </nav>
      </aside>

      <main className="main-content">
        <div className="stories-lineup">
          <div className="story"></div>
          <div className="story"></div>
          <div className="story"></div>
          <div className="story"></div>
          <div className="story"></div>
        </div>

        <div className="posts-container">
          <div className="post">Post 1</div>
          <div className="post">Post 2</div>
          <div className="post">Post 3</div>
          <div className="post">Post 4</div>
          <div className="post">Post 5</div>
        </div>
      </main>

      <aside className="suggested-connections">
        <h2>Suggested Connections</h2>
        <div className="connection">Connection 1</div>
        <div className="connection">Connection 2</div>
        <div className="connection">Connection 3</div>
        <div className="connection">Connection 4</div>
      </aside>
    </div>
  );
};

export default Home;
