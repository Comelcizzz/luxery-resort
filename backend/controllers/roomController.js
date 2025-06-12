const Room = require('../models/Room')

// @desc    Get all rooms with pagination and filtering
// @route   GET /api/rooms
// @access  Public
exports.getRooms = async (req, res, next) => {
  try {
    // Copy req.query
    const reqQuery = { ...req.query }
    
    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit', 'search']
    
    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param])
    
    // Create query string
    let queryStr = JSON.stringify(reqQuery)
    
    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`)
    
    // Finding resource
    let query = Room.find(JSON.parse(queryStr))
    
    // Search by name or description
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i')
      query = query.find({
        $or: [
          { name: searchRegex },
          { description: searchRegex }
        ]
      })
    }
    
    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ')
      query = query.select(fields)
    }
    
    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ')
      query = query.sort(sortBy)
    } else {
      query = query.sort('-createdAt')
    }
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 10
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    
    // Get total count before pagination
    const total = await Room.countDocuments(JSON.parse(queryStr))
    
    query = query.skip(startIndex).limit(limit)
    
    // Executing query
    const rooms = await query
    
    // Pagination result
    const pagination = {}
    
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      }
    }
    
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      }
    }
    
    res.status(200).json({
      success: true,
      count: total,
      pagination,
      data: rooms
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'An error occurred while fetching the list of rooms. Please try again later.'
    })
  }
}

// @desc    Get single room
// @route   GET /api/rooms/:id
// @access  Public
exports.getRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id)
    
    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Room not found.'
      })
    }
    
    res.status(200).json({
      success: true,
      data: room
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'An error occurred while fetching the room information. Please try again later.'
    })
  }
}

// @desc    Create new room
// @route   POST /api/rooms
// @access  Private (Admin)
exports.createRoom = async (req, res, next) => {
  try {
    const room = await Room.create(req.body)
    
    res.status(201).json({
      success: true,
      data: room
    })
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'A room with this number already exists. Please choose another room number.'
      })
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message)
      return res.status(400).json({
        success: false,
        error: messages.join('. ')
      })
    }

    res.status(500).json({
      success: false,
      error: 'An error occurred while creating the room. Please check your input and try again.'
    })
  }
}

// @desc    Update room
// @route   PUT /api/rooms/:id
// @access  Private (Admin)
exports.updateRoom = async (req, res, next) => {
  try {
    let room = await Room.findById(req.params.id)
    
    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Room not found.'
      })
    }
    
    room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
    
    res.status(200).json({
      success: true,
      data: room
    })
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'A room with this number already exists. Please choose another room number.'
      })
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message)
      return res.status(400).json({
        success: false,
        error: messages.join('. ')
      })
    }

    res.status(500).json({
      success: false,
      error: 'An error occurred while updating the room. Please check your input and try again.'
    })
  }
}

// @desc    Delete room
// @route   DELETE /api/rooms/:id
// @access  Private (Admin)
exports.deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id)
    
    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Room not found.'
      })
    }
    
    await room.deleteOne()
    
    res.status(200).json({
      success: true,
      data: {}
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'An error occurred while deleting the room. Please try again later.'
    })
  }
} 