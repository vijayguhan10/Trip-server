const express = require('express');
const router = express.Router();
const {
  registerRestaurant,
  getRestaurants,
  getRestaurantById
} = require('../controllers/Partner/restaurantController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/', registerRestaurant);
router.get('/', authMiddleware, getRestaurants);
router.get('/:id', authMiddleware, getRestaurantById);

module.exports = router;
