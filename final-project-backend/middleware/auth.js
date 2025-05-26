// backend/middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
  try {
    // Check for token in header
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      if (next) {
        return next(); // Allow anonymous access
      } else {
        return { authenticated: false };
      }
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user to request
    req.user = decoded;
    
    if (next) {
      next();
    } else {
      return { authenticated: true, user: decoded };
    }
  } catch (err) {
    if (next) {
      return res.status(401).json({ message: 'Invalid token, authorization denied' });
    } else {
      return { authenticated: false };
    }
  }
};