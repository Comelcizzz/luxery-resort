const Booking = require('../models/Booking')
const Room = require('../models/Room')

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private
exports.getBookings = async (req, res, next) => {
  try {
    let query

    // If client is not admin, show only their bookings
    if (req.client.role !== 'admin') {
      query = Booking.find({ client: req.client.id })
    } else {
      query = Booking.find()
    }

    // Add pagination
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 10
    const startIndex = (page - 1) * limit
    const endIndex = page * limit

    // Get total count before pagination
    const total = await Booking.countDocuments(req.client.role !== 'admin' ? { client: req.client.id } : {})

    query = query.skip(startIndex).limit(limit)

    // Populate with room details
    query = query.populate({
      path: 'room',
      select: 'name pricePerNight type capacity images'
    })

    // Execute query
    const bookings = await query

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
      data: bookings
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate({
      path: 'room',
      select: 'name pricePerNight type capacity images'
    })

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      })
    }

    // Make sure booking belongs to user or user is admin
    if (booking.client.toString() !== req.client.id && req.client.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this booking'
      })
    }

    res.status(200).json({
      success: true,
      data: booking
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res, next) => {
  try {
    const { checkInDate, checkOutDate, guests, roomId } = req.body

    // Check if room exists
    const room = await Room.findById(roomId)
    
    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Room not found'
      })
    }

    // Check if room is available for the selected dates
    const conflictBooking = await Booking.findOne({
      room: roomId,
      $or: [
        { 
          checkInDate: { $lte: new Date(checkOutDate) },
          checkOutDate: { $gte: new Date(checkInDate) }
        }
      ],
      status: { $in: ['confirmed', 'pending'] }
    })

    if (conflictBooking) {
      return res.status(400).json({
        success: false,
        error: 'Room is not available for the selected dates'
      })
    }

    // Calculate total price
    const checkIn = new Date(checkInDate)
    const checkOut = new Date(checkOutDate)
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))
    const totalPrice = nights * room.pricePerNight

    // Create booking
    const booking = await Booking.create({
      checkInDate,
      checkOutDate,
      guests,
      totalPrice,
      room: roomId,
      client: req.client.id,
      status: 'pending'
    })

    res.status(201).json({
      success: true,
      data: booking
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Update booking status
// @route   PUT /api/bookings/:id
// @access  Private
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body

    const booking = await Booking.findById(req.params.id)

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      })
    }

    // Check if user is admin or booking belongs to user
    if (req.client.role !== 'admin' && booking.client.toString() !== req.client.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this booking'
      })
    }

    // Only admin can confirm or cancel bookings
    if (status === 'confirmed' && req.client.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Only admin can confirm bookings'
      })
    }

    booking.status = status
    await booking.save()

    res.status(200).json({
      success: true,
      data: booking
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Delete booking
// @route   DELETE /api/bookings/:id
// @access  Private
exports.deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      })
    }

    // Check if user is admin or booking belongs to user
    if (req.client.role !== 'admin' && booking.client.toString() !== req.client.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to delete this booking'
      })
    }

    await booking.deleteOne()

    res.status(200).json({
      success: true,
      data: {}
    })
  } catch (error) {
    next(error)
  }
} 