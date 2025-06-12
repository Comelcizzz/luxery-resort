const ServiceOrder = require('../models/ServiceOrder')
const Service = require('../models/Service')

// @desc    Get all service orders
// @route   GET /api/service-orders
// @access  Private
exports.getServiceOrders = async (req, res, next) => {
  try {
    let query

    // If client is not admin, show only their service orders
    if (req.client.role !== 'admin') {
      query = ServiceOrder.find({ client: req.client.id })
    } else {
      query = ServiceOrder.find()
    }

    // Add pagination
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 10
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const total = await ServiceOrder.countDocuments()

    query = query.skip(startIndex).limit(limit)

    // Populate with service details
    query = query.populate({
      path: 'service',
      select: 'name price description images duration'
    })

    // Execute query
    const serviceOrders = await query

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
      count: serviceOrders.length,
      pagination,
      data: serviceOrders
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get single service order
// @route   GET /api/service-orders/:id
// @access  Private
exports.getServiceOrder = async (req, res, next) => {
  try {
    const serviceOrder = await ServiceOrder.findById(req.params.id).populate({
      path: 'service',
      select: 'name price description images duration'
    })

    if (!serviceOrder) {
      return res.status(404).json({
        success: false,
        error: 'Service order not found'
      })
    }

    // Make sure service order belongs to user or user is admin
    if (serviceOrder.client.toString() !== req.client.id && req.client.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this service order'
      })
    }

    res.status(200).json({
      success: true,
      data: serviceOrder
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Create new service order
// @route   POST /api/service-orders
// @access  Private
exports.createServiceOrder = async (req, res, next) => {
  try {
    const { serviceId, appointmentDate, quantity, specialRequests } = req.body

    // Check if service exists
    const service = await Service.findById(serviceId)
    
    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      })
    }

    // Calculate total price
    const totalPrice = service.price * quantity

    // Create service order
    const serviceOrder = await ServiceOrder.create({
      service: serviceId,
      client: req.client.id,
      appointmentDate,
      quantity,
      totalPrice,
      specialRequests,
      status: 'pending'
    })

    res.status(201).json({
      success: true,
      data: serviceOrder
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Update service order status
// @route   PUT /api/service-orders/:id
// @access  Private
exports.updateServiceOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body

    const serviceOrder = await ServiceOrder.findById(req.params.id)

    if (!serviceOrder) {
      return res.status(404).json({
        success: false,
        error: 'Service order not found'
      })
    }

    // Check if user is admin or service order belongs to user
    if (req.client.role !== 'admin' && serviceOrder.client.toString() !== req.client.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this service order'
      })
    }

    // Only admin can confirm or cancel service orders
    if (status === 'confirmed' && req.client.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Only admin can confirm service orders'
      })
    }

    serviceOrder.status = status
    await serviceOrder.save()

    res.status(200).json({
      success: true,
      data: serviceOrder
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Delete service order
// @route   DELETE /api/service-orders/:id
// @access  Private
exports.deleteServiceOrder = async (req, res, next) => {
  try {
    const serviceOrder = await ServiceOrder.findById(req.params.id)

    if (!serviceOrder) {
      return res.status(404).json({
        success: false,
        error: 'Service order not found'
      })
    }

    // Check if user is admin or service order belongs to user
    if (req.client.role !== 'admin' && serviceOrder.client.toString() !== req.client.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to delete this service order'
      })
    }

    await serviceOrder.deleteOne()

    res.status(200).json({
      success: true,
      data: {}
    })
  } catch (error) {
    next(error)
  }
} 