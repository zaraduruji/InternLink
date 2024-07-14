import React, { useState, useContext, useEffect } from 'react';
import './Friends.css';
import { UserContext } from '../UserContext';
import Sidebar from '../Sidebar/Sidebar';
import SearchModal from '../SearchModal/SearchModal';

const Friends = () => {
  const { user } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState('growConnections');
  const [friendRequests, setFriendRequests] = useState([]);
  const [suggestedConnections, setSuggestedConnections] = useState([]);

  useEffect(() => {
    // Fetch friend requests
    fetch(`http://localhost:3000/api/friend-requests?userId=${user.id}`)
      .then((response) => response.json())
      .then((data) => setFriendRequests(data.friendRequests))
      .catch((error) => console.error('Error fetching friend requests:', error));

    // Fetch suggested connections (you might need to implement this API)
    fetch(`http://localhost:3000/api/suggested-connections?userId=${user.id}`)
      .then((response) => response.json())
      .then((data) => setSuggestedConnections(data.suggestedConnections))
      .catch((error) => console.error('Error fetching suggested connections:', error));
  }, [user.id]);

  const handleAccept = (requestId) => {
    fetch('http://localhost:3000/api/friend-request/accept', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId }),
    })
      .then((response) => response.json())
      .then(() => {
        setFriendRequests(friendRequests.filter((request) => request.id !== requestId));
      })
      .catch((error) => console.error('Error accepting friend request:', error));
  };

  const handleDecline = (requestId) => {
    fetch('http://localhost:3000/api/friend-request/decline', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId }),
    })
      .then((response) => response.json())
      .then(() => {
        setFriendRequests(friendRequests.filter((request) => request.id !== requestId));
      })
      .catch((error) => console.error('Error declining friend request:', error));
  };

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
              {friendRequests.length === 0 ? (
                <p>No friend requests</p>
              ) : (
                friendRequests.map((request) => (
                  <div key={request.id} className="friend-request">
                    <p>{request.requester.firstName} {request.requester.lastName}</p>
                    <button onClick={() => handleAccept(request.id)}>✔</button>
                    <button onClick={() => handleDecline(request.id)}>✖</button>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="suggested-connections-section">
              <h3>Suggested Connections</h3>
              {/* Render suggested connections here */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Friends;
