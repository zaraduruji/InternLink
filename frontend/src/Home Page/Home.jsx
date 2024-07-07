import React, { useState, useEffect } from 'react';
import './Home.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faHome, faUserFriends, faBell, faPlusSquare, faUser, faEllipsisH, faAdjust, faBookmark, faThumbsUp, faComment, faTimes } from '@fortawesome/free-solid-svg-icons';
import logo from '/logo.png';
import StoryUpload from '../StoryUpload/StoryUpload';
import Stories from '../StoryDisplays/Stories';

const Home = () => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [jobListings, setJobListings] = useState([]);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');

  const toggleMore = () => {
    setIsMoreOpen(!isMoreOpen);
  };

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

  useEffect(() => {
    if (searchTerm) {
      const results = jobListings.filter(job =>
        (selectedFilter === 'all' || selectedFilter === 'people') && job.uploaderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (selectedFilter === 'all' || selectedFilter === 'jobs') && job.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (selectedFilter === 'all' || selectedFilter === 'companies') && job.companyName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, jobListings, selectedFilter]);

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
  };

  return (
    <div className={`home-container ${darkMode ? 'dark-mode' : 'light-mode'} ${searchModalOpen ? 'search-open' : ''}`}>
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
          <div className="nav-item" onClick={() => setSearchModalOpen(true)}>
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
          <Stories /> {/* Displaying stories */}
        </div>
        <StoryUpload /> {/* Uploading new stories */}

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

      {searchModalOpen && (
        <div className={`search-modal ${searchModalOpen ? 'open' : ''}`}>
          <div className="search-bar">
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="close-button" onClick={() => setSearchModalOpen(false)}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
          <div className="filter-buttons">
            <button onClick={() => handleFilterChange('all')} className={selectedFilter === 'all' ? 'active' : ''}>All</button>
            <button onClick={() => handleFilterChange('people')} className={selectedFilter === 'people' ? 'active' : ''}>People</button>
            <button onClick={() => handleFilterChange('posts')} className={selectedFilter === 'posts' ? 'active' : ''}>Posts</button>
            <button onClick={() => handleFilterChange('jobs')} className={selectedFilter === 'jobs' ? 'active' : ''}>Jobs</button>
            <button onClick={() => handleFilterChange('companies')} className={selectedFilter === 'companies' ? 'active' : ''}>Companies</button>
          </div>
          <div className="search-results">
            {searchResults.map((result, index) => (
              <div key={index} className="search-result">
                <img src={result.userProfilePicture} alt={result.uploaderName} className="search-result-profile-pic" />
                <div className="search-result-info">
                  <span className="search-result-name">{result.uploaderName}</span>
                  <span className="search-result-role">{result.role}</span>
                  <span className="search-result-company">{result.companyName}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
