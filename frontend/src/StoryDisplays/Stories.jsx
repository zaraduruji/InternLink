import React, { useEffect, useState, useRef, useCallback } from 'react';
import StoriesList from './StoriesList';
import StoryViewer from './StoryViewer';
import './Stories.css';

const Stories = ({ currentUser }) => {
  const [stories, setStories] = useState([]);
  const storiesListRef = useRef(new StoriesList());
  const [viewingStories, setViewingStories] = useState(null);

  const fetchStories = useCallback(() => {
    fetch('http://localhost:3000/api/stories')
      .then(response => response.json())
      .then(data => {
        const storiesList = storiesListRef.current;
        storiesList.removeExpiredStories();
        data.forEach(userStories => {
          if (userStories && userStories.stories) {
            userStories.stories.forEach(story => {
              if (story) {
                storiesList.insertStory(story);
              }
            });
          }
        });
        setStories(storiesList.toArray());
      })
      .catch(error => console.error('Error fetching stories:', error));
  }, []);

  useEffect(() => {
    fetchStories();
    const interval = setInterval(fetchStories, 60000);
    return () => clearInterval(interval);
  }, [fetchStories]);

  const addNewStory = async (file, userId) => {
    const formData = new FormData();
    formData.append('story', file);
    formData.append('userId', userId);
    try {
      const response = await fetch('http://localhost:3000/api/stories', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        await fetchStories(); // Fetch the updated list of stories
      } else {
        console.error('Failed to upload story');
      }
    } catch (error) {
      console.error('Error uploading story:', error);
    }
  };

  const removeExpiredStories = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3000/api/stories/expired', {
        method: 'DELETE',
      });
      if (response.ok) {
        storiesListRef.current.removeExpiredStories();
        setStories(storiesListRef.current.toArray());
      } else {
        console.error('Failed to remove expired stories');
      }
    } catch (error) {
      console.error('Error removing expired stories:', error);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(removeExpiredStories, 3600000);
    return () => clearInterval(interval);
  }, [removeExpiredStories]);

  const groupStoriesByUser = (stories) => {
    return stories.reduce((acc, story) => {
      if (story && story.user) {
        if (!acc[story.userId]) {
          acc[story.userId] = {
            user: story.user,
            stories: [],
          };
        }
        acc[story.userId].stories.push(story);
      }
      return acc;
    }, {});
  };

  const handleAddStory = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*, video/*';
    input.onchange = async (event) => {
      const file = event.target.files[0];
      if (file) {
        await addNewStory(file, currentUser.id);
      }
    };
    input.click();
  };

  const handleStoryClick = (userStory) => {
    const formattedStories = Object.values(groupStoriesByUser(stories)).map(userStories => ({
      ...userStories.user,
      stories: userStories.stories
    }));

    const clickedUserIndex = formattedStories.findIndex(story => story.id === userStory.user.id);

    if (clickedUserIndex !== -1) {
      formattedStories.unshift(...formattedStories.splice(clickedUserIndex, 1));
    }

    setViewingStories(formattedStories);
  };

  const handleDeleteStory = async (storyId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/stories/${storyId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        // Remove the story from the local state
        setStories(prevStories => prevStories.filter(story => story.id !== storyId));
        // Update the viewingStories state
        setViewingStories(prevViewingStories => {
          const updatedViewingStories = prevViewingStories.map(user => ({
            ...user,
            stories: user.stories.filter(story => story.id !== storyId)
          }));
          return updatedViewingStories.filter(user => user.stories.length > 0);
        });
      } else {
        const errorData = await response.json();
        console.error('Failed to delete story:', errorData);
      }
    } catch (error) {
      console.error('Error deleting story:', error);
    }
  };

  const groupedStories = groupStoriesByUser(stories);

  return (
    <>
      <div className="stories-container">
        <div className="story-circle add-story" onClick={handleAddStory}>
          <img
            src={currentUser.profilePicture || '/default-profile-picture.png'}
            alt={`${currentUser.firstName} ${currentUser.lastName}`}
            className="user-profile-picture"
          />
          <div className="add-story-icon">+</div>
        </div>
        {Object.values(groupedStories).map(userStory => (
          userStory && userStory.user ? (
            <div key={userStory.user.id} className="story-circle" onClick={() => handleStoryClick(userStory)}>
              <img
                src={userStory.user.profilePicture || '/default-profile-picture.png'}
                alt={`${userStory.user.firstName} ${userStory.user.lastName}`}
                className="user-profile-picture"
              />
              <div className="story-ring"></div>
              <p className="user-name">{userStory.user.firstName}</p>
            </div>
          ) : null
        ))}
      </div>
      {viewingStories && (
        <StoryViewer
          stories={viewingStories}
          onClose={() => setViewingStories(null)}
          currentUser={currentUser}
          onDeleteStory={handleDeleteStory}
        />
      )}
    </>
  );
};

export default Stories;
