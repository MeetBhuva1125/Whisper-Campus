// frontend/src/pages/Home.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import PostItem from '../components/posts/PostItem';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState('');
  const [categories] = useState([
    'Academic', 'Campus Life', 'Events', 'Textbooks', 'Housing', 'Course Reviews'
  ]);
  
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/posts?page=${currentPage}&category=${category}`);
        setPosts(res.data.posts);
        setTotalPages(res.data.totalPages);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, [currentPage, category]);
  
  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setCurrentPage(1);
  };
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };
  
  return (
    <div className="home-page">
      <div className="filter-section">
        <h2>College Forum</h2>
        <div className="category-filter">
          <select value={category} onChange={handleCategoryChange}>
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="posts-section">
        {loading ? (
          <div className="loading">Loading posts...</div>
        ) : posts.length > 0 ? (
          posts.map(post => (
            <PostItem key={post._id} post={post} />
          ))
        ) : (
          <div className="no-posts">No posts found. Be the first to create one!</div>
        )}
      </div>
      
      {totalPages > 1 && (
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              className={`page-btn ${currentPage === page ? 'active' : ''}`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          ))}
        </div>
      )}
      
      <div className="create-post-cta">
        <Link to="/create-post" className="btn btn-primary">Create New Post</Link>
      </div>
    </div>
  );
};

export default Home;