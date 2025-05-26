// frontend/src/components/comments/CommentItem.js
import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { AnonymousContext } from '../../context/AnonymousContext';
import VoteButtons from '../common/VoteButton';
import CommentForm from './CommentForm';

const CommentItem = ({ comment, postId }) => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const { anonymousId, getDeletionToken } = useContext(AnonymousContext);
  
  const [replies, setReplies] = useState([]);
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loadingReplies, setLoadingReplies] = useState(false);
  
  const fetchReplies = async () => {
    if (!showReplies && replies.length === 0) {
      try {
        setLoadingReplies(true);
        const res = await axios.get(`/api/comments/${comment._id}/replies`);
        setReplies(res.data);
        setLoadingReplies(false);
      } catch (err) {
        console.error('Error fetching replies:', err);
        setLoadingReplies(false);
      }
    }
    setShowReplies(!showReplies);
  };
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const handleDelete = async () => {
    try {
      const deletionToken = getDeletionToken(comment._id);
      
      await axios.delete(`/api/comments/${comment._id}`, { 
        data: { deletionToken } 
      });
      
      // Reload page after successful deletion
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete comment');
    }
  };
  
  const canDelete = () => {
    if (isAuthenticated && user && comment.author && user.id === comment.author._id) {
      return true;
    }
    if (!comment.author && getDeletionToken(comment._id)) {
      return true;
    }
    return false;
  };
  
  const addReply = (newReply) => {
    setReplies([...replies, newReply]);
    setShowReplyForm(false);
    setShowReplies(true);
  };
  
  return (
    <div className="comment-item">
      <div className="comment-votes">
        <VoteButtons
          contentId={comment._id}
          contentType="comment"
          voteScore={comment.voteScore}
          upvotes={comment.upvotes}
          downvotes={comment.downvotes}
        />
      </div>
      
      <div className="comment-content">
        <div className="comment-header">
          <span className="comment-author">
            {comment.author ? comment.author.username : 'Anonymous'}
          </span>
          <span className="comment-date">{formatDate(comment.createdAt)}</span>
        </div>
        
        <div className="comment-text">
          {comment.isDeleted ? '[deleted]' : comment.content}
        </div>
        
        <div className="comment-actions">
          {!comment.isDeleted && (
            <button 
              className="btn-reply" 
              onClick={() => setShowReplyForm(!showReplyForm)}
            >
              Reply
            </button>
          )}
          
          {replies.length > 0 || !comment.isDeleted ? (
            <button 
              className="btn-show-replies" 
              onClick={fetchReplies}
            >
              {showReplies 
                ? `Hide Replies (${replies.length})` 
                : `Show Replies (${replies.length})`
              }
            </button>
          ) : null}
          
          {canDelete() && !comment.isDeleted && (
            <>
              {!showDeleteConfirm ? (
                <button 
                  className="btn-delete" 
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Delete
                </button>
              ) : (
                <div className="delete-confirm">
                  <button onClick={handleDelete} className="btn-confirm">Yes</button>
                  <button 
                    onClick={() => setShowDeleteConfirm(false)} 
                    className="btn-cancel"
                  >
                    No
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        
        {error && <div className="error">{error}</div>}
        
        {showReplyForm && !comment.isDeleted && (
          <div className="reply-form">
            <CommentForm 
              postId={postId} 
              parentCommentId={comment._id}
              addComment={addReply}
            />
          </div>
        )}
        
        {showReplies && (
          <div className="replies">
            {loadingReplies ? (
              <div className="loading">Loading replies...</div>
            ) : replies.length > 0 ? (
              replies.map(reply => (
                <CommentItem 
                  key={reply._id} 
                  comment={reply} 
                  postId={postId}
                />
              ))
            ) : (
              <div className="no-replies">No replies yet</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentItem;