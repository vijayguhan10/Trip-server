const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  createReview,
  getReviewsForBusiness,
  deleteReview
} = require('../controllers/Client/reviewController');

// Create a review (accessible to authenticated users)
router.post('/', authMiddleware, createReview);

// Get all reviews for a business (accessible to everyone)
router.get('/:business_type/:business_id', getReviewsForBusiness);

// Delete a review (accessible to authenticated users)
router.delete('/:review_id', authMiddleware, deleteReview);

module.exports = router;
