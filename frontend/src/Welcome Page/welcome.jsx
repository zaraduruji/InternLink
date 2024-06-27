import React, { useState, useEffect } from 'react';
import './welcome.css';
import ReactModal from 'react-modal';
import Login from '../Login Page/Login';
import Signup from '../Signup Page/Signup';

ReactModal.setAppElement('#root');

const Welcome = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [fadeInWelcomeText, setFadeInWelcomeText] = useState(false);
  const [fadeInCatchPhrase, setFadeInCatchPhrase] = useState(false);
  const [fadeInButtons, setFadeInButtons] = useState(false);

  useEffect(() => {
    const welcomeTextTimer = setTimeout(() => setFadeInWelcomeText(true), 500); // Adjust delay
    const catchPhraseTimer = setTimeout(() => setFadeInCatchPhrase(true), 3000); // Adjust delay
    const buttonsTimer = setTimeout(() => setFadeInButtons(true), 5500); // Adjust delay

    return () => {
      clearTimeout(welcomeTextTimer);
      clearTimeout(catchPhraseTimer);
      clearTimeout(buttonsTimer);
    };
  }, []);

  return (
    <div className="welcome-container">
      <video autoPlay loop muted className="background-video">
        <source src="./welcome-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="overlay">
        <h1 className={`welcome-text ${fadeInWelcomeText ? 'fade-in' : ''}`}>Welcome to InternLink!</h1>
        <h2 className={`catch-phrase ${fadeInCatchPhrase ? 'fade-in' : ''}`}>Your gateway to the best internships</h2>
        <div className={`buttons ${fadeInButtons ? 'fade-in' : ''}`}>
          <button className="login-button" onClick={() => setShowLoginModal(true)}>Log In</button>
          <button className="signup-button" onClick={() => setShowSignupModal(true)}>Sign Up</button>
        </div>
      </div>

      <ReactModal
        isOpen={showLoginModal}
        onRequestClose={() => setShowLoginModal(false)}
        className="ReactModal__Content"
        overlayClassName="ReactModal__Overlay"
      >
        <Login setShowLoginModal={setShowLoginModal} setShowSignupModal={setShowSignupModal} />
      </ReactModal>

      <ReactModal
        isOpen={showSignupModal}
        onRequestClose={() => setShowSignupModal(false)}
        className="ReactModal__Content"
        overlayClassName="ReactModal__Overlay"
      >
        <Signup setShowLoginModal={setShowLoginModal} setShowSignupModal={setShowSignupModal} />
      </ReactModal>
    </div>
  );
};

export default Welcome;
