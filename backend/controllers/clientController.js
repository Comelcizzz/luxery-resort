const Client = require('../models/Client')

// @desc    Get all clients
// @route   GET /api/clients
// @access  Private (Admin)
exports.getClients = async (req, res, next) => {
  try {
    // Add pagination
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 10
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const total = await Client.countDocuments()

    // Create query
    let query = Client.find()
      .select('-password')
      .skip(startIndex)
      .limit(limit)
      .sort('-createdAt')

    // Add search functionality
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i')
      query = query.find({
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { email: searchRegex },
          { phone: searchRegex }
        ]
      })
    }

    // Filter by role if provided
    if (req.query.role) {
      query = query.find({ role: req.query.role })
    }

    // Execute query
    const clients = await query

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
      count: clients.length,
      pagination,
      data: clients
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get single client
// @route   GET /api/clients/:id
// @access  Private (Admin)
exports.getClient = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id).select('-password')

    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found'
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

// @desc    Update client
// @route   PUT /api/clients/:id
// @access  Private (Admin)
exports.updateClient = async (req, res, next) => {
  try {
    let client = await Client.findById(req.params.id)

    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found'
      })
    }

    // Remove password field if included
    if (req.body.password) {
      delete req.body.password
    }

    client = await Client.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).select('-password')

    res.status(200).json({
      success: true,
      data: client
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Delete client
// @route   DELETE /api/clients/:id
// @access  Private (Admin)
exports.deleteClient = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id)

    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found'
      })
    }

    await client.deleteOne()

    res.status(200).json({
      success: true,
      data: {}
    })
  } catch (error) {
    next(error)
  }
} 