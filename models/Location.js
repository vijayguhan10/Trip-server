const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    map_url: {
      type: String,
      required: true,
      trim: true // Stores Google Maps URL
    },
    iframe_url: {
      type: String,
      required: true,
      trim: true // Stores Google Maps Embed iframe link
    },
    is_deleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const Location = mongoose.model('Location', locationSchema);
module.exports = Location;
