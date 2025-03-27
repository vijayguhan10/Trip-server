const express = require('express');
const router = express.Router();
const {
  registerShop,
  getShops,
  getShopById
} = require('../controllers/Partner/shopController');

const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/', registerShop);

router.get('/', authMiddleware, getShops);

router.get('/:id', authMiddleware, getShopById);

module.exports = router;
