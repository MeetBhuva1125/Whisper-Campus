// frontend/src/pages/PostDetail.js
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { AnonymousContext } from '../context/AnonymousContext';
import CommentForm from '../components/comments/CommentForm';
import CommentItem from '../components/comments/CommentItem';
import VoteButtons from '../components/common/VoteButton';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useContext(AuthContext);
  const { anonymousId, getDeletionToken } = useContext(AnonymousContext);
  
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortOption, setSortOption] = useState('top');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  useEffect(() => {
    const fetchPostAndComments = async () => {
      try {
        setLoading(true);
        
        // Fetch post
        const postRes = await axios.get(`/api/posts/${id}`);
        setPost(postRes.data);
        
        // Fetch comments
        const commentsRes = await axios.get(`/api/comments/post/${id}?sort=${sortOption}`);
        setComments(commentsRes.data);
        
        setLoading(false);
      } catch (err) {
        setError('Post not found');
        setLoading(false);
      }
    };
    
    fetchPostAndComments();
  }, [id, sortOption]);
  
  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };
  
  const handleDeletePost = async () => {
    try {
      const deletionToken = getDeletionToken(post._id);
      
      await axios.delete(`/api/posts/${post._id}`, { 
        data: { deletionToken } 
      });
      
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete post');
    }
  };
  
  const canDelete = () => {
    if (!post) return false;
    
    if (isAuthenticated && user && post.author && user.id === post.author._id) {
      return true;
    }
    if (!post.author && getDeletionToken(post._id)) {
      return true;
    }
    return false;
  };
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const addComment = (newComment) => {
    setComments([...comments, newComment]);
  };
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  if (error) {
    return <div className="error">{error}</div>;
  }
  
  return (
    <div className="post-detail">
      {post && (
        <>
          <div className="post-header">
            <div className="post-votes">
              <VoteButtons
                contentId={post._id}
                contentType="post"
                voteScore={post.voteScore}
                upvotes={post.upvotes}
                downvotes={post.downvotes}
              />
            </div>
            
            <div className="post-info">
              <h1 className="post-title">{post.title}</h1>
              
              <div className="post-meta">
                <span className="post-category">{post.category}</span>
                <span className="post-author">
                  {post.author ? post.author.username : 'Anonymous'}
                </span>
                <span className="post-date">{formatDate(post.createdAt)}</span>
                
                {canDelete() && (
                  <div className="post-actions">
                    {!showDeleteConfirm ? (
                      <button 
                        className="btn-delete" 
                        onClick={() => setShowDeleteConfirm(true)}
                      >
                        Delete Post
                      </button>
                    ) : (
                      <div className="delete-confirm">
                        <p>Are you sure?</p>
                        <button onClick={handleDeletePost} className="btn-confirm">Yes</button>
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
              </div>
            </div>
          </div>
          
          <div className="post-body">
            <p>{post.content}</p>
          </div>
          
          <div className="comments-section">
            <div className="comments-header">
              <h3>{comments.length} Comment{comments.length !== 1 ? 's' : ''}</h3>
              
              <div className="sort-options">
                <label htmlFor="sort">Sort by:</label>
                <select id="sort" value={sortOption} onChange={handleSortChange}>
                  <option value="top">Top</option>
                  <option value="new">Newest</option>
                  <option value="old">Oldest</option>
                </select>
              </div>
            </div>
            
            <CommentForm postId={post._id} addComment={addComment} />
            
            <div className="comments-list">
              {comments.length > 0 ? (
                comments.map(comment => (
                  <CommentItem 
                    key={comment._id} 
                    comment={comment} 
                    postId={post._id}
                  />
                ))
              ) : (
                <div className="no-comments">No comments yet. Be the first to comment!</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PostDetail;