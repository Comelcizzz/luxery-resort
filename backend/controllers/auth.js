const Client = require('../models/Client')

// @desc    Register client
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body

    // Create client
    const client = await Client.create({
      firstName,
      lastName,
      email,
      phone,
      password
    })

    sendTokenResponse(client, 201, res)
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    })
  }
}

// @desc    Login client
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
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
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    })
  }
}

// @desc    Get current logged in client
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const client = await Client.findById(req.client.id)

    res.status(200).json({
      success: true,
      data: client
    })
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    })
  }
}

// Get token from model, create cookie and send response
const sendTokenResponse = (client, statusCode, res) => {
  // Create token
  const token = client.getSignedJwtToken()

  res.status(statusCode).json({
    success: true,
    token
  })
} 