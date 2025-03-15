const mongoose = require('mongoose');

// Common User Model
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    phone_number: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ['SuperAdmin', 'Agent', 'Shop', 'Restaurant', 'Activity'],
      required: true
    },
    isNew: { type: Boolean, default: true },
    is_deleted: { type: Boolean, default: false }
  },
  { timestamps: true, suppressReservedKeysWarning: true }
);

const User = mongoose.model('User', userSchema);
module.exports = User;
