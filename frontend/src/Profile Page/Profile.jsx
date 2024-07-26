
import React, { useState, useEffect, useRef } from 'react';
import './Profile.css';
import Modal from 'react-modal';
import Sidebar from '../Sidebar/Sidebar';
import SearchModal from '../SearchModal/SearchModal';
import defaultProfilePic from '../../public/defaultProfilePic.png';
import LoadingScreen from '../LoadingScreen/LoadingScreen';

const Profile = () => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error('Error parsing user data from localStorage', error);
      return null;
    }
  });
  console.log(user)
  const fetchUser = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`http://localhost:3000/api/users/${storedUser.id}`);
      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    document.body.classList.add('profile-body');
    fetchUser();
    return () => {
      document.body.classList.remove('profile-body');
    };
  }, []);

  const updateUser = (newUserData) => {
    setUser((prevUser) => {
      const updatedUser = { ...prevUser, ...newUserData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  const [activeTab, setActiveTab] = useState('highlights');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [photoModalIsOpen, setPhotoModalIsOpen] = useState(false);
  const [cameraModalIsOpen, setCameraModalIsOpen] = useState(false);
  const [educationModalIsOpen, setEducationModalIsOpen] = useState(false);
  const [aboutModalIsOpen, setAboutModalIsOpen] = useState(false);
  const [experienceModalIsOpen, setExperienceModalIsOpen] = useState(false);
  const [skillsModalIsOpen, setSkillsModalIsOpen] = useState(false);
  const [about, setAbout] = useState(user?.about || '');
  const [stream, setStream] = useState(null);
  const [educationDetails, setEducationDetails] = useState({
    school: '',
    degree: '',
    startDate: '',
    endDate: '',
    grade: '',
  });
  const [experienceDetails, setExperienceDetails] = useState({
    company: '',
    position: '',
    startDate: '',
    endDate: '',
  });
  const [skillDetails, setSkillDetails] = useState('');
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

    if (user && user.id) {
      fetch(`http://localhost:3000/api/users/${user.id}/connections-count`)
        .then((response) => response.json())
        .then((data) => setConnectionsCount(data.count))
        .catch((error) => {
          console.error('Error fetching connections count:', error);
          setIsLoading(false);
        });
    }
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
    if (user && user.id) {
      refetchConnectionCount();
    }
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

  const openExperienceModal = () => {
    setExperienceModalIsOpen(true);
  };

  const closeExperienceModal = () => {
    setExperienceModalIsOpen(false);
  };

  const openSkillsModal = () => {
    setSkillsModalIsOpen(true);
  };

  const closeSkillsModal = () => {
    setSkillsModalIsOpen(false);
  };

  const handleEducationChange = (event) => {
    const { name, value } = event.target;
    setEducationDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleExperienceChange = (event) => {
    const { name, value } = event.target;
    setExperienceDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleSkillChange = (event) => {
    setSkillDetails(event.target.value);
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
    };
    console.log('Sending education data:', updatedEducation);

    const allEducation = user.education ? [...user.education, updatedEducation] : [updatedEducation];

    fetch('http://localhost:3000/update-profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.id,
        education: allEducation,
      }),
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }
        return data;
      })
      .then((data) => {
        updateUser(data.user);
        closeEducationModal();
      })
      .catch((error) => {
        console.error('Error updating profile:', error);
        alert(`Failed to update profile: ${error.message}`);
      });
  };

  const saveExperienceDetails = () => {
    const updatedExperience = {
      company: experienceDetails.company,
      position: experienceDetails.position,
      startDate: experienceDetails.startDate,
      endDate: experienceDetails.endDate,
    };
    console.log('Sending experience data:', updatedExperience);

    const allExperience = user.experience ? [...user.experience, updatedExperience] : [updatedExperience];

    fetch('http://localhost:3000/update-profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify

({
        userId: user.id,
        experience: allExperience,
      }),
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }
        return data;
      })
      .then((data) => {
        updateUser(data.user);
        closeExperienceModal();
      })
      .catch((error) => {
        console.error('Error updating profile:', error);
        alert(`Failed to update profile: ${error.message}`);
      });
  };

  const saveSkillDetails = () => {
    const newSkill = {
      name: skillDetails,
    };
    const allSkills = user.skills ? [...user.skills, newSkill] : [newSkill];

    fetch('http://localhost:3000/update-profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.id,
        skills: allSkills,
      }),
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }
        return data;
      })
      .then((data) => {
        updateUser(data.user);
        closeSkillsModal();
      })
      .catch((error) => {
        console.error('Error updating profile:', error);
        alert(`Failed to update profile: ${error.message}`);
      });
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('light-mode');
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:3000/logout', {
        method: 'POST',
        credentials: 'include',
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
    const clientId = '862czcy94rlwto';
    const state = 'X6XDUy0gT7udJOuP';
    const redirectUri = encodeURIComponent('http://localhost:5173/auth/linkedin/callback');
    const scope = encodeURIComponent('profile openid email');

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
        </div>

        <div className="profile-details">
          {activeTab === 'highlights' ? (
            <div className="highlights-section">
              <div className="highlight">
                <h3>Experience</h3>
                {user?.experience?.map((exp, index) => (
                  <div key={index} className="experience-item">
                    <h4>{exp.company}</h4>
                    <p>{exp.position}</p>
                    <p>{`${exp.startDate} - ${exp.endDate}`}</p>
                  </div>
                ))}
              </div>
              <div className="highlight">
                <h3>Education</h3>
                {user?.education?.map((edu, index) => (
                  <div key={index} className="education-item">
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
                {user?.skills?.map((skill, index) => (
                  <div key={index} className="skill-item">
                    <p>{skill.name}</p>
                  </div>
                ))}
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
          <p className="modal-option" onClick={openExperienceModal}>Add experience</p>
          <p className="modal-option" onClick={openSkillsModal}>Add skills</p>
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
          value={educationDetails

.endDate}
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

      <Modal
        isOpen={experienceModalIsOpen}
        onRequestClose={closeExperienceModal}
        contentLabel="Add Experience Modal"
        className="modal"
        overlayClassName="overlay"
      >
        <h2>Add experience</h2>
        <input
          type="text"
          name="company"
          value={experienceDetails.company}
          onChange={handleExperienceChange}
          placeholder="Company"
        />
        <input
          type="text"
          name="position"
          value={experienceDetails.position}
          onChange={handleExperienceChange}
          placeholder="Position"
        />
        <input
          type="date"
          name="startDate"
          value={experienceDetails.startDate}
          onChange={handleExperienceChange}
          placeholder="Start Date"
        />
        <input
          type="date"
          name="endDate"
          value={experienceDetails.endDate}
          onChange={handleExperienceChange}
          placeholder="End Date"
        />
        <button className="modal-button" onClick={saveExperienceDetails}>Save</button>
        <button className="modal-close" onClick={closeExperienceModal}>Close</button>
      </Modal>

      <Modal
        isOpen={skillsModalIsOpen}
        onRequestClose={closeSkillsModal}
        contentLabel="Add Skills Modal"
        className="modal"
        overlayClassName="overlay"
      >
        <h2>Add skills</h2>
        <input
          type="text"
          value={skillDetails}
          onChange={handleSkillChange}
          placeholder="Skill"
        />
        <button className="modal-button" onClick={saveSkillDetails}>Save</button>
        <button className="modal-close" onClick={closeSkillsModal}>Close</button>
      </Modal>

      <SearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} darkMode={darkMode} />
    </div>
  );
};

export default Profile;
