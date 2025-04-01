const mongoose = require('mongoose');

// Restaurant Model
const restaurantSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    location_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      required: true
    },
    business_name: { type: String, required: true, trim: true },
    owner_name: { type: String, required: true, trim: true },
    image_url: [{ type: String, default: '' }],
    logo_url: { type: String, default: '' },
    address: { type: String, required: true },
    single_line_address: { type: String, default: '' },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
    customer_rating: { type: Number, default: 0 },
    category: {
      type: [String],
      enum: [
        'lunch',
        'dinner',
        'fastfood',
        'chat',
        'snacks',
        'all',
        'non-veg',
        'veg'
      ],
      required: true
    },
    discount: { type: Number, default: 0, min: 0, max: 100 },
    businessHours: {
      days: { type: [String], default: [] },
      openingTime: { type: String, default: '' },
      closingTime: { type: String, default: '' }
    },
    description: { type: String, default: '' },
    map_url: { type: String, default: '' },
    canReserve: { type: Boolean, default: false }
  },
  { timestamps: true }
);
const Restaurant = mongoose.model('Restaurant', restaurantSchema);
module.exports = Restaurant;
