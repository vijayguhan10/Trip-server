const express = require('express');
const {
  createAgent,
  getAgentProfile,
  updateAgent,
  deleteAgent
} = require('../controllers/Agent/agentController');
const {
  authMiddleware,
  authorizeRoles
} = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', createAgent);

router.get(
  '/profile',
  authMiddleware,
  authorizeRoles('Agent'),
  getAgentProfile
);

module.exports = router;
