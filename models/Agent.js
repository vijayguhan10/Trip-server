const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    company_name: {
      type: String,
      required: true,
      trim: true
    },
    logo: {
      type: String,
      required: true
    },
    address: {
      type: String
    },
    pincode: {
      type: Number
    },
    city: {
      type: String
    }
  },
  { timestamps: true }
);

const Agent = mongoose.model('Agent', agentSchema);
module.exports = Agent;
