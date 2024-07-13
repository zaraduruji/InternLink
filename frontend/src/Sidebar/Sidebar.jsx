import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faSearch, faUserFriends, faBell, faPlusSquare, faUser, faEllipsisH, faAdjust, faBookmark } from '@fortawesome/free-solid-svg-icons';
import './Sidebar.css';
import logo from '/logo.png';
import SearchModal from '../SearchModal/SearchModal';
import { UserContext } from '../UserContext';

const Sidebar = ({ toggleDarkMode, darkMode }) => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const { user } = useContext(UserContext);

  const toggleMore = () => {
    setIsMoreOpen(!isMoreOpen);
  };

  return (
    <>
      <aside className="sidebar">
        <div className="logo-container">
          <img src={logo} alt="InternLink Logo" className="logo" />
          <span className="logo-text">InternLink</span>
        </div>
        <nav className="nav-menu">
          <Link to="/home" className="nav-item">
            <FontAwesomeIcon icon={faHome} className="nav-icon" />
            <span className="nav-text">Home</span>
          </Link>
          <div className="nav-item" onClick={() => setSearchModalOpen(true)}>
            <FontAwesomeIcon icon={faSearch} className="nav-icon" />
            <span className="nav-text">Search</span>
          </div>
          <Link to="/friends" className="nav-item">
            <FontAwesomeIcon icon={faUserFriends} className="nav-icon" />
            <span className="nav-text">Friends</span>
          </Link>
          <Link to="/notifications" className="nav-item">
            <FontAwesomeIcon icon={faBell} className="nav-icon" />
            <span className="nav-text">Notifications</span>
          </Link>
          <Link to="/create-post" className="nav-item">
            <FontAwesomeIcon icon={faPlusSquare} className="nav-icon" />
            <span className="nav-text">Create Post</span>
          </Link>
          <Link to={`/profile`} className="nav-item">
            <FontAwesomeIcon icon={faUser} className="nav-icon" />
            <span className="nav-text">Profile</span>
          </Link>
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
      <SearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} darkMode={darkMode} />
    </>
  );
};

export default Sidebar;
