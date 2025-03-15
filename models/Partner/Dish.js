const mongoose = require('mongoose');

const dishSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    discounted_price: { type: Number },
    image_url: { type: String, trim: true },
    category: { type: String, enum: ['veg', 'non-veg'], required: true },
    is_deleted: { type: Boolean, default: false },
    filter: [{ type: String, default: '' }],
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    restaurant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true
    }
  },
  { timestamps: true }
);

const Dish = mongoose.model('Dish', dishSchema);
module.exports = Dish;
