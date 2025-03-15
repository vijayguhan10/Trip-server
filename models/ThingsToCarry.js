const mongoose = require('mongoose');

const ThingsToCarrySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    location_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location', // Updated reference
      required: true
    }
  },
  {
    timestamps: true
  }
);

const ThingsToCarry = mongoose.model('ThingsToCarry', ThingsToCarrySchema);
module.exports = ThingsToCarry;
