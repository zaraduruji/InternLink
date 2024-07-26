import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import './ProfileView.css';
import defaultProfilePic from '../../public/defaultProfilePic.png';
import Sidebar from '../Sidebar/Sidebar';
import SearchModal from '../SearchModal/SearchModal';
import LoadingScreen from '../LoadingScreen/LoadingScreen';

const ProfileView = () => {
  const { id } = useParams();
  const loggedInUser = JSON.parse(localStorage.getItem('user'));
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('highlights');
  const [about, setAbout] = useState('');
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [connectionCount, setConnectionCount] = useState(0);
  const [pendingRequests, setPendingRequests] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // State for hover effect
  const [isHovered, setIsHovered] = useState(false);

  const fetchUser = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/users/${id}`);
      const data = await response.json();
      setUser(data);
      setAbout(data.about || '');
      setIsLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchConnectionStatus = async () => {
    if (user && user.id) {
      try {
        const response = await fetch(`http://localhost:3000/api/connections/${loggedInUser.id}`);
        const connections = await response.json();
        const connected = connections.some(connection => connection.friendId === user.id);
        setIsConnected(connected);
      } catch (error) {
        console.error('Error fetching connection status:', error);
      }
    }
  };

  const fetchConnectionCount = async () => {
    if (user && user.id) {
      try {
        const response = await fetch(`http://localhost:3000/api/users/${user.id}/connections-count`);
        const data = await response.json();
        setConnectionCount(data.count);
      } catch (error) {
        console.error('Error fetching connection count:', error);
      }
    }
  };

  useEffect(() => {
    document.body.classList.add('profile-view-body');
    fetchUser();
    return () => {
      document.body.classList.remove('profile-view-body');
    };
  }, [id]);

  useEffect(() => {
    if (user) {
      fetchConnectionCount();
      fetchConnectionStatus();
    }
  }, [user]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('light-mode');
  };

  const handleConnectionRequest = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/send-friend-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: loggedInUser.id,
          targetUserId: user.id,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setPendingRequests((prev) => ({ ...prev, [user.id]: true }));
        console.log(data.message);
        fetchConnectionCount(); // Refetch the connection count
      } else {
        console.error('Error:', data.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleRemoveConnection = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/connections/${loggedInUser.id}/${user.id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (response.ok) {
        setIsConnected(false);
        fetchConnectionCount(); // Refetch the connection count
      } else {
        console.error('Error:', data.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="profile-view-page">
      <Sidebar toggleDarkMode={toggleDarkMode} darkMode={darkMode} />

      <div className="profile-view-content">
        <div className="profile-view-header">
          <div className="profile-view-picture">
            <img src={user?.profilePicture || defaultProfilePic} alt="Profile" />
          </div>
          <div className="profile-view-info">
            <h2>{user?.firstName || 'Your Name'} {user?.lastName}</h2>
            <p>{user?.jobTitle || 'Software Engineer'}</p>
            <p>{user?.location || 'Seattle, WA, USA'}</p>
            <p>{connectionCount} Connections</p>
            <div className="profile-view-buttons">
              <div
                className="profile-view-button-container"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <button className="profile-view-button">Contact info</button>
                {isHovered && <div className="hover-text">Email address: {user?.email}</div>}
              </div>
              {loggedInUser?.id === user?.id ? (
                <p>Viewing your own public profile <Link to="/profile">Go to editable profile</Link></p>
              ) : (
                isConnected ? (
                  <button className="profile-view-button" onClick={handleRemoveConnection}>
                    Remove Connection
                  </button>
                ) : (
                  <button className="profile-view-button" onClick={handleConnectionRequest} disabled={pendingRequests[user?.id]}>
                    {pendingRequests[user?.id] ? 'Request Pending' : 'Connect+'}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        <div className="profile-view-tabs">
          <div className={`profile-view-tab ${activeTab === 'highlights' ? 'active' : ''}`} onClick={() => handleTabClick('highlights')}>
            Highlights
          </div>
        </div>

        <div className="profile-view-details">
          {activeTab === 'highlights' ? (
            <div className="profile-view-highlights-section">
              <div className="highlight">
                <h3>Experience</h3>
                <p>This is the Experience section. Add your work experiences here.</p>
              </div>
              <div className="highlight">
                <h3>Education</h3>
                {user?.education?.map((edu, index) => (
                  <div key={index} className="education-item">
                    <img src={edu.logo} alt={edu.school} />
                    <div>
                      <h4>{edu.school}</h4>
                      <p>{edu.degree}</p>
                      <p>{`${edu.startDate} - ${edu.endDate}`}</p>
                      <p>{`Grade: ${edu.grade}`}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="highlight">
                <h3>Skills</h3>
                <p>This is the Skills section. Add your skills here.</p>
              </div>
              <div className="highlight">
                <h3>About</h3>
                <p>{about}</p>
              </div>
            </div>
          ) : (
            <div className="posts-section">This section will display posts.</div>
          )}
        </div>
      </div>

      <SearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} darkMode={darkMode} />
    </div>
  );
};

export default ProfileView;
