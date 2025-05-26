// frontend/src/components/comments/CommentForm.js
import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { AnonymousContext } from '../../context/AnonymousContext';

const CommentForm = ({ postId, parentCommentId = null, addComment }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const { anonymousId, storeDeletionToken } = useContext(AnonymousContext);
  
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Comment cannot be empty');
      return;
    }
    
    try {
      setSubmitting(true);
      
      const res = await axios.post('/api/comments', {
        content,
        postId,
        parentCommentId,
        anonymousId: !isAuthenticated ? anonymousId : null
      });
      
      // Store deletion token for anonymous comments
      if (res.data.deletionToken) {
        storeDeletionToken(res.data.comment._id, res.data.deletionToken);
      }
      
      // Add comment to UI
      addComment(res.data.comment);
      
      // Reset form
      setContent('');
      setError('');
      setSubmitting(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post comment');
      setSubmitting(false);
    }
  };
  
  return (
    <div className="comment-form">
      <form onSubmit={handleSubmit}>
        <textarea
          placeholder={isAuthenticated ? "Add a comment..." : "Add an anonymous comment..."}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          required
        ></textarea>
        
        {error && <div className="error">{error}</div>}
        
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={submitting}
        >
          {submitting ? 'Posting...' : 'Post Comment'}
        </button>
      </form>
    </div>
  );
};

export default CommentForm;