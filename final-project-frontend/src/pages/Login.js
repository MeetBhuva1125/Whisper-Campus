// frontend/src/pages/Login.js
import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { email, password } = formData;
  
  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const onSubmit = async e => {
    e.preventDefault();
    
    setLoading(true);
    const result = await login(formData);
    setLoading(false);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
  };
  
  return (
    <div className="auth-form">
      <h2>Login</h2>
      
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={onChange}
            placeholder="Enter your email"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={onChange}
            placeholder="Enter your password"
            required
          />
        </div>
        
        {error && <div className="error">{error}</div>}
        
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      <div className="auth-switch">
        <p>Don't have an account? <Link to="/register">Register</Link></p>
      </div>
      
      <div className="anonymous-note">
        <p>
          Note: You can browse and post on the forum without logging in.
          Just head back to the <Link to="/">home page</Link>.
        </p>
      </div>
    </div>
  );
};

export default Login;