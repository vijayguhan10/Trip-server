const mongoose = require('mongoose');

// Shop Model
const shopSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    map_url: { type: String, default: '' },
    description: { type: String, default: '' },
    location_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
    business_name: { type: String, required: true, trim: true },
    owner_name: { type: String, required: true, trim: true },
    image_url: [{ type: String, default: '' }],
    logo_url: { type: String, default: '' },
    address: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
    shopType: { type: String },
    businessHours: {
      days: { type: [String], default: [] },
      openingTime: { type: String, default: '' },
      closingTime: { type: String, default: '' }
    },
    customer_rating: { type: Number, default: 0 },
    single_line_address: { type: String, default: '' },
    discount: { type: Number, default: 0 }
  },
  { timestamps: true }
);
const Shop = mongoose.model('Shop', shopSchema);
module.exports = Shop;
