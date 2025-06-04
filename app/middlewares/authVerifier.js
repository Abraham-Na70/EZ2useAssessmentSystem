const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false,
      message: 'Access denied. No token provided.' 
    });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false,
      message: 'Invalid token.' 
    });
  }
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ 
      success: false,
      message: 'Access denied. Admin role required.' 
    });
  }
};

// Middleware to check if user is assessor
const isAssessor = (req, res, next) => {
  if (req.user && (req.user.role === 'assessor' || req.user.role === 'admin')) {
    next();
  } else {
    return res.status(403).json({ 
      success: false,
      message: 'Access denied. Assessor role required.' 
    });
  }
};

// Middleware to check if user is either admin or assessor
const isAdminOrAssessor = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'assessor')) {
    next();
  } else {
    return res.status(403).json({ 
      success: false,
      message: 'Access denied. Insufficient permissions.' 
    });
  }
};

module.exports = {
  verifyToken,
  isAdmin,
  isAssessor,
  isAdminOrAssessor
};