const express = require('express');
const router = express.Router();
const {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask
} = require('../controllers/Partner/taskController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Create a new task
router.post('/', authMiddleware, createTask);

// Get all
router.get('/', getAllTasks);

// Get a single task by ID
router.get('/:id', getTaskById);

// Update a task by ID
router.put('/:id', authMiddleware, updateTask);

// Delete a task by ID
router.delete('/:id', authMiddleware, deleteTask);

module.exports = router;
