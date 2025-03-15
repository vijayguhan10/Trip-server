const express = require('express');
const router = express.Router();
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct
} = require('../controllers/Partner/productController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Create a new product
router.post('/', authMiddleware, createProduct);

// Get all products
router.get('/', getAllProducts);

// Get a single product by ID
router.get('/:id', getProductById);

// Update a product by ID
router.put('/:id', authMiddleware, updateProduct);

// Delete a product by ID
router.delete('/:id', authMiddleware, deleteProduct);

module.exports = router;
