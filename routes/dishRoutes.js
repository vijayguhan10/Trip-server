const express = require('express');
const dishController = require('../controllers/Partner/dishController');
const {
  authMiddleware,
  authorizeRoles
} = require('../middleware/authMiddleware'); // Assuming you have an auth middleware

const router = express.Router();

// Create a new dish
router.post(
  '/',
  authMiddleware,
  authorizeRoles('Restaurant'),
  dishController.createDish
);

// Get all dishes
router.get('/', dishController.getAllDishes);

// Get a single dish by ID
router.get('/:id', dishController.getDishById);

// Update a dish by ID
router.put(
  '/:id',
  authMiddleware,
  authorizeRoles('Restaurant'),
  dishController.updateDish
);

// Delete a dish by ID
router.delete(
  '/:id',
  authMiddleware,
  authorizeRoles('Restaurant'),
  dishController.deleteDish
);

module.exports = router;
