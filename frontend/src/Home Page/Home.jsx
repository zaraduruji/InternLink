import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import Stories from '../StoryDisplays/Stories';
import Sidebar from '../Sidebar/Sidebar';
import Notifications from '../Notifications Page/Notifications';
import LoadingScreen from '../LoadingScreen/LoadingScreen';
import Post from '../Post/Post';
import axios from 'axios';
import CommentModal from '../CommentModal/CommentModal';

const Home = ({ openCreatePostModal }) => {
  const [darkMode, setDarkMode] = useState(true);
  const [user, setUser] = useState(() => {
    // Initialize user state from localStorage
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
      setAbout(data.about || '');
      setIsLoading(false);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(()=>{
fetchUser()
  }, [])
  const [posts, setPosts] = useState([]);
  const [post, setPost] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/posts');
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };
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
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('light-mode');
  };

  // console.log('Rendering Home component', { posts, loading, error, user });

  // if (loading) {
  //   console.log('Loading posts...');
  //   return <LoadingScreen />;
  // }

  // if (error) {
  //   console.error('Error loading posts:', error);
  //   return <div>Error loading posts. Please try again later.</div>;
  // }

  return (
    <div className={`home-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <Sidebar
        toggleDarkMode={toggleDarkMode}
        darkMode={darkMode}
        openCreatePostModal={openCreatePostModal}
      />
      {post && <CommentModal onTap={()=>setPost(null)} post={post}/>}
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
              <Post key={post.id} post={post} onShow={setPost} currentUser={user} />
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
