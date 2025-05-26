// backend/routes/comments.js
const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const auth = require('../../final-project-backend/middleware/auth');
const { v4: uuidv4 } = require('uuid');

// Get comments for a post
router.get('/post/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const { sort = 'top' } = req.query;
    
    let sortOption = {};
    if (sort === 'top') {
      sortOption = { voteScore: -1 };
    } else if (sort === 'new') {
      sortOption = { createdAt: -1 };
    } else if (sort === 'old') {
      sortOption = { createdAt: 1 };
    }
    
    const comments = await Comment.find({ 
      post: postId,
      parentComment: null // Only get top-level comments
    })
      .sort(sortOption)
      .populate('author', 'username');
      
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get replies to a comment
router.get('/:commentId/replies', async (req, res) => {
  try {
    const { commentId } = req.params;
    
    const replies = await Comment.find({ parentComment: commentId })
      .sort({ voteScore: -1, createdAt: 1 })
      .populate('author', 'username');
      
    res.json(replies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a comment
router.post('/', async (req, res) => {
  try {
    const { content, postId, parentCommentId, anonymousId } = req.body;
    
    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    // Generate deletion token for anonymous comments
    const deletionToken = anonymousId ? uuidv4() : null;
    
    // Check if user is authenticated
    let author = null;
    if (req.headers.authorization) {
      const authResult = await auth(req);
      if (authResult.user) {
        author = authResult.user.id;
      }
    }
    
    // Create comment
    const newComment = new Comment({
      content,
      post: postId,
      parentComment: parentCommentId || null,
      author,
      anonymousId: author ? null : (anonymousId || uuidv4()),
      deletionToken
    });
    
    const savedComment = await newComment.save();
    
    // If anonymous comment, return the deletion token
    const response = {
      comment: savedComment,
      ...(deletionToken && { deletionToken })
    };
    
    res.status(201).json(response);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update comment vote
router.patch('/:id/vote', async (req, res) => {
  try {
    const { id } = req.params;
    const { voteType, voterId } = req.body;
    
    if (!voterId) {
      return res.status(400).json({ message: 'Voter ID is required' });
    }
    
    if (voteType !== 'upvote' && voteType !== 'downvote' && voteType !== 'remove') {
      return res.status(400).json({ message: 'Invalid vote type' });
    }
    
    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    
    // Remove existing votes by this user
    comment.upvotes = comment.upvotes.filter(vote => vote.user !== voterId);
    comment.downvotes = comment.downvotes.filter(vote => vote.user !== voterId);
    
    // Add new vote if not removing
    if (voteType === 'upvote') {
      comment.upvotes.push({ user: voterId });
    } else if (voteType === 'downvote') {
      comment.downvotes.push({ user: voterId });
    }
    
    // Update vote score
    comment.voteScore = comment.upvotes.length - comment.downvotes.length;
    
    const updatedComment = await comment.save();
    res.json(updatedComment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete comment (mark as deleted)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { deletionToken } = req.body;
    
    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    
    // Check if user is authorized to delete
    let isAuthorized = false;
    
    // If authenticated user
    if (req.headers.authorization) {
      const authResult = await auth(req);
      if (authResult.user) {
        // User is either the author or an admin
        if (
          (comment.author && comment.author.toString() === authResult.user.id) || 
          authResult.user.isAdmin
        ) {
          isAuthorized = true;
        }
      }
    }
    
    // If anonymous comment with correct deletion token
    if (!isAuthorized && deletionToken && comment.deletionToken === deletionToken) {
      isAuthorized = true;
    }
    
    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }
    
    // Instead of deleting, mark as deleted to maintain thread structure
    comment.isDeleted = true;
    comment.content = "[deleted]";
    await comment.save();
    
    res.json({ message: 'Comment deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;