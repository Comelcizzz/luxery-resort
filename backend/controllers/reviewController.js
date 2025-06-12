const Review = require('../models/Review')
const Room = require('../models/Room')

// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Public
exports.getReviews = async (req, res, next) => {
  try {
    // Pagination
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 10
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    
    let query = {}
    
    // Filter by roomId if provided
    if (req.query.roomId) {
      query.room = req.query.roomId
    }
    
    const total = await Review.countDocuments(query)
    
    // Execute query with pagination
    const reviews = await Review.find(query)
      .populate({
        path: 'client',
        select: 'firstName lastName'
      })
      .skip(startIndex)
      .limit(limit)
      .sort({ createdAt: -1 })
    
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
      count: reviews.length,
      pagination,
      data: reviews
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get single review
// @route   GET /api/reviews/:id
// @access  Public
exports.getReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id).populate({
      path: 'client',
      select: 'firstName lastName'
    })
    
    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      })
    }
    
    res.status(200).json({
      success: true,
      data: review
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Create new review
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res, next) => {
  try {
    const { roomId, rating, comment } = req.body
    
    // Check if room exists
    const room = await Room.findById(roomId)
    
    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Room not found'
      })
    }
    
    // Check if user already reviewed this room
    const existingReview = await Review.findOne({
      client: req.client.id,
      room: roomId
    })
    
    if (existingReview) {
      return res.status(400).json({
        success: false,
        error: 'You have already reviewed this room'
      })
    }
    
    // Create review
    const review = await Review.create({
      rating,
      comment,
      room: roomId,
      client: req.client.id
    })
    
    // Update room average rating
    await updateRoomRating(roomId)
    
    // Fetch complete review with client details
    const populatedReview = await Review.findById(review._id).populate({
      path: 'client',
      select: 'firstName lastName'
    })
    
    res.status(201).json({
      success: true,
      data: populatedReview
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = async (req, res, next) => {
  try {
    let review = await Review.findById(req.params.id)
    
    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      })
    }
    
    // Check if review belongs to user
    if (review.client.toString() !== req.client.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this review'
      })
    }
    
    // Update review
    review = await Review.findByIdAndUpdate(
      req.params.id,
      { rating: req.body.rating, comment: req.body.comment },
      { new: true, runValidators: true }
    )
    
    // Update room average rating
    await updateRoomRating(review.room)
    
    res.status(200).json({
      success: true,
      data: review
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id)
    
    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      })
    }
    
    // Check if review belongs to user or user is admin
    if (review.client.toString() !== req.client.id && req.client.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to delete this review'
      })
    }
    
    const roomId = review.room
    
    await review.deleteOne()
    
    // Update room average rating
    await updateRoomRating(roomId)
    
    res.status(200).json({
      success: true,
      data: {}
    })
  } catch (error) {
    next(error)
  }
}

// Helper function to update room average rating
const updateRoomRating = async (roomId) => {
  const reviews = await Review.find({ room: roomId })
  
  if (reviews.length === 0) {
    await Room.findByIdAndUpdate(roomId, {
      rating: 0,
      numReviews: 0
    })
    return
  }
  
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
  const avgRating = totalRating / reviews.length
  
  await Room.findByIdAndUpdate(roomId, {
    rating: avgRating.toFixed(1),
    numReviews: reviews.length
  })
}

// Get reviews for a specific room
exports.getRoomReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ room: req.params.roomId })
      .populate({
        path: 'client',
        select: 'firstName lastName'
      })
    
    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    })
  }
} 