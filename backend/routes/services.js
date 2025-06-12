const express = require('express')
const { getServices, getService, createService, updateService, deleteService } = require('../controllers/serviceController')
const { protect, isAdmin, isAdminOrStaff } = require('../middleware/auth')

const router = express.Router()

router.route('/')
  .get(getServices)
  .post(protect, isAdmin, createService)

router.route('/:id')
  .get(getService)
  .put(protect, isAdminOrStaff, updateService)
  .delete(protect, isAdmin, deleteService)

module.exports = router 