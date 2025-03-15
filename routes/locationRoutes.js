const express = require('express');
const {
  createLocation,
  getLocation,
  getAllLocations,
  updateLocation,
  deleteLocation,
  getLocationDropdown
} = require('../controllers/Superadmin/locationController');
const {
  authMiddleware,
  authorizeRoles
} = require('../middleware/authMiddleware');

const router = express.Router();

// Only SuperAdmins can manage locations
router.post(
  '/create',
  authMiddleware,
  authorizeRoles('SuperAdmin'),
  createLocation
);
router.get('/:id', authMiddleware, getLocation);
router.get('/', getAllLocations);
router.put(
  '/:id',
  authMiddleware,
  authorizeRoles('SuperAdmin'),
  updateLocation
);
router.delete(
  '/:id',
  authMiddleware,
  authorizeRoles('SuperAdmin'),
  deleteLocation
);
router.get('/dropdown/list', getLocationDropdown);

module.exports = router;
