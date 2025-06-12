const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')

// Load env vars
dotenv.config()

// Create Express app
const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/resort_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Connection Error:', err))

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/rooms', require('./routes/rooms'))
app.use('/api/bookings', require('./routes/bookings'))
app.use('/api/services', require('./routes/services'))
app.use('/api/service-orders', require('./routes/serviceOrders'))
app.use('/api/reviews', require('./routes/reviews'))
app.use('/api/clients', require('./routes/clients'))

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    success: false,
    error: err.message || 'Server Error'
  })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
}) 