const express = require('express');
const router = express.Router();
const {
  registerActivity,
  getActivities,
  getActivityById
} = require('../controllers/Partner/activityController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/', registerActivity);
router.get('/', authMiddleware, getActivities);
router.get('/:id', getActivityById);

module.exports = router;
