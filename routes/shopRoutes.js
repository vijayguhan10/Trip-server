const express = require('express');
const router = express.Router();
const {
  registerShop,
  getShops,
  getShopById,
  updateShop,
  deleteShop
} = require('../controllers/Partner/shopController');

const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/', registerShop);

router.get('/', authMiddleware, getShops);

router.get('/:id', authMiddleware, getShopById);

router.put('/:id', authMiddleware, updateShop);

router.delete('/:id', authMiddleware, deleteShop);

module.exports = router;
