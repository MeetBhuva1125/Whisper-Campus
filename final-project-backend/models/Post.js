// backend/models/Post.js
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    // Can be null for anonymous posts
    required: false
  },
  anonymousId: { 
    type: String,
    // Required if no author
    required: function() { return !this.author; }
  },
  category: { 
    type: String, 
    required: true 
  },
  upvotes: [{ 
    user: String // User ID or anonymous ID
  }],
  downvotes: [{ 
    user: String // User ID or anonymous ID
  }],
  voteScore: { 
    type: Number, 
    default: 0 
  },
  deletionToken: { 
    type: String,
    // Only used for anonymous posts
    required: function() { return !this.author; }
  }
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);