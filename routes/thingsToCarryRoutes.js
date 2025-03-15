const express = require('express');

const {
  addThingsToCarry,
  getThingsToCarry,
  updateThingsToCarry,
  deleteThingsToCarry
} = require('../controllers/Superadmin/thingsToCarryController');

const {
  authMiddleware,
  authorizeRoles
} = require('../middleware/authMiddleware');

const router = express.Router();

router.post(
  '/',
  authMiddleware,
  authorizeRoles('SuperAdmin'),
  addThingsToCarry
);

// Get things to carry for a location
router.get('/:location_id', authMiddleware, getThingsToCarry);

// Update things to carry
router.put(
  '/:location_id/:item_id',
  authMiddleware,
  authorizeRoles('SuperAdmin'),
  updateThingsToCarry
);

// Delete things to carry
router.delete(
  '/:location_id/:item_id',
  authMiddleware,
  authorizeRoles('SuperAdmin'),
  deleteThingsToCarry
);

module.exports = router;
