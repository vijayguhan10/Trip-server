const express = require('express');
const router = express.Router();
const {
  registerActivity,
  getActivities,
  getActivityById,
  updateActivity,
  deleteActivity
} = require('../controllers/Partner/activityController');
const { authMiddleware } = require('../middleware/authMiddleware');

// @desc    Register a new activity
// @route   POST /api/activities
// @access  Private
router.post('/', registerActivity);

// @desc    Get all activities
// @route   GET /api/activities
// @access  Public
router.get('/', authMiddleware, getActivities);

// @desc    Get a single activity
// @route   GET /api/activities/:id
// @access  Public
router.get('/:id', getActivityById);

// @desc    Update an activity
// @route   PUT /api/activities/:id
// @access  Private
router.put('/:id', authMiddleware, updateActivity);

// @desc    Delete an activity
// @route   DELETE /api/activities/:id
// @access  Private
router.delete('/:id', authMiddleware, deleteActivity);

module.exports = router;
