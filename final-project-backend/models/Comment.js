// backend/models/Comment.js
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: { 
    type: String, 
    required: true 
  },
  post: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Post', 
    required: true 
  },
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    // Can be null for anonymous comments
    required: false
  },
  anonymousId: { 
    type: String,
    // Required if no author
    required: function() { return !this.author; }
  },
  parentComment: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Comment',
    // For nested comments
    default: null
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
  isDeleted: { 
    type: Boolean, 
    default: false 
  },
  deletionToken: { 
    type: String,
    // Only used for anonymous comments
    required: function() { return !this.author; }
  }
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);