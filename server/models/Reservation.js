const mongoose = require('mongoose');
const toJSON = require('../utils/toJSON');
const { RESERVATION_STATUS_ENUM, TIME_SLOTS, PK_MOBILE_REGEX } = require('../config/constants');

const reservationSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // who booked
    table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true }, // which table
    tableNumber: { type: Number, required: true }, // copy, so lists can show it without a join
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, match: [PK_MOBILE_REGEX, 'Phone must be 03XX-XXXXXXX'] },
    date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ }, // "YYYY-MM-DD"
    time: { type: String, required: true, enum: TIME_SLOTS }, // "19:00"
    partySize: { type: Number, required: true, min: 1, max: 12 },
    status: { type: String, enum: RESERVATION_STATUS_ENUM, default: 'Pending' },
  },
  { timestamps: true } // createdAt + updatedAt
);

// Speeds up the "is this table free?" check.
reservationSchema.index({ table: 1, date: 1, time: 1 });
reservationSchema.set('toJSON', toJSON);

module.exports = mongoose.model('Reservation', reservationSchema);
