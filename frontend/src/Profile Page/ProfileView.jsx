import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams } from 'react-router-dom';
import './Profile.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faSearch, faUserFriends, faBell, faPlusSquare, faUser, faEllipsisH } from '@fortawesome/free-solid-svg-icons';
import defaultProfilePic from '../../public/defaultProfilePic.png';
import Sidebar from '../Sidebar/Sidebar';
import SearchModal from '../SearchModal/SearchModal';
import { UserContext } from '../UserContext';

const ProfileView = (props) => {
  const { id } = useParams();
  const { user: loggedInUser } = useContext(UserContext);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('highlights');
  const [about, setAbout] = useState('');
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [connectionCount, setConnectionCount] = useState(0);
  const [pendingRequests, setPendingRequests] = useState({}); // State to track pending requests

  const fetchUser = async () => {
    fetch(`http://localhost:3000/api/users/${id}`)
      .then((response) => response.json())
      .then((data) => {
        setUser(data);
        setAbout(data.about || '');
      })
      .catch((error) => console.error(error));
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
    fetchUser();
  }, [id]);

  useEffect(() => {
    if (user) {
      fetchConnectionCount();
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
        console.log(data.message); // Friend request sent successfully
      } else {
        console.error('Error:', data.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const sendFriendRequest = async (targetUserId) => {
    try {
      const response = await fetch('http://localhost:3000/api/friend-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: loggedInUser.id, targetUserId }),
      });
      const data = await response.json();
      if (data.message) {
        setPendingRequests((prev) => ({ ...prev, [targetUserId]: true }));
      } else {
        console.error('Error sending friend request:', data.error);
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  const UserProfile = ({ targetUser }) => {
    const isConnected = isAlreadyConnected(targetUser.id);
    const isPending = pendingRequests[targetUser.id];

    return (
      <div>
        <h2>{targetUser.firstName} {targetUser.lastName}</h2>
        <p>{targetUser.jobTitle}</p>
        <button
          onClick={() => sendFriendRequest(targetUser.id)}
          disabled={isConnected || isPending}
        >
          {isConnected ? 'Connected' : isPending ? 'Request Pending' : 'Connect+'}
        </button>
      </div>
    );
  };

  return (
    <div className="profile-page">
      <Sidebar toggleDarkMode={toggleDarkMode} darkMode={darkMode} />

      <div className="profile-content">
        <div className="profile-header">
          <div className="profile-picture">
            <img src={user?.profilePicture || defaultProfilePic} alt="Default Profile" />
          </div>
          <div className="profile-info">
            <h2>{user?.firstName || 'Your Name'} {user?.lastName}</h2>
            <p>{user?.jobTitle || 'Software Engineer'}</p>
            <p>{user?.location || 'Seattle, WA, USA'}</p>
            <p>{connectionCount} Connections</p> {/* Display connections count */}
            <div className="profile-buttons">
              <button className="profile-button">Contact info</button>
              {loggedInUser?.id === user?.id ? (
                <p> Viewing your own public profile <Link to={"/profile"} >Go to editable profile</Link></p>
              ) : (
               <button className="profile-button" onClick={handleConnectionRequest} disabled={pendingRequests[user?.id]}>
  {pendingRequests[user?.id] ? 'Request Pending' : 'Connect+'}
</button>
              )}
            </div>
            {loggedInUser?.id === user?.id && (
              <div className="connection-counter">Connections: {connectionCount}</div>
            )}
          </div>
        </div>

        <div className="profile-tabs">
          <div className={`tab ${activeTab === 'highlights' ? 'active' : ''}`} onClick={() => handleTabClick('highlights')}>
            Highlights
          </div>
          <div className={`tab ${activeTab === 'posts' ? 'active' : ''}`} onClick={() => handleTabClick('posts')}>
            Posts
          </div>
        </div>

        <div className="profile-details">
          {activeTab === 'highlights' ? (
            <div className="highlights-section">
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
