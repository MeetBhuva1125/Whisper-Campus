// frontend/src/components/common/VoteButtons.js
import React, { useContext, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { AnonymousContext } from '../../context/AnonymousContext';

const VoteButtons = ({ contentId, contentType, voteScore, upvotes, downvotes }) => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const { anonymousId } = useContext(AnonymousContext);
  const [score, setScore] = useState(voteScore);
  const [userVote, setUserVote] = useState(() => {
    const voterId = isAuthenticated ? user?.id : anonymousId;
    if (upvotes.some(vote => vote.user === voterId)) {
      return 'upvote';
    } else if (downvotes.some(vote => vote.user === voterId)) {
      return 'downvote';
    }
    return null;
  });
  
  const handleVote = async (voteType) => {
    try {
      const voterId = isAuthenticated ? user.id : anonymousId;
      
      // If already voted the same way, remove vote
      const newVoteType = userVote === voteType ? 'remove' : voteType;
      
      const url = contentType === 'post' 
        ? `/api/posts/${contentId}/vote` 
        : `/api/comments/${contentId}/vote`;
      
      const res = await axios.patch(url, { voteType: newVoteType, voterId });
      
      setScore(res.data.voteScore);
      setUserVote(newVoteType === 'remove' ? null : newVoteType);
    } catch (err) {
      console.error('Vote failed:', err);
    }
  };
  
  return (
    <div className="vote-buttons">
      <button 
        className={`vote-btn upvote ${userVote === 'upvote' ? 'active' : ''}`}
        onClick={() => handleVote('upvote')}
        aria-label="Upvote"
      >
        ▲
      </button>
      
      <span className="vote-score">{score}</span>
      
      <button 
        className={`vote-btn downvote ${userVote === 'downvote' ? 'active' : ''}`}
        onClick={() => handleVote('downvote')}
        aria-label="Downvote"
      >
        ▼
      </button>
    </div>
  );
};

export default VoteButtons;