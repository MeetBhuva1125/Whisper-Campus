// frontend/src/components/layout/Navbar.js
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  
  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="logo">College Forum</Link>
        
        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/create-post" className="nav-link">Create Post</Link>
          
          {isAuthenticated ? (
            <>
              <span className="welcome">Welcome, {user.username}</span>
              <button onClick={logout} className="btn-logout">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;