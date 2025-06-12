const express = require('express')
const { getServiceOrders, getServiceOrder, createServiceOrder, updateServiceOrderStatus, deleteServiceOrder } = require('../controllers/serviceOrderController')
const { protect } = require('../middleware/auth')

const router = express.Router()

// All routes require authentication
router.use(protect)

router.route('/')
  .get(getServiceOrders)
  .post(createServiceOrder)

router.route('/:id')
  .get(getServiceOrder)
  .put(updateServiceOrderStatus)
  .delete(deleteServiceOrder)

module.exports = router 