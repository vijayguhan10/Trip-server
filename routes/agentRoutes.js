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

// Register Agent (No authentication needed)
router.post('/register', createAgent);

// Get Agent Profile (Only Agents)
router.get(
  '/profile',
  authMiddleware,
  authorizeRoles('Agent'),
  getAgentProfile
);

// Update Agent (Only Agents)
// router.put('/update', authMiddleware, authorizeRoles('Agent'), updateAgent);

// // Delete Agent (Only Agents)
// router.delete(
//   '/delete',
//   authMiddleware,
//   authorizeRoles('Agent', 'SuperAdmin'),
//   deleteAgent
// );

module.exports = router;
