const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

// Ensure a client can only review a room once
reviewSchema.index({ client: 1, room: 1 }, { unique: true })

const Review = mongoose.model('Review', reviewSchema)

module.exports = Review 