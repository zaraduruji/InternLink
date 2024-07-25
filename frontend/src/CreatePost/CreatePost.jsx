import React, { useState, useContext } from 'react';
import { usePosts } from '../PostContext';
import { UserContext } from '../UserContext';
import './CreatePost.css';

function CreatePost({ isOpen, onClose }) {
  const [postContent, setPostContent] = useState('');
  const [image, setImage] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const addPost = async (newPost) => {
    try {
      const response = await axios.post('http://localhost:3000/api/posts', newPost);
      setPosts(prevPosts => [response.data, ...prevPosts]);
    } catch (error) {
      console.error('Error adding post:', error);
    }
  };
  const {user}= JSON.parse(localStorage.getItem('user'))

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
      console.log('Appending image:', image);
      formData.append('image', image);
    }

    try {
      console.log('FormData content before submission:', Array.from(formData.entries()));
      await addPost(formData);
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
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>&times;</button>
        <h2 className="modal-title">Create a Post</h2>
        <form onSubmit={handleSubmit} className="post-form">
          <textarea
            value={postContent}
            onChange={handleContentChange}
            placeholder="What do you want to talk about?"
          />
          <input type="file" onChange={handleImageUpload} accept="image/*" />
          <button type="submit" disabled={isSubmitting || !postContent.trim()}>
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreatePost;
