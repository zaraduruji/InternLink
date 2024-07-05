// src/SearchModal/SearchModal.jsx

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import './SearchModal.css';

const SearchModal = ({ onClose, onSearch }) => {
  const [query, setQuery] = useState('');

  const handleInputChange = (event) => {
    const value = event.target.value;
    setQuery(value);
    onSearch(value);
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <div className="search-bar">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search..."
            value={query}
            onChange={handleInputChange}
          />
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="search-results">
          {/* Search results will be displayed in Home component */}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
