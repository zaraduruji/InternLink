import React, { createContext, useState, useContext } from 'react';

const PostContext = createContext();

export function PostProvider({ children }) {
  const [posts, setPosts] = useState([]);

  const addPost = (newPost) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  const deletePost = (postId) => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
  };

  const updatePost = (updatedPost) => {
    setPosts(prevPosts => prevPosts.map(post =>
      post.id === updatedPost.id ? updatedPost : post
    ));
  };

  return (
    <PostContext.Provider value={{ posts, addPost, deletePost, updatePost }}>
      {children}
    </PostContext.Provider>
  );
}

export function usePosts() {
  return useContext(PostContext);
}
