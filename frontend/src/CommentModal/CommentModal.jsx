import React, { useEffect, useState } from 'react';
import './CommentModal.css';
import axios from 'axios';

const CommentModal = ({ post, onTap }) => {
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(post.comments);
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user.id;

  const addComment = async (content) => {
    try {
      const response = await axios.post(`http://localhost:3000/api/posts/${post.id}/comments`, {
        userId,
        content
      });
      console.log('Comment added:', response.data);
      setComments((prev) => [...prev, { ...response.data, user }]); // Update comments state
      setCommentText('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleAddComment = (e) => {
    if (e.key === 'Enter' && commentText.trim() !== '') {
      addComment(commentText);
    }
  };

  return (
    <div className='comment-modal-overlay' onClick={onTap}>
      <div className="comment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="comment-modal-container">
          <div className="comment-modal-left">
            {post.imageUrl && <img src={post.imageUrl} alt="Post" className="post-image" />}
          </div>
          <div className="comment-modal-right">
            <div className="comments-section">
              {comments.map((comment, index) => (
                <div key={index} className="comment">
                  <div className="comment-header">
                    {comment.user && comment.user.profilePicture ? (
                      <img
                        src={comment.user.profilePicture}
                        alt={`${comment.user.firstName} ${comment.user.lastName}`}
                        className="comment-profile-pic"
                      />
                    ) : (
                      <i className="fa-solid fa-user comment-profile-icon"></i>
                    )}
                    <div className="comment-user-info">
                      <span className="comment-user-name">
                        {comment.user.firstName} {comment.user.lastName}
                      </span>
                      <span className="comment-timestamp">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="comment-content">{comment.content}</div>
                </div>
              ))}
            </div>
            <div className="comment-field">
              <input
                type="text"
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyPress={handleAddComment}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentModal;
