import React, { useState, useContext, useEffect, useRef } from 'react';
import './Profile.css';
import { UserContext } from '../UserContext';
import Modal from 'react-modal';
import Sidebar from '../Sidebar/Sidebar';
import SearchModal from '../SearchModal/SearchModal';
import defaultProfilePic from '../../public/defaultProfilePic.png';
import LoadingScreen from '../LoadingScreen/LoadingScreen';

const Profile = () => {
  const { user, updateUser } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState('highlights');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [photoModalIsOpen, setPhotoModalIsOpen] = useState(false);
  const [cameraModalIsOpen, setCameraModalIsOpen] = useState(false);
  const [educationModalIsOpen, setEducationModalIsOpen] = useState(false);
  const [aboutModalIsOpen, setAboutModalIsOpen] = useState(false);
  const [about, setAbout] = useState(user?.about || '');
  const [stream, setStream] = useState(null);
  const [educationDetails, setEducationDetails] = useState({
    school: '',
    degree: '',
    startDate: '',
    endDate: '',
    grade: '',
    logo: ''
  });
  const [universitySuggestions, setUniversitySuggestions] = useState([]);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [connectionsCount, setConnectionsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    fetch(`http://localhost:3000/api/users/${user.id}/connections-count`)
      .then((response) => response.json())
      .then((data) => setConnectionsCount(data.count))
      .catch((error) => {
        console.error('Error fetching connections count:', error);
        setIsLoading(false);
      });
  }, [user]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const openPhotoModal = () => {
    setPhotoModalIsOpen(true);
  };

  const closePhotoModal = () => {
    setPhotoModalIsOpen(false);
  };

  const openCameraModal = async () => {
    setCameraModalIsOpen(true);
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    setStream(stream);
    videoRef.current.srcObject = stream;
  };

  const closeCameraModal = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setCameraModalIsOpen(false);
  };

  const capturePhoto = () => {
    const context = canvasRef.current.getContext('2d');
    context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
    const dataUrl = canvasRef.current.toDataURL('image/png');
    handlePhotoUpload(dataUrl);
  };

  const handlePhotoUpload = async (imageData) => {
    const formData = new FormData();
    formData.append('profilePicture', imageData);
    formData.append('userId', user.id);

    try {
      const response = await fetch('http://localhost:3000/uploadProfilePicture', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      updateUser(data.user);
      closePhotoModal();
      closeCameraModal();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const refetchConnectionCount = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/users/${user.id}/connections-count`);
      const data = await response.json();
      setConnectionsCount(data.count);
    } catch (error) {
      console.error('Error fetching connections count:', error);
    }
  };

  useEffect(() => {
    refetchConnectionCount();
  }, [user]);

  const openEducationModal = () => {
    setEducationModalIsOpen(true);
  };

  const closeEducationModal = () => {
    setEducationModalIsOpen(false);
  };

  const openAboutModal = () => {
    setAboutModalIsOpen(true);
  };

  const closeAboutModal = () => {
    setAboutModalIsOpen(false);
  };

  const handleEducationChange = (event) => {
    const { name, value } = event.target;
    setEducationDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value
    }));

    if (name === 'school') {
      fetchUniversitySuggestions(value);
    }
  };

  const fetchUniversitySuggestions = async (query) => {
    if (!query) return;
    const response = await fetch(`https://kgsearch.googleapis.com/v1/entities:search?query=${query}&key=YOUR_API_KEY&limit=10&types=Organization`);
    const data = await response.json();
    const suggestions = data.itemListElement.map((item) => ({
      name: item.result.name,
      logo: item.result.image?.contentUrl || defaultProfilePic
    }));
    setUniversitySuggestions(suggestions);
  };

  const handleUniversitySelect = (suggestion) => {
    setEducationDetails((prevDetails) => ({
      ...prevDetails,
      school: suggestion.name,
      logo: suggestion.logo
    }));
    setUniversitySuggestions([]);
  };

  const handleAboutChange = (event) => {
    setAbout(event.target.value);
  };

  const saveAbout = () => {
    fetch('http://localhost:3000/update-profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.id,
        about,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        updateUser(data.user);
        closeAboutModal();
      })
      .catch((error) => console.error('Error:', error));
  };

  const saveEducationDetails = () => {
    const updatedEducation = {
      school: educationDetails.school,
      degree: educationDetails.degree,
      startDate: educationDetails.startDate,
      endDate: educationDetails.endDate,
      grade: educationDetails.grade,
      logo: educationDetails.logo
    };
    fetch('http://localhost:3000/update-profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.id,
        education: [...(user.education || []), updatedEducation],
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        updateUser(data.user);
        closeEducationModal();
      })
      .catch((error) => console.error('Error:', error));
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('light-mode');
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:3000/logout', {
        method: 'POST',
        credentials: 'include'
      });
      if (response.ok) {
        window.location.href = '/';
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleLinkedInSignIn = () => {
    const clientId = '86xqalggwzcbcl';
    const state = 'DCEeFWf45A53sdfKef424';
const redirectUri = encodeURIComponent('http://localhost:3000/auth/linkedIn/callback');
const scope = encodeURIComponent('profile openid email'); // Adjust scopes as needed

const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=${scope}`;

window.location.href = authUrl;

  };

  if (isLoading) {
    return <LoadingScreen />;
  }

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
            <p>{connectionsCount} Connections</p>
            <div className="profile-buttons">
              <button className="profile-button">Contact info</button>
              <button className="profile-button" onClick={openModal}>Add profile section</button>
              <button className="profile-button" onClick={handleLogout}>Logout</button>
            </div>
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

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Add Profile Section Modal"
        className="modal"
        overlayClassName="overlay"
      >
        <h2>Add to profile</h2>
        <hr />
        <p>Upload Your Profile Picture With LinkedIn!</p>
        <button onClick={handleLinkedInSignIn}>Upload photo with LinkedIn</button>
        <h3>OR</h3>
        <p>Manual Setup</p>
        <p className="modal-subtext">Start with the basics. Filling out these sections will help you be discovered by recruiters and people you may know.</p>
        <div className="modal-options">
          <p className="modal-option" onClick={openPhotoModal}>Add profile photo</p>
          <p className="modal-option" onClick={openAboutModal}>{about ? 'Edit about' : 'Add about'}</p>
          <p className="modal-option" onClick={openEducationModal}>Add education</p>
          <p className="modal-option">Add experience</p>
          <p className="modal-option">Add skills</p>
        </div>
        <button className="modal-close" onClick={closeModal}>Close</button>
      </Modal>

      <Modal
        isOpen={photoModalIsOpen}
        onRequestClose={closePhotoModal}
        contentLabel="Add Profile Photo Modal"
        className="modal"
        overlayClassName="overlay"
      >
        <h2>Add photo</h2>
        <p>No professional headshot needed! Just something that represents you.</p>
        <div className="profile-photo-options">
          <button className="modal-button" onClick={openCameraModal}>Use camera</button>
          <label className="modal-button upload-photo-button" htmlFor="file-upload">
            Upload photo
            <input id="file-upload" type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e.target.files[0])} />
          </label>
        </div>
        <button className="modal-close" onClick={closePhotoModal}>Close</button>
      </Modal>

      <Modal
        isOpen={cameraModalIsOpen}
        onRequestClose={closeCameraModal}
        contentLabel="Use Camera Modal"
        className="modal"
        overlayClassName="overlay"
      >
        <h2>Take a photo</h2>
        <video ref={videoRef} autoPlay playsInline width="100%" />
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        <button className="modal-button" onClick={capturePhoto}>Capture</button>
        <button className="modal-close" onClick={closeCameraModal}>Close</button>
      </Modal>

      <Modal
        isOpen={educationModalIsOpen}
        onRequestClose={closeEducationModal}
        contentLabel="Add Education Modal"
        className="modal"
        overlayClassName="overlay"
      >
        <h2>Add education</h2>
        <input
          type="text"
          name="school"
          value={educationDetails.school}
          onChange={handleEducationChange}
          placeholder="School"
        />
        {universitySuggestions.length > 0 && (
          <ul className="suggestions-list">
            {universitySuggestions.map((suggestion, index) => (
              <li key={index} onClick={() => handleUniversitySelect(suggestion)}>
                <img src={suggestion.logo} alt={suggestion.name} />
                <span>{suggestion.name}</span>
              </li>
            ))}
          </ul>
        )}
        <input
          type="text"
          name="degree"
          value={educationDetails.degree}
          onChange={handleEducationChange}
          placeholder="Degree"
        />
        <input
          type="date"
          name="startDate"
          value={educationDetails.startDate}
          onChange={handleEducationChange}
          placeholder="Start Date"
        />
        <input
          type="date"
          name="endDate"
          value={educationDetails.endDate}
          onChange={handleEducationChange}
          placeholder="End Date"
        />
        <input
          type="text"
          name="grade"
          value={educationDetails.grade}
          onChange={handleEducationChange}
          placeholder="Grade"
        />
        <button className="modal-button" onClick={saveEducationDetails}>Save</button>
        <button className="modal-close" onClick={closeEducationModal}>Close</button>
      </Modal>

      <Modal
        isOpen={aboutModalIsOpen}
        onRequestClose={closeAboutModal}
        contentLabel="Edit About Modal"
        className="modal"
        overlayClassName="overlay"
      >
        <h2>{about ? 'Edit About' : 'Add About'}</h2>
        <textarea
          value={about}
          onChange={handleAboutChange}
          placeholder="Write about yourself"
        />
        <button className="modal-button" onClick={saveAbout}>Save</button>
        <button className="modal-close" onClick={closeAboutModal}>Close</button>
      </Modal>

      <SearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} darkMode={darkMode} />
    </div>
  );
};

export default Profile;
