const mongoose = require('mongoose');
const toJSON = require('../utils/toJSON');
const { ORDER_STATUS_ENUM } = require('../config/constants');

// One line of the order. Name and price are copied from the menu at order
// time, so later price changes do not change old orders.
const orderItemSchema = new mongoose.Schema(
  {
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    note: { type: String, default: '' },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // who ordered
    customerName: { type: String, required: true },
    items: {
      type: [orderItemSchema],
      validate: [(v) => v.length > 0, 'An order needs at least one item'],
    },
    type: { type: String, enum: ['Dine-in', 'Takeaway'], required: true },
    table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table' }, // Dine-in only
    tableNumber: { type: Number },
    pickupTime: { type: String }, // Takeaway only, e.g. "19:45"
    promoCode: { type: String, default: null },
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    serviceCharge: { type: Number, required: true, min: 0 },
    salesTax: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ORDER_STATUS_ENUM, default: 'Pending' },
    history: [
      {
        _id: false,
        status: String,
        at: { type: Date, default: Date.now },
        by: String, // customer | manager
      },
    ],
  },
  { timestamps: true } // createdAt + updatedAt
);

orderSchema.set('toJSON', toJSON);

module.exports = mongoose.model('Order', orderSchema);
