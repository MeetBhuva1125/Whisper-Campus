// backend/routes/posts.js
const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const auth = require('../../final-project-backend/middleware/auth');
const { v4: uuidv4 } = require('uuid');

// Get all posts with pagination
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category } = req.query;
    const query = category ? { category } : {};
    
    const posts = await Post.find(query)
      .sort({ voteScore: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('author', 'username');
      
    const count = await Post.countDocuments(query);
    
    res.json({
      posts,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username');
    
    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a post (both anonymous and authenticated)
router.post('/', async (req, res) => {
  try {
    const { title, content, category, anonymousId } = req.body;
    
    // Generate deletion token for anonymous posts
    const deletionToken = anonymousId ? uuidv4() : null;
    
    // Check if user is authenticated
    let author = null;
    if (req.headers.authorization) {
      const authResult = await auth(req);
      if (authResult.user) {
        author = authResult.user.id;
      }
    }
    
    const newPost = new Post({
      title,
      content,
      category,
      author,
      anonymousId: author ? null : (anonymousId || uuidv4()),
      deletionToken
    });
    
    const savedPost = await newPost.save();
    
    // If anonymous post, return the deletion token
    const response = {
      post: savedPost,
      ...(deletionToken && { deletionToken })
    };
    
    res.status(201).json(response);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update post vote
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
    
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    // Remove existing votes by this user
    post.upvotes = post.upvotes.filter(vote => vote.user !== voterId);
    post.downvotes = post.downvotes.filter(vote => vote.user !== voterId);
    
    // Add new vote if not removing
    if (voteType === 'upvote') {
      post.upvotes.push({ user: voterId });
    } else if (voteType === 'downvote') {
      post.downvotes.push({ user: voterId });
    }
    
    // Update vote score
    post.voteScore = post.upvotes.length - post.downvotes.length;
    
    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete post
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { deletionToken } = req.body;
    
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    // Check if user is authorized to delete
    let isAuthorized = false;
    
    // If authenticated user
    if (req.headers.authorization) {
      const authResult = await auth(req);
      if (authResult.user) {
        // User is either the author or an admin
        if (
          (post.author && post.author.toString() === authResult.user.id) || 
          authResult.user.isAdmin
        ) {
          isAuthorized = true;
        }
      }
    }
    
    // If anonymous post with correct deletion token
    if (!isAuthorized && deletionToken && post.deletionToken === deletionToken) {
      isAuthorized = true;
    }
    
    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }
    
    await Post.findByIdAndDelete(id);
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;



