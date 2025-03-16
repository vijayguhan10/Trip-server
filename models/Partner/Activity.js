const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    location_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
    business_name: { type: String, required: true, trim: true },
    owner_name: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
    image_url: [{ type: String, default: '' }],
    logo_url: { type: String, default: '' },
    businessHours: {
      days: { type: [String], default: [] },
      openingTime: { type: String, default: '' },
      closingTime: { type: String, default: '' }
    },
    title: { type: String, trim: true },
    description: { type: String },
    single_line_address: { type: String }
  },
  { timestamps: true }
);
const Activity = mongoose.model('Activity', activitySchema);
module.exports = Activity;
