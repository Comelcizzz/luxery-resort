const mongoose = require('mongoose')

const BookingSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.ObjectId,
    ref: 'Client',
    required: true
  },
  room: {
    type: mongoose.Schema.ObjectId,
    ref: 'Room',
    required: true
  },
  checkInDate: {
    type: Date,
    required: [true, 'Please add check-in date']
  },
  checkOutDate: {
    type: Date,
    required: [true, 'Please add check-out date']
  },
  guests: {
    type: Number,
    required: [true, 'Please specify number of guests'],
    min: [1, 'Number of guests must be at least 1']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  },
  totalPrice: {
    type: Number,
    required: true
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
BookingSchema.pre('save', async function(next) {
  if (!this.isModified('checkInDate') && !this.isModified('checkOutDate')) {
    return next()
  }

  const Room = mongoose.model('Room')
  const room = await Room.findById(this.room)
  
  const nights = Math.ceil((this.checkOutDate - this.checkInDate) / (1000 * 60 * 60 * 24))
  this.totalPrice = room.pricePerNight * nights
})

module.exports = mongoose.model('Booking', BookingSchema) 