const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    booking_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true
    },
    business_id: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'type', // Dynamically reference 'Restaurant' or 'Task'
      required: false
    },
    date: {
      type: String, // Storing as a string to match format 'Mon Mar 17 2025'
      required: true
    },
    bookedTime: {
      type: String, // Storing as a string in 'HH:mm' format
      required: true
    },
    totalMembers: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'], // Status values
      default: 'Pending'
    },
    type: {
      type: String,
      enum: ['Restaurant', 'Task'],
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    is_deleted: {
      type: Boolean,
      default: false
    },
    advance_Amt: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Reservation', reservationSchema);
