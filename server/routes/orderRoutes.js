const express = require('express');
const {
  placeOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  cancelMyOrder,
} = require('../controllers/orderController');
const { protect, managerOnly } = require('../middleware/auth');
const validateId = require('../middleware/validateId');

const router = express.Router();

router.post('/', protect, placeOrder);
router.get('/my', protect, getMyOrders); // must come before '/:id' style routes
router.get('/', protect, managerOnly, getAllOrders);
router.patch('/:id/status', validateId, protect, managerOnly, updateOrderStatus);
router.patch('/:id/cancel', validateId, protect, cancelMyOrder);

module.exports = router;
