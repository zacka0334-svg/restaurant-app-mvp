const express = require('express');
const {
  createReservation,
  getAvailability,
  getMyReservations,
  getAllReservations,
  updateReservationStatus,
  cancelMyReservation,
} = require('../controllers/reservationController');
const { protect, managerOnly } = require('../middleware/auth');
const validateId = require('../middleware/validateId');

const router = express.Router();

router.post('/', protect, createReservation);
router.get('/availability', protect, getAvailability);
router.get('/my', protect, getMyReservations);
router.get('/', protect, managerOnly, getAllReservations);
router.patch('/:id/cancel', validateId, protect, cancelMyReservation);
router.patch('/:id', validateId, protect, managerOnly, updateReservationStatus);

module.exports = router;
