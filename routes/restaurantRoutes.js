const express = require('express');
const router = express.Router();
const {
  registerRestaurant,
  getRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant
} = require('../controllers/Partner/restaurantController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/', registerRestaurant);
router.get('/', authMiddleware, getRestaurants);
router.get('/:id', authMiddleware, getRestaurantById);
router.put('/:id', authMiddleware, updateRestaurant);
router.delete('/:id', authMiddleware, deleteRestaurant);

module.exports = router;
