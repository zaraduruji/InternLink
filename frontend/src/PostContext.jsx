import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const PostContext = createContext();

export function PostProvider({ children }) {
  const [posts, setPosts] = useState([]);

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

  const addPost = async (newPost) => {
    try {
      const response = await axios.post('http://localhost:3000/api/posts', newPost);
      setPosts(prevPosts => [response.data, ...prevPosts]);
    } catch (error) {
      console.error('Error adding post:', error);
    }
  };

  const deletePost = async (postId) => {
    try {
      await axios.delete(`http://localhost:3000/api/posts/${postId}`);
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const updatePost = async (updatedPost) => {
    try {
      const response = await axios.put(`http://localhost:3000/api/posts/${updatedPost.id}`, updatedPost);
      setPosts(prevPosts => prevPosts.map(post =>
        post.id === updatedPost.id ? response.data : post
      ));
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  const likePost = async (postId, userId) => {
    try {
      const response = await axios.post(`http://localhost:3000/api/posts/${postId}/like`, { userId });
      setPosts(prevPosts => prevPosts.map(post =>
        post.id === postId ? { ...post, ...response.data } : post
      ));
      return response.data;
    } catch (error) {
      console.error('Error liking post:', error);
      throw error;
    }
  };

  return (
    <PostContext.Provider value={{ posts, addPost, deletePost, updatePost, fetchPosts, likePost }}>
      {children}
    </PostContext.Provider>
  );
}

export function usePosts() {
  return useContext(PostContext);
}
