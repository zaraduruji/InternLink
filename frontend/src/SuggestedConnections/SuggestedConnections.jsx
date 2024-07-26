import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './SuggestedConnections.css'; // Import the CSS file

const SuggestedConnections = () => {
  const [suggestedConnections, setSuggestedConnections] = useState([]);

  const fetchSuggestedConnections = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/suggested-connections', { withCredentials: true });
      setSuggestedConnections(response.data.slice(0, 3)); // Limit to 3 suggestions
    } catch (error) {
      console.error('Error fetching suggested connections:', error);
    }
  };

  useEffect(() => {
    fetchSuggestedConnections();
  }, []);

  return (
    <aside className="suggested-connections">
      <h2>Suggested Connections</h2>
      {suggestedConnections.length === 0 ? (
        <p>No suggested connections available.</p>
      ) : (
        suggestedConnections.map((connection) => (
          <div key={connection.id} className="connection">
            <img src={connection.profilePicture} alt={`${connection.firstName} ${connection.lastName}`} className="profile-pic" />
            <div className="connection-info">
              <Link to={`/profile/${connection.id}`} className="name">{connection.firstName} {connection.lastName}</Link>
              <p className="job-title">{connection.jobTitle || 'Job Title'}</p>
            </div>
          </div>
        ))
      )}
    </aside>
  );
};

export default SuggestedConnections;
