// frontend/src/pages/CreatePost.js
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { AnonymousContext } from '../context/AnonymousContext';

const CreatePost = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);
  const { anonymousId, storeDeletionToken } = useContext(AnonymousContext);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const categories = [
    'Academic', 'Campus Life', 'Events', 'Textbooks', 'Housing', 'Course Reviews'
  ];
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim() || !category) {
      setError('All fields are required');
      return;
    }
    
    try {
      setSubmitting(true);
      
      const res = await axios.post('/api/posts', {
        title,
        content,
        category,
        anonymousId: !isAuthenticated ? anonymousId : null
      });
      
      // Store deletion token for anonymous posts
      if (res.data.deletionToken) {
        storeDeletionToken(res.data.post._id, res.data.deletionToken);
      }
      
      // Navigate to post page
      navigate(`/post/${res.data.post._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post');
      setSubmitting(false);
    }
  };
  
  return (
    <div className="create-post">
      <h2>Create New Post</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter post title"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Select a category</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            placeholder="Write your post content"
            required
          ></textarea>
        </div>
        
        {error && <div className="error">{error}</div>}
        
        <div className="submission-note">
          {isAuthenticated ? (
            <p>You're posting as a registered user.</p>
          ) : (
            <p>
              You're posting anonymously. After posting, you'll receive a token to 
              manage this post. Your browser will store this token automatically.
            </p>
          )}
        </div>
        
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={submitting}
        >
          {submitting ? 'Creating...' : 'Create Post'}
        </button>
      </form>
    </div>
  );
};

export default CreatePost;