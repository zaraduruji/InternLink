import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import Stories from '../StoryDisplays/Stories';
import Sidebar from '../Sidebar/Sidebar';
import Notifications from '../Notifications Page/Notifications';
import Post from '../Post/Post';
import axios from 'axios';
import CommentModal from '../CommentModal/CommentModal';
import CreatePost from '../CreatePost/CreatePost';
import SuggestedConnections from '../SuggestedConnections/SuggestedConnections';

const Home = ({ openCreatePostModal }) => {
  const [darkMode, setDarkMode] = useState(true);
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error('Error parsing user data from localStorage', error);
      return null;
    }
  });

  const fetchUser = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/users/${user.id}`);
      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);

  const fetchPosts = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/posts');
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  const handleCommentAdded = (newComment) => {
    setPosts(posts.map(post =>
      post.id === newComment.postId
      ? { ...post, comments: [...post.comments, newComment] }
      : post
    ));
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('light-mode');
  };

  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div className={`home-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <Sidebar
        toggleDarkMode={toggleDarkMode}
        darkMode={darkMode}
        openCreatePostModal={() => setIsCreatePostModalOpen(true)}
      />
      <CreatePost
        isOpen={isCreatePostModalOpen}
        onClose={() => setIsCreatePostModalOpen(false)}
        onPostCreated={handleCreatePost}
      />
      {selectedPost && (
        <CommentModal
          onClose={() => setSelectedPost(null)}
          post={selectedPost}
          onCommentAdded={handleCommentAdded}
        />
      )}
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
              <Post key={post.id} post={post} onShow={setSelectedPost} currentUser={user} />
            ))
          )}
        </div>
      </main>
      <SuggestedConnections />
    </div>
  );
};

export default Home;
