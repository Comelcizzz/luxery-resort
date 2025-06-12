const Service = require('../models/Service')

// @desc    Get all services
// @route   GET /api/services
// @access  Public
exports.getServices = async (req, res, next) => {
  try {
    // Pagination
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 10
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    
    // Search functionality
    let query = {}
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i')
      query = {
        $or: [
          { name: searchRegex },
          { description: searchRegex }
        ]
      }
    }
    
    // Get total count before pagination
    const total = await Service.countDocuments(query)
    
    // Execute query with pagination
    const services = await Service.find(query)
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
      count: total,
      pagination,
      data: services
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Public
exports.getService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id)
    
    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      })
    }
    
    res.status(200).json({
      success: true,
      data: service
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Create new service
// @route   POST /api/services
// @access  Private (Admin)
exports.createService = async (req, res, next) => {
  try {
    const service = await Service.create(req.body)
    
    res.status(201).json({
      success: true,
      data: service
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private (Admin)
exports.updateService = async (req, res, next) => {
  try {
    let service = await Service.findById(req.params.id)
    
    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      })
    }
    
    service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
    
    res.status(200).json({
      success: true,
      data: service
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private (Admin)
exports.deleteService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id)
    
    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      })
    }
    
    await service.deleteOne()
    
    res.status(200).json({
      success: true,
      data: {}
    })
  } catch (error) {
    next(error)
  }
} 