const express = require('express');
const {
  loginUser,
  getUserProfileById,
  getAllUsers,
  updateUser,
  deleteUser
} = require('../controllers/User/userController');

const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/login', loginUser);
router.get('/profile', authMiddleware, getUserProfileById);
router.get('/', getAllUsers);
router.put('/:id', authMiddleware, updateUser);
router.delete('/:id', authMiddleware, deleteUser);

module.exports = router;
