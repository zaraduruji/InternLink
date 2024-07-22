import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faThumbsUp, faComment } from '@fortawesome/free-solid-svg-icons';
import Stories from '../StoryDisplays/Stories';
import { UserContext } from '../UserContext';
import Sidebar from '../Sidebar/Sidebar';
import Notifications from '../Notifications Page/Notifications';

const Home = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [jobListings, setJobListings] = useState([]);
  const { user } = useContext(UserContext);
  const [showNotifications, setShowNotifications] = useState(false);


  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('light-mode');
  };

  useEffect(() => {
    fetch('http://localhost:3000/api/job-listings')
      .then(response => response.json())
      .then(data => setJobListings(data))
      .catch(error => console.error('Error fetching job listings:', error));
  }, []);

  return (
    <div className={`home-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <Sidebar toggleDarkMode={toggleDarkMode} darkMode={darkMode} />
      <main className="main-content">
        {/* Notifications bell */}
        <div className="notifications-bell" onClick={() => setShowNotifications(!showNotifications)}>
          <FontAwesomeIcon icon={faBell} />
        </div>

        {/* Notifications modal */}
        {showNotifications && (
          <Notifications onClose={() => setShowNotifications(false)} />
        )}

        <div className="stories-lineup">
          <Stories currentUser={user} />
        </div>
        <div className="posts-container">
          {jobListings.map((job, index) => (
            <div key={index} className="post">
              <div className="post-header">
                <img src={job.userProfilePicture} alt={job.uploaderName} className="post-profile-pic" />
                <div className="post-info">
                  <span className="post-user-name">{job.uploaderName}</span>
                  <span className="post-company-name">{job.companyName}</span>
                  <span className="post-timestamp">{new Date(job.timestamp).toLocaleString()}</span>
                </div>
              </div>
              <div className="post-description">{job.description}</div>
              {job.imageUrl && <img src={job.imageUrl} alt="Job" className="post-image" />}
              <div className="post-footer">
                <div className="post-actions">
                  <FontAwesomeIcon icon={faThumbsUp} className="post-action-icon" />
                  <span>{job.likeCount}</span>
                  <FontAwesomeIcon icon={faComment} className="post-action-icon" />
                </div>
                <div className="post-comments">
                  {job.comments.map((comment, index) => (
                    <div key={index} className="comment">
                      <span className="comment-content">{comment.content}</span>
                      <span className="comment-timestamp">{new Date(comment.timestamp).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
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
