const mongoose = require('mongoose');
const toJSON = require('../utils/toJSON');
const { CATEGORIES } = require('../config/constants');

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    description: { type: String, default: '', trim: true },
    price: { type: Number, required: [true, 'Price is required'], min: [0, 'Price cannot be negative'] },
    category: {
      type: String,
      required: [true, 'Category is required'],
      lowercase: true,
      enum: { values: CATEGORIES, message: 'Category must be starters, mains, desserts or drinks' },
    },
    image: { type: String, default: '🍛' }, // emoji used as the dish picture
    isSpecial: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

menuItemSchema.set('toJSON', toJSON);

module.exports = mongoose.model('MenuItem', menuItemSchema);
