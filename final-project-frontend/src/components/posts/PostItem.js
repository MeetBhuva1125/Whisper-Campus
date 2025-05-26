// frontend/src/components/posts/PostItem.js
import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { AnonymousContext } from '../../context/AnonymousContext';
import VoteButtons from '../common/VoteButton';

const PostItem = ({ post }) => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const { anonymousId, getDeletionToken } = useContext(AnonymousContext);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState('');
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const handleDelete = async () => {
    try {
      const voterId = isAuthenticated ? user.id : anonymousId;
      const deletionToken = getDeletionToken(post._id);
      
      await axios.delete(`/api/posts/${post._id}`, { 
        data: { deletionToken } 
      });
      
      // Reload page after successful deletion
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete post');
    }
  };
  
  const canDelete = () => {
    if (isAuthenticated && user && post.author && user.id === post.author._id) {
      return true;
    }
    if (!post.author && getDeletionToken(post._id)) {
      return true;
    }
    return false;
  };
  
  return (
    <div className="post-item">
      <div className="post-votes">
        <VoteButtons
          contentId={post._id}
          contentType="post"
          voteScore={post.voteScore}
          upvotes={post.upvotes}
          downvotes={post.downvotes}
        />
      </div>
      
      <div className="post-content">
        <Link to={`/post/${post._id}`} className="post-title">
          {post.title}
        </Link>
        
        <div className="post-meta">
          <span className="post-category">{post.category}</span>
          <span className="post-author">
            {post.author ? post.author.username : 'Anonymous'}
          </span>
          <span className="post-date">{formatDate(post.createdAt)}</span>
        </div>
        
        <div className="post-snippet">
          {post.content.length > 200
            ? `${post.content.substring(0, 200)}...`
            : post.content}
        </div>
        
        {canDelete() && (
          <div className="post-actions">
            {!showDeleteConfirm ? (
              <button 
                className="btn-delete" 
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete
              </button>
            ) : (
              <div className="delete-confirm">
                <p>Are you sure?</p>
                <button onClick={handleDelete} className="btn-confirm">Yes</button>
                <button 
                  onClick={() => setShowDeleteConfirm(false)} 
                  className="btn-cancel"
                >
                  No
                </button>
              </div>
            )}
          </div>
        )}
        
        {error && <div className="error">{error}</div>}
      </div>
    </div>
  );
};

export default PostItem;