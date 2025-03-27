const express = require('express');
const {
  authMiddleware,
  authorizeRoles
} = require('../middleware/authMiddleware');
const {
  createBooking,
  verifyBooking,
  getBooking,
  getAllBookings,
  updateBooking,
  deleteBooking
} = require('../controllers/Agent/bookingController');

const router = express.Router();

router.post('/create', authMiddleware, authorizeRoles('Agent'), createBooking);
router.post('/verify', verifyBooking);
router.get('/profile', authMiddleware, getBooking);
router.get('/', authMiddleware, getAllBookings);
router.put('/:id', authMiddleware, authorizeRoles('Agent'), updateBooking);
router.delete('/:id', authMiddleware, authorizeRoles('Agent'), deleteBooking);

module.exports = router;
