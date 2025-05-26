// frontend/src/context/AnonymousContext.js
import React, { createContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const AnonymousContext = createContext();

export const AnonymousProvider = ({ children }) => {
  const [anonymousId, setAnonymousId] = useState('');
  
  // Create a persistent anonymous ID for non-logged in users
  useEffect(() => {
    const storedId = localStorage.getItem('anonymousId');
    if (storedId) {
      setAnonymousId(storedId);
    } else {
      const newId = uuidv4();
      localStorage.setItem('anonymousId', newId);
      setAnonymousId(newId);
    }
  }, []);
  
  // Store deletion tokens for anonymous posts/comments
  const storeDeletionToken = (contentId, token) => {
    const tokens = JSON.parse(localStorage.getItem('deletionTokens') || '{}');
    tokens[contentId] = token;
    localStorage.setItem('deletionTokens', JSON.stringify(tokens));
  };
  
  // Get deletion token for a post/comment
  const getDeletionToken = (contentId) => {
    const tokens = JSON.parse(localStorage.getItem('deletionTokens') || '{}');
    return tokens[contentId] || null;
  };
  
  return (
    <AnonymousContext.Provider
      value={{
        anonymousId,
        storeDeletionToken,
        getDeletionToken
      }}
    >
      {children}
    </AnonymousContext.Provider>
  );
};