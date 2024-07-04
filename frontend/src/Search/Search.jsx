// src/Search Page/Search.jsx

import React, { useState } from 'react';
import './Search.css';

const Search = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    const response = await fetch(`http://localhost:3000/api/search?q=${query}`);
    const data = await response.json();
    setResults(data);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <button className="close-button" onClick={onClose}>X</button>
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
        <div className="results-container">
          {results.map((result, index) => (
            <div key={index} className="result-item">
              <img src={result.userProfilePicture} alt={result.uploaderName} className="result-profile-pic" />
              <div className="result-info">
                <span className="result-name">{result.uploaderName}</span>
                <span className="result-role">{result.role}</span>
                <span className="result-company">{result.companyName}</span>
                <p className="result-description">{result.description}</p>
                {result.imageUrl && <img src={result.imageUrl} alt="Job" className="result-image" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Search;
