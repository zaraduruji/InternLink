import React, { useState, useEffect } from 'react';
import './StoryViewer.css';
import defaultProfilePic from '../../public/defaultProfilePic.png';

const StoryViewer = ({ stories, onClose }) => {
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      if (progress < 100) {
        setProgress(prev => prev + 1);
      } else {
        handleNext();
      }
    }, 30);
    return () => clearInterval(timer);
  }, [progress]);

  const handleNext = () => {
    if (currentStoryIndex < stories[currentUserIndex].stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
      setProgress(0);
    } else if (currentUserIndex < stories.length - 1) {
      setCurrentUserIndex(prev => prev + 1);
      setCurrentStoryIndex(0);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
      setProgress(0);
    } else if (currentUserIndex > 0) {
      setCurrentUserIndex(prev => prev - 1);
      setCurrentStoryIndex(stories[currentUserIndex - 1].stories.length - 1);
      setProgress(0);
    }
  };

  const handleNextUser = () => {
    if (currentUserIndex < stories.length - 1) {
      setCurrentUserIndex(prev => prev + 1);
      setCurrentStoryIndex(0);
      setProgress(0);
    }
  };

  const handlePreviousUser = () => {
    if (currentUserIndex > 0) {
      setCurrentUserIndex(prev => prev - 1);
      setCurrentStoryIndex(0);
      setProgress(0);
    }
  };

  const currentUser = stories[currentUserIndex];
  const currentStory = currentUser.stories[currentStoryIndex];

  return (
    <div className="story-viewer">
      <div className="story-container">
        <div className="story-header">
          <div className="progress-container">
            {currentUser.stories.map((_, index) => (
              <div key={index} className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: index === currentStoryIndex
                      ? `${progress}%`
                      : index < currentStoryIndex
                      ? '100%'
                      : '0%'
                  }}
                ></div>
              </div>
            ))}
          </div>
          <div className="user-info">
            <img
              src={currentUser.profilePicture || defaultProfilePic}
              alt="User avatar"
              className="user-avatar"
            />
            <span className="username">
              {currentUser.firstName
                ? `${currentUser.firstName} ${currentUser.lastName}`
                : currentUser.username || 'Unknown User'}
            </span>
          </div>
        </div>
        <img src={currentStory.fileUrl} alt="Story" className="story-image" />
        <div className="story-controls">
          <div className="story-control left" onClick={handlePrevious}></div>
          <div className="story-control right" onClick={handleNext}></div>
        </div>
        <div className="user-navigation">
          <button className="nav-button left" onClick={handlePreviousUser}>&lt;</button>
          <button className="nav-button right" onClick={handleNextUser}>&gt;</button>
        </div>
      </div>
      <button className="close-button" onClick={onClose}>×</button>
    </div>
  );
};

export default StoryViewer;
