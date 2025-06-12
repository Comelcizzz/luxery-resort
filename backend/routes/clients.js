const express = require('express')
const { getClients, getClient, updateClient, deleteClient } = require('../controllers/clientController')
const { protect, isAdmin } = require('../middleware/auth')

const router = express.Router()

// Apply protection to all routes
router.use(protect)
router.use(isAdmin)

router.route('/')
  .get(getClients)

router.route('/:id')
  .get(getClient)
  .put(updateClient)
  .delete(deleteClient)

module.exports = router 