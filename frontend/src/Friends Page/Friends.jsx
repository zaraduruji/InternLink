import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Friends.css';
import { UserContext } from '../UserContext';
import Sidebar from '../Sidebar/Sidebar';
import SearchModal from '../SearchModal/SearchModal';

const Friends = () => {
  const { user } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState('growConnections');
  const [friendRequests, setFriendRequests] = useState([]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  useEffect(() => {
    fetchFriendRequests();
  }, []);

  const fetchFriendRequests = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/friend-requests/${user.id}`);
      const data = await response.json();
      setFriendRequests(data);
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const response = await fetch('http://localhost:3000/api/friend-request/accept', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requestId }),
      });
      const data = await response.json();
      if (response.ok) {
        fetchFriendRequests(); // Refresh the friend requests list
      } else {
        console.error('Error accepting friend request:', data);
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  const handleDeclineRequest = async (requestId) => {
    try {
      const response = await fetch('http://localhost:3000/api/friend-request/decline', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requestId }),
      });
      const data = await response.json();
      if (response.ok) {
        fetchFriendRequests(); // Refresh the friend requests list
      } else {
        console.error('Error declining friend request:', data);
      }
    } catch (error) {
      console.error('Error declining friend request:', error);
    }
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
              <ul>
                {friendRequests.map((request) => (
                  <li key={request.id}>
                    {request.requester.firstName} {request.requester.lastName}
                    <button onClick={() => handleAcceptRequest(request.id)}>✔</button>
                    <button onClick={() => handleDeclineRequest(request.id)}>✖</button>
                  </li>
                ))}
              </ul>
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
