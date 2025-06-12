const mongoose = require('mongoose')

const RoomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: [true, 'Please add a room number'],
    unique: true,
    trim: true
  },
  name: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Please specify room type'],
    enum: ['single', 'double', 'luxury'],
    default: 'single'
  },
  pricePerNight: {
    type: Number,
    required: [true, 'Please add price per night']
  },
  capacity: {
    type: Number,
    required: [true, 'Please specify room capacity'],
    min: [1, 'Capacity must be at least 1'],
    max: [10, 'Capacity cannot be more than 10']
  },
  status: {
    type: String,
    enum: ['available', 'booked', 'maintenance'],
    default: 'available'
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  amenities: [{
    type: String
  }],
  images: [{
    type: String
  }],
  url: {
    type: String,
    default: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=1974'
  },
  rating: {
    type: Number,
    default: 0
  },
  numReviews: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Virtual field to maintain backward compatibility with frontend
RoomSchema.virtual('maxOccupancy').get(function() {
  return this.capacity
})

module.exports = mongoose.model('Room', RoomSchema) 