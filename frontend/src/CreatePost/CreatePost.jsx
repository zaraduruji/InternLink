import React, { useState } from 'react';
import axios from 'axios';
import './CreatePost.css';

function CreatePost({ isOpen, onClose, onPostCreated }) {
  const [postContent, setPostContent] = useState('');
  const [image, setImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));

  const handleContentChange = (e) => setPostContent(e.target.value);

  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!postContent.trim()) return; // Prevent empty posts

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('content', postContent);
    formData.append('userId', user.id);
    if (image) {
      formData.append('image', image);
    }

    try {
      const response = await axios.post('http://localhost:3000/api/posts', formData);
      onPostCreated(response.data);
      setPostContent('');
      setImage(null);
      onClose();
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`modal-overlay ${user.darkMode ? 'dark-mode' : 'light-mode'}`}>
      <div className={`modal-content ${user.darkMode ? 'dark-mode' : 'light-mode'}`}>
        <button className="close-button" onClick={onClose}>&times;</button>
        <div className="modal-header">
          <img src={user.profilePicture || '/default-profile-pic.png'} alt="User" className="profile-pic" />
          <div>
            <h4 className="user-name">{user.firstName} {user.lastName}</h4>
            <span className="post-visibility">Post to Anyone</span>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="post-form">
          <textarea
            value={postContent}
            onChange={handleContentChange}
            placeholder="Share your thoughts..."
          />
          <div className="form-actions">
            <input type="file" onChange={handleImageUpload} accept="image/*" />
            <button type="submit" disabled={isSubmitting || !postContent.trim()}>
              {isSubmitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreatePost;
