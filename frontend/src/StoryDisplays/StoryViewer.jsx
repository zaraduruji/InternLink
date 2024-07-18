// src/components/StoryViewer/StoryViewer.jsx
import React, { useState, useEffect } from 'react';
import './StoryViewer.css';

const StoryViewer = ({ stories, onClose }) => {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      if (progress < 100) {
        setProgress(prev => prev + 1);
      } else {
        if (currentStoryIndex < stories.length - 1) {
          setCurrentStoryIndex(prev => prev + 1);
          setProgress(0);
        } else {
          onClose();
        }
      }
    }, 30); // Progress updates every 30ms for smooth animation

    return () => clearInterval(timer);
  }, [progress, currentStoryIndex, stories.length, onClose]);

  const handleNext = () => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
      setProgress(0);
    }
  };

  return (
    <div className="story-viewer">
      <div className="story-progress">
        {stories.map((_, index) => (
          <div key={index} className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: index === currentStoryIndex ? `${progress}%` : index < currentStoryIndex ? '100%' : '0%'
              }}
            ></div>
          </div>
        ))}
      </div>
      <img src={stories[currentStoryIndex].fileUrl} alt="Story" className="story-image" />
      <div className="story-controls">
        <div className="story-control left" onClick={handlePrevious}></div>
        <div className="story-control right" onClick={handleNext}></div>
      </div>
      <button className="close-button" onClick={onClose}>×</button>
    </div>
  );
};

export default StoryViewer;
