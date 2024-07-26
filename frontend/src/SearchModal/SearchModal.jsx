import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import './SearchModal.css';

const SearchModal = ({ isOpen, onClose, darkMode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    if (searchTerm) {
      fetch(`http://localhost:3000/api/search?q=${searchTerm}`)
        .then(response => response.json())
        .then(data => {
          const combinedResults = [];

          if (selectedFilter === 'all' || selectedFilter === 'people') {
            combinedResults.push(...data.userResults.map(user => ({
              type: 'user',
              id: user.id,
              name: `${user.firstName} ${user.lastName}`,
              email: user.email,
              location: user.location,
              jobTitle: user.jobTitle,
              userProfilePicture: user.profilePicture || '/default-profile-pic.png'
            })));
          }

          setSearchResults(combinedResults);
        })
        .catch(error => console.error('Error fetching search results:', error));
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, selectedFilter]);

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className={`search-modal ${isOpen ? 'open' : ''} ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <div className="search-bar">
        <FontAwesomeIcon icon={faSearch} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="close-button" onClick={onClose}>
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
            <img src={result.userProfilePicture} alt={result.name || result.uploaderName} className="search-result-profile-pic" />
            <div className="search-result-info">
              {result.type === 'user' ? (
                <Link to={`/profile/${result.id}`} className="search-result-name" onClick={onClose}>{result.name}</Link>
              ) : (
                <span className="search-result-name">{result.name || result.uploaderName}</span>
              )}
              {result.jobTitle && <span className="search-result-job-title">{result.jobTitle}</span>}
              {result.location && <span className="search-result-location">{result.location}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchModal;
