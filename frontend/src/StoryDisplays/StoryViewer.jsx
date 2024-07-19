import React, { useState, useEffect } from 'react';
import './StoryViewer.css';
import defaultProfilePic from '../../public/defaultProfilePic.png';

const StoryViewer = ({ stories, onClose, currentUser, onDeleteStory }) => {
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showMenu, setShowMenu] = useState(false);

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
    if (currentStoryIndex < stories[currentUserIndex]?.stories?.length - 1) {
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
      setCurrentStoryIndex(stories[currentUserIndex - 1]?.stories?.length - 1 || 0);
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

  const handleMenuToggle = () => {
    setShowMenu(!showMenu);
  };

  const handleDeleteStory = () => {
    if (onDeleteStory && currentUser.id === activeUser.id) {
      onDeleteStory(currentStory.id)
        .then(() => {
          setShowMenu(false);
          if (currentStoryIndex > 0) {
            setCurrentStoryIndex(currentStoryIndex - 1);
          } else if (currentUserIndex > 0) {
            setCurrentUserIndex(currentUserIndex - 1);
            setCurrentStoryIndex(stories[currentUserIndex - 1]?.stories?.length - 1 || 0);
          } else {
            onClose();
          }
        })
        .catch((error) => {
          console.error('Failed to delete story:', error);
        });
    } else {
      console.log('Delete conditions not met');
    }
  };

  if (!stories || stories.length === 0) {
    return null;
  }

  const activeUser = stories[currentUserIndex];
  const currentStory = activeUser?.stories[currentStoryIndex];
  const isCurrentUserStory = activeUser.id === currentUser.id;

  return (
    <div className="story-viewer">
      <div className="story-container">
        <div className="story-header">
          <div className="progress-container">
            {activeUser.stories.map((_, index) => (
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
              src={activeUser.profilePicture || defaultProfilePic}
              alt="User avatar"
              className="user-avatar"
            />
            <span className="username">
              {activeUser.firstName
                ? `${activeUser.firstName} ${activeUser.lastName}`
                : activeUser.username || 'Unknown User'}
            </span>
          </div>
          {isCurrentUserStory && (
            <div className="story-menu">
              <button onClick={handleMenuToggle} className="menu-button">...</button>
              {showMenu && (
                <div className="menu-dropdown">
                  <button onClick={handleDeleteStory} className="delete-button">🗑️ Delete</button>
                </div>
              )}
            </div>
          )}
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
