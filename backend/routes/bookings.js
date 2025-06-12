const express = require('express')
const { getBookings, getBooking, createBooking, updateBookingStatus, deleteBooking } = require('../controllers/bookingController')
const { protect } = require('../middleware/auth')

const router = express.Router()

// All routes require authentication
router.use(protect)

router.route('/')
  .get(getBookings)
  .post(createBooking)

router.route('/:id')
  .get(getBooking)
  .put(updateBookingStatus)
  .delete(deleteBooking)

module.exports = router 