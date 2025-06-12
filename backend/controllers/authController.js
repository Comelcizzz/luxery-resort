const Client = require('../models/Client')

// @desc    Register client
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body
    
    // Check if client already exists
    const existingClient = await Client.findOne({ email })
    if (existingClient) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered'
      })
    }
    
    // Check if this is the first user or has admin/staff email
    const isFirstUser = await Client.countDocuments() === 0
    const isAdminEmail = email.endsWith('@admin.com')
    const isStaffEmail = email.endsWith('@staff.com')
    
    // Determine role
    let role = 'user'
    if (isFirstUser || isAdminEmail) {
      role = 'admin'
    } else if (isStaffEmail) {
      role = 'staff'
    }
    
    // Create new client
    const client = await Client.create({
      firstName,
      lastName,
      email,
      phone,
      password,
      role
    })
    
    sendTokenResponse(client, 201, res)
  } catch (error) {
    next(error)
  }
}

// @desc    Login client
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    
    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an email and password'
      })
    }
    
    // Check for client
    const client = await Client.findOne({ email }).select('+password')
    
    if (!client) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      })
    }
    
    // Check if password matches
    const isMatch = await client.matchPassword(password)
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      })
    }
    
    sendTokenResponse(client, 200, res)
  } catch (error) {
    next(error)
  }
}

// @desc    Get current logged in client
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    if (!req.client) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      })
    }

    const client = await Client.findById(req.client.id)
    
    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }
    
    res.status(200).json({
      success: true,
      data: client
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Update client details
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone
    }
    
    const client = await Client.findByIdAndUpdate(req.client.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    })
    
    res.status(200).json({
      success: true,
      data: client
    })
  } catch (error) {
    next(error)
  }
}

// Get token from model, create cookie and send response
const sendTokenResponse = (client, statusCode, res) => {
  // Create token
  const token = client.getSignedJwtToken()
  
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  }
  
  if (process.env.NODE_ENV === 'production') {
    options.secure = true
  }
  
  res
    .status(statusCode)
    .json({
      success: true,
      token,
      data: {
        id: client._id,
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email,
        role: client.role
      }
    })
} 