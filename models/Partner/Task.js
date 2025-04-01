const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    activity_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Activity',
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    whatsincluded: [
      {
        type: String
      }
    ],
    additional_info: {
      duration: String,
      agerequirement: String,
      dresscode: String,
      accessibility: String,
      difficulty: {
        type: String,
        enum: ['Easy', 'Moderate', 'Difficult'],
        default: 'Moderate'
      }
    },
    price: {
      type: Number
    },
    slots: [
      {
        type: String
      }
    ],
    discount_percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    image_url: [
      {
        type: String
      }
    ],
    filter: [
      {
        type: String
      }
    ],
    is_deleted: {
      type: Boolean,
      default: false
    },
    customer_rating: {
      type: Number,
      default: 0
    },
    canReserve: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;
