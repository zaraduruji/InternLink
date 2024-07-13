import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Friends.css';
import { UserContext } from '../UserContext';
import Sidebar from '../Sidebar/Sidebar';
import SearchModal from '../SearchModal/SearchModal';

const Friends = () => {
  const { user } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState('growConnections');

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="friends-page">
      <Sidebar />
      <SearchModal />
      <div className="friends-content">
        <div className="friends-tabs">
          <div className={`tab ${activeTab === 'growConnections' ? 'active' : ''}`} onClick={() => handleTabClick('growConnections')}>
            Grow Connections
          </div>
          <div className={`tab ${activeTab === 'suggestedConnections' ? 'active' : ''}`} onClick={() => handleTabClick('suggestedConnections')}>
            Suggested Connections
          </div>
        </div>
        <div className="friends-details">
          {activeTab === 'growConnections' ? (
            <div className="grow-connections-section">
              <h3>Friend Requests</h3>
              {/* Add your code for handling friend requests here */}
            </div>
          ) : (
            <div className="suggested-connections-section">
              <h3>Suggested Connections</h3>
              {/* Add your code for handling suggested connections here */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Friends;
