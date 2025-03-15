const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    reviewType: {
      type: String,
      required: true,
      enum: ['restaurant', 'activity', 'shop']
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    user_id: {
      // Updated from 'created_by'
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    is_deleted: {
      type: Boolean,
      default: false
    },
    restaurant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant'
    },
    activity_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Activity'
    },
    shop_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop'
    }
  },
  { timestamps: true }
);

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
