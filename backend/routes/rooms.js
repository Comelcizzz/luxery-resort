const express = require('express')
const { getRooms, getRoom, createRoom, updateRoom, deleteRoom } = require('../controllers/roomController')
const { protect, isAdmin, isAdminOrStaff } = require('../middleware/auth')

const router = express.Router()

router.route('/')
  .get(getRooms)
  .post(protect, isAdmin, createRoom)

router.route('/:id')
  .get(getRoom)
  .put(protect, isAdminOrStaff, updateRoom)
  .delete(protect, isAdmin, deleteRoom)

module.exports = router 