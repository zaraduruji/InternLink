import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Friends.css';
import Sidebar from '../Sidebar/Sidebar';
import SearchModal from '../SearchModal/SearchModal';
import LoadingScreen from '../LoadingScreen/LoadingScreen';

const Friends = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [connections, setConnections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.body.classList.add('friends-body');
    fetchConnections();
    return () => {
      document.body.classList.remove('friends-body');
    };
  }, []);

  const fetchConnections = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/connections/${user.id}`);
      const data = await response.json();
      setConnections(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching connections:', error);
      setIsLoading(false);
    }
  };

  const handleRemoveConnection = async (friendId) => {
    try {
      await fetch(`http://localhost:3000/api/connections/${user.id}/${friendId}`, {
        method: 'DELETE',
      });
      setConnections(connections.filter((connection) => connection.friendId !== friendId));
    } catch (error) {
      console.error('Error removing connection:', error);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="friends-page">
      <Sidebar />
      <SearchModal />
      <div className="friends-content">
        <h2>Your Connections</h2>
        <div className="connections-list">
          {connections.map((connection) => (
            <div key={connection.id} className="connection-item">
              <img
                src={connection.friend.profilePicture || '/default-profile-pic.png'}
                alt={`${connection.friend.firstName} ${connection.friend.lastName}`}
                className="profile-pic"
              />
              <div className="connection-info">
                <Link to={`/profile/${connection.friendId}`} className="connection-name">
                  {connection.friend.firstName} {connection.friend.lastName}
                </Link>
                <p className="connection-role">{connection.friend.jobTitle}</p>
                <p className="connection-location">{connection.friend.location}</p>
              </div>
              <button className="remove-button" onClick={() => handleRemoveConnection(connection.friendId)}>
                Remove Connection
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Friends;
