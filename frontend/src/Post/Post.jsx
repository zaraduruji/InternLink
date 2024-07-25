import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as farHeart } from '@fortawesome/free-regular-svg-icons';
import { faHeart as fasHeart, faComment } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import './Post.css';

function Post({ post, currentUser, onShow }) {
  const [isLiked, setIsLiked] = useState(post.likes && post.likes.some(like =>like.userId == currentUser.id));
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);

  useEffect(() => {
    setIsLiked(post.likes && post.likes.some(like =>like.userId == currentUser.id));
  }, [post.likes, currentUser.id]);

  const likePost = async (postId, userId) => {
    try {
      const response = await axios.post(`http://localhost:3000/api/posts/${postId}/like`, { userId });
      return response.data; // Return the updated post
    } catch (error) {
      console.error('Error liking post:', error);
      throw error; // Rethrow the error so it can be caught in the component
    }
  };

  const handleLike = async () => {
    try {
      const updatedPost = await likePost(post.id, currentUser.id);
      setIsLiked(!isLiked);
      setLikeCount(updatedPost.likeCount);
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  return (
    <div className="post">
      <div className="post-header">
        <img
          src={post.user?.profilePicture || currentUser?.profilePicture || '/path/to/default/profile/picture.png'}
          alt={`${post.user?.firstName || ''} ${post.user?.lastName || ''}`}
          className="post-profile-pic"
        />
        <div className="post-info">
          <span className="post-user-name">
            {post.user?.firstName || ''} {post.user?.lastName || ''}
          </span>
          <span className="post-timestamp">
            {post.createdAt ? new Date(post.createdAt).toLocaleString() : 'Unknown date'}
          </span>
        </div>
      </div>
      <div className="post-description">{post.content}</div>
      {post.imageUrl && <img src={post.imageUrl} alt="Post" className="post-image" />}
      <div className="post-footer">
        <div className="post-actions">
          <button onClick={handleLike} className="like-button">
            <FontAwesomeIcon
              icon={isLiked ? fasHeart : farHeart}
              className={`post-action-icon ${isLiked ? 'liked' : ''}`}
            />
          </button>
          <span>{likeCount} {likeCount === 1 ? 'like' : 'likes'}</span>
         <button onClick={()=>onShow(post)}><FontAwesomeIcon icon={faComment} className="post-action-icon" /></button>

        </div>
        <div className="post-comments">
          {post.comments && post.comments.map((comment, index) => (
            <div key={index} className="comment">
              <span className="comment-content">{comment.content}</span>
              <span className="comment-timestamp">
                {new Date(comment.createdAt).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Post;
