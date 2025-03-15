const mongoose = require('mongoose');

const DestinationSchema = new mongoose.Schema(
  {
    place_name: {
      type: String,
      required: true,
      trim: true
    },
    location_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      required: true
    },
    map_link: {
      type: String,
      required: true,
      trim: true
    },
    iframe_url: {
      type: String,
      required: true,
      trim: true
    },
    near_by_attractions: {
      type: String,
      required: true,
      trim: true
    },
    best_time_to_visit: {
      type: String,
      required: true,
      trim: true
    },
    short_summary: {
      type: String,
      required: true,
      trim: true
    },
    is_deleted: {
      type: Boolean,
      default: false
    },
    image_urls: [
      {
        type: String,
        trim: true
      }
    ],
    top_destination: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Destination', DestinationSchema);
