import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import Stories from '../StoryDisplays/Stories';
import { UserContext } from '../UserContext';
import { usePosts } from '../PostContext';
import Sidebar from '../Sidebar/Sidebar';
import Notifications from '../Notifications Page/Notifications';
import LoadingScreen from '../LoadingScreen/LoadingScreen';
import Post from '../Post/Post';

const Home = ({ openCreatePostModal }) => {
  const [darkMode, setDarkMode] = useState(true);
  const { user } = useContext(UserContext);
  const { posts, fetchPosts, loading, error } = usePosts();
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    console.log('Home component mounted');
    const loadPosts = async () => {
      try {
        await fetchPosts();
      } catch (error) {
        console.error('Error loading posts:', error);
      }
    };
    loadPosts();
  }, [fetchPosts]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('light-mode');
  };

  console.log('Rendering Home component', { posts, loading, error, user });

  if (loading) {
    console.log('Loading posts...');
    return <LoadingScreen />;
  }

  if (error) {
    console.error('Error loading posts:', error);
    return <div>Error loading posts. Please try again later.</div>;
  }

  return (
    <div className={`home-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <Sidebar
        toggleDarkMode={toggleDarkMode}
        darkMode={darkMode}
        openCreatePostModal={openCreatePostModal}
      />
      <main className="main-content">
        <div className="notifications-bell" onClick={() => setShowNotifications(!showNotifications)}>
          <FontAwesomeIcon icon={faBell} />
        </div>
        {showNotifications && (
          <Notifications onClose={() => setShowNotifications(false)} />
        )}
        <div className="stories-lineup">
          <Stories currentUser={user} />
        </div>
        <div className="posts-container">
          {posts.length === 0 ? (
            <p>No posts available.</p>
          ) : (
            posts.map((post) => (
              <Post key={post.id} post={post} currentUser={user} />
            ))
          )}
        </div>
      </main>
      <aside className="suggested-connections">
        <h2>Suggested Connections</h2>
        <div className="connection">Connection 1</div>
        <div className="connection">Connection 2</div>
        <div className="connection">Connection 3</div>
        <div className="connection">Connection 4</div>
      </aside>
    </div>
  );
};

export default Home;
