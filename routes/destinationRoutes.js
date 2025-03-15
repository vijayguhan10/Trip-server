const express = require('express');
const {
  createDestination,
  getDestinationsByLocation,
  getAllDestinations,
  updateDestination,
  deleteDestination
} = require('../controllers/Superadmin/destinationController');
const {
  authMiddleware,
  authorizeRoles
} = require('../middleware/authMiddleware');

const router = express.Router();

// Only SuperAdmins can manage destinations
router.post(
  '/create',
  authMiddleware,
  authorizeRoles('SuperAdmin'),
  createDestination
);
router.get('/:location_id', authMiddleware, getDestinationsByLocation);
router.get('/', authMiddleware, getAllDestinations);
router.put(
  '/:id',
  authMiddleware,
  authorizeRoles('SuperAdmin'),
  updateDestination
);
router.delete(
  '/:id',
  authMiddleware,
  authorizeRoles('SuperAdmin'),
  deleteDestination
);

module.exports = router;
