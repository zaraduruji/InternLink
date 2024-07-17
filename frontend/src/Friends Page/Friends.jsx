import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Friends.css';
import { UserContext } from '../UserContext';
import Sidebar from '../Sidebar/Sidebar';
import SearchModal from '../SearchModal/SearchModal';

const Friends = () => {
  const { user } = useContext(UserContext);
  const [connections, setConnections] = useState([]);

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/connections/${user.id}`);
      const data = await response.json();
      setConnections(data);
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  };

  return (
    <div className="friends-page">
      <Sidebar />
      <SearchModal />
      <div className="friends-content">
        <h2>Your Connections</h2>
        <ul>
          {connections.map((connection) => (
            <li key={connection.id}>
              <Link to={`/profile/${connection.friendId}`}>
                {connection.friend.firstName} {connection.friend.lastName}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Friends;
