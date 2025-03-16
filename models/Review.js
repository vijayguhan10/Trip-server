const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    booking_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true
    },
    // Reference to the business (Restaurant, Shop, or Activity)
    business_id: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'business_type',
      required: true
    },
    // Dynamic reference to the business type (Restaurant, Shop, or Activity)
    business_type: {
      type: String,
      required: true,
      enum: ['Restaurant', 'Shop', 'Task']
    },
    title: { type: String, required: true },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    description: {
      type: String,
      trim: true
    },
    is_deleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
