const Review = require('../../models/Review');
const Restaurant = require('../../models/Partner/Restaurant');
const Shop = require('../../models/Partner/Shop');
const Activity = require('../../models/Partner/Activity');
const Task = require('../../models/Partner/Task');
const Booking = require('../../models/Booking');

const calculateAverageRating = async (businessId, businessType) => {
  let reviews = [];

  reviews = await Review.find({
    business_id: businessId,
    business_type: businessType
  });

  if (reviews.length === 0) return 0;

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  return totalRating / reviews.length;
};

const createReview = async (req, res) => {
  console.log(req.body);
  const { business_id, business_type, title, rating, description } = req.body;
  const booking_id = req.user._id;

  try {
    let business;
    switch (business_type) {
      case 'Restaurant':
        business = await Restaurant.findById(business_id);
        break;
      case 'Shop':
        business = await Shop.findById(business_id);
        break;
      case 'Task':
        business = await Task.findById(business_id);
        break;
      default:
        return res.status(400).json({ error: 'Invalid business type.' });
    }

    if (!business) {
      return res.status(404).json({ error: 'Business not found.' });
    }

    const review = new Review({
      booking_id,
      business_id,
      business_type,
      title,
      rating,
      description
    });

    await review.save();

    const averageRating = await calculateAverageRating(
      business_id,
      business_type
    );
    business.customer_rating = averageRating;
    await business.save();

    res.status(201).json({ message: 'Review created successfully.', review });
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Failed to create review.', details: error.message });
  }
};

const getReviewsForBusiness = async (req, res) => {
  const { business_id, business_type } = req.params;

  try {
    let reviews = [];

    if (business_type === 'Task') {
      const tasks = await Task.find({ activity_id: business_id }).select('_id');
      const taskIds = tasks.map((task) => task._id);

      reviews = await Review.find({
        business_id: { $in: taskIds },
        business_type: 'Task'
      }).populate('booking_id', 'name email phone_number');
    } else {
      reviews = await Review.find({
        business_id,
        business_type
      }).populate('booking_id', 'name email phone_number');
    }

    res.status(200).json(reviews);
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Failed to fetch reviews.', details: error.message });
  }
};

const deleteReview = async (req, res) => {
  const { review_id } = req.params;

  try {
    const review = await Review.findById(review_id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found.' });
    }

    review.is_deleted = true;
    await review.save();

    const averageRating = await calculateAverageRating(
      review.business_id,
      review.business_type
    );

    if (review.business_type === 'Task') {
      const task = await Task.findById(review.business_id);
      if (task) {
        const activity = await Activity.findById(task.activity_id);
        if (activity) {
          activity.customer_rating = averageRating;
          await activity.save();
        }
      }
    } else {
      let business;
      switch (review.business_type) {
        case 'Restaurant':
          business = await Restaurant.findById(review.business_id);
          break;
        case 'Shop':
          business = await Shop.findById(review.business_id);
          break;
      }

      if (business) {
        business.customer_rating = averageRating;
        await business.save();
      }
    }

    res.status(200).json({ message: 'Review deleted successfully.' });
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Failed to delete review.', details: error.message });
  }
};

module.exports = {
  createReview,
  getReviewsForBusiness,
  deleteReview
};
