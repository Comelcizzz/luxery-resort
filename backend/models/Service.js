const mongoose = require('mongoose')

const ServiceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a service name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Please specify a category'],
    enum: ['spa', 'dining', 'activities', 'transportation', 'other']
  },
  duration: {
    type: Number,
    required: [true, 'Please specify duration in minutes']
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  image: {
    type: String
  },
  url: {
    type: String,
    default: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&q=80&w=2070'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Service', ServiceSchema) 