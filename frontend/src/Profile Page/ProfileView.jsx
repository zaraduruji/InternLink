import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useParams } from 'react-router-dom';
import './Profile.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faSearch, faUserFriends, faBell, faPlusSquare, faUser, faEllipsisH } from '@fortawesome/free-solid-svg-icons';
import defaultProfilePic from '../../public/defaultProfilePic.png';
import Modal from 'react-modal';
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

  const fetchUser = async () => {
    fetch('http://localhost:3000/api/users/' + id)
      .then((response) => response.json())
      .then((data) => {
        setUser(data);
        setAbout(data.about || '');
      })
      .catch((error) => console.error(error));
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  useEffect(() => {
    console.log('User data:', user);
  }, [user]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('light-mode');
  };

  const handleConnectionRequest = () => {
    fetch('http://localhost:3000/api/connect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: loggedInUser.id,
        targetUserId: user.id,
      }),
    })
      .then(response => response.json())
      .then(data => {
        console.log(data.message);
        // Optionally update the UI to indicate the connection request has been sent
      })
      .catch(error => console.error('Error:', error));
  };

  const sendFriendRequest = async (targetUserId) => {
    try {
      // Making a POST request to the backend to send a friend request
      const response = await fetch('http://localhost:3000/api/friend-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, targetUserId }), // Sending the userId of the logged-in user and the targetUserId
      });

      // Parsing the response to JSON
      const data = await response.json();

      // Checking if the response has a success message
      if (data.message) {
        console.log('Friend request sent:', data);
        alert('Friend request sent'); // Alerting the user that the request was sent successfully
      } else {
        console.error('Error sending friend request:', data.error);
        alert('Error sending friend request'); // Alerting the user if there was an error in sending the request
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      alert('Error sending friend request'); // Handling any errors that occur during the fetch request
    }
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
            <div className="profile-buttons">
              <button className="profile-button">Contact info</button>
              {loggedInUser?.id === user?.id ? (
                <p> Viewing your own public profile <Link to={"/profile"} >Go to editable profile</Link></p>
              ) : (
                <button className="profile-button" onClick={handleConnectionRequest}>Connection+</button>
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
