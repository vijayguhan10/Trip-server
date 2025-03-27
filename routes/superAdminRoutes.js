const express = require('express');
const {
  signupSuperAdmin,
  getReviewCompletedData,
  getYetToBeReviewedData,
  reviewRegistration
} = require('../controllers/Superadmin/superadminController');

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

// SuperAdmin Signup (Assuming only another SuperAdmin can create a new one)
router.post('/signup', signupSuperAdmin);

// Get reviewed (completed) registrations
router.post(
  '/reviewed-data',
  authMiddleware,
  authorizeRoles('SuperAdmin'),
  getReviewCompletedData
);

// Get yet-to-be-reviewed registrations
router.get(
  '/pending-data',
  authMiddleware,
  authorizeRoles('SuperAdmin'),
  getYetToBeReviewedData
);

// Review (Approve/Reject) a registration
router.post(
  '/review',
  authMiddleware,
  authorizeRoles('SuperAdmin'),
  reviewRegistration
);

module.exports = router;
