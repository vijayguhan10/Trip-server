const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const router = express.Router();
const {
  getReservationsByBookingId,
  getReservationsByBusinessId,
  createReservation,
  updateReservation,
  deleteReservation
} = require('../controllers/Client/reservationController');

// ✅ Create a new reservation
router.post('/book', authMiddleware, createReservation);

router.get('/', authMiddleware, getReservationsByBookingId);

router.get('/business/:business_id/:type', getReservationsByBusinessId);

router.put('/:reservation_id', updateReservation);

router.delete('/:reservation_id', deleteReservation);

module.exports = router;
