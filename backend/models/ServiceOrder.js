const mongoose = require('mongoose')

const ServiceOrderSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.ObjectId,
    ref: 'Client',
    required: true
  },
  service: {
    type: mongoose.Schema.ObjectId,
    ref: 'Service',
    required: true
  },
  quantity: {
    type: Number,
    required: [true, 'Please specify quantity'],
    min: [1, 'Quantity must be at least 1']
  },
  appointmentDate: {
    type: Date,
    required: [true, 'Please specify service date']
  },
  totalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  specialRequests: {
    type: String,
    maxlength: [500, 'Special requests cannot be more than 500 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

// Calculate total price before saving
ServiceOrderSchema.pre('save', async function(next) {
  if (!this.isModified('quantity')) {
    return next()
  }

  const Service = mongoose.model('Service')
  const service = await Service.findById(this.service)
  
  this.totalPrice = service.price * this.quantity
})

module.exports = mongoose.model('ServiceOrder', ServiceOrderSchema) 