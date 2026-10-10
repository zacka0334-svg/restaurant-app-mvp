const mongoose = require('mongoose');
const toJSON = require('../utils/toJSON');

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: [true, 'Full name is required'], trim: true, minlength: 3 },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true, // no two accounts with the same email
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, 'Email is not valid'],
    },
    // Stored as a bcrypt hash. select:false = not returned by queries unless asked for.
    password: { type: String, required: [true, 'Password is required'], select: false },
    role: { type: String, enum: ['customer', 'manager'], default: 'customer' },
  },
  { timestamps: true }
);

userSchema.set('toJSON', toJSON);

module.exports = mongoose.model('User', userSchema);
