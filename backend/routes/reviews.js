const express = require('express')
const router = express.Router()
const {
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  getRoomReviews
} = require('../controllers/reviewController')

const { protect } = require('../middleware/auth')

router.route('/')
  .get(getReviews)
  .post(protect, createReview)

router.route('/:id')
  .get(getReview)
  .put(protect, updateReview)
  .delete(protect, deleteReview)

router.get('/room/:roomId', getRoomReviews)

module.exports = router 