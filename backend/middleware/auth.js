const jwt = require('jsonwebtoken')
const Client = require('../models/Client')

// Protect routes
exports.protect = async (req, res, next) => {
  let token

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1]
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    })
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    req.client = await Client.findById(decoded.id)

    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    })
  }
}

// Check if user is admin
exports.isAdmin = (req, res, next) => {
  if (req.client && req.client.role === 'admin') {
    next()
  } else {
    return res.status(403).json({
      success: false,
      error: 'Access denied: Admin rights required'
    })
  }
}

// Check if user is staff
exports.isStaff = (req, res, next) => {
  if (req.client && req.client.role === 'staff') {
    next()
  } else {
    return res.status(403).json({
      success: false,
      error: 'Access denied: Staff rights required'
    })
  }
}

// Check if user is admin or staff
exports.isAdminOrStaff = (req, res, next) => {
  if (req.client && (req.client.role === 'admin' || req.client.role === 'staff')) {
    next()
  } else {
    return res.status(403).json({
      success: false,
      error: 'Access denied: Admin or staff rights required'
    })
  }
} 