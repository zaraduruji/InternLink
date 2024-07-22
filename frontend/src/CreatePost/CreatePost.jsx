import React, { useState } from 'react';
import './CreatePost.css';

function CreatePost({ isOpen, onClose }) {
  const [postContent, setPostContent] = useState('');
  const [image, setImage] = useState(null);

  const handleContentChange = (e) => setPostContent(e.target.value);

  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Post content:', postContent);
    console.log('Image:', image);
    onClose();
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
          <button type="submit">Post</button>
        </form>
      </div>
    </div>
  );
}

export default CreatePost;
