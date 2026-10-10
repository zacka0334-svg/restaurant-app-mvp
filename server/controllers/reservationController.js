const mongoose = require('mongoose');
const Reservation = require('../models/Reservation');
const Table = require('../models/Table');
const handleError = require('../utils/handleError');
const { checkReservationInput } = require('../utils/rules');
const { ACTIVE_RESERVATION_STATUSES } = require('../config/constants');

// POST /api/reservations  (customer)
// Body: { tableId, date, time, partySize, name, phone }
async function createReservation(req, res) {
  try {
    const { tableId, date, time, name, phone } = req.body || {};
    const partySize = Number((req.body || {}).partySize);

    // Same checks as the app. The app checks first for quick feedback,
    // but this server check is the one that counts.
    const problem = checkReservationInput({ date, time, partySize, name, phone });
    if (problem) return res.status(400).json({ message: problem });

    if (!mongoose.isValidObjectId(tableId)) return res.status(400).json({ message: 'Please choose a table' });
    const table = await Table.findById(tableId);
    if (!table) return res.status(404).json({ message: 'Table not found' });
    if (table.seats < partySize) {
      return res.status(400).json({ message: `Table ${table.number} has only ${table.seats} seats` });
    }

    // Is this table already booked at this date and time?
    const taken = await Reservation.exists({
      table: table._id,
      date,
      time,
      status: { $in: ACTIVE_RESERVATION_STATUSES },
    });
    if (taken) {
      return res.status(409).json({ message: `Table ${table.number} is already booked on ${date} at ${time}` });
    }

    const reservation = await Reservation.create({
      customer: req.user._id,
      table: table._id,
      tableNumber: table.number,
      name: String(name).trim(),
      phone,
      date,
      time,
      partySize,
    });
    return res.status(201).json(reservation);
  } catch (error) {
    return handleError(res, error);
  }
}

// GET /api/reservations/availability?date=YYYY-MM-DD  (logged in)
// Returns only which tables are taken at which time (no names or phones),
// so the app can grey out full time slots.
async function getAvailability(req, res) {
  try {
    const { date } = req.query;
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ message: 'date query is required (YYYY-MM-DD)' });
    }
    const booked = await Reservation.find({ date, status: { $in: ACTIVE_RESERVATION_STATUSES } }).select('table time');
    return res.status(200).json(booked.map((r) => ({ table: r.table, time: r.time })));
  } catch (error) {
    return handleError(res, error);
  }
}

// GET /api/reservations/my  (customer)
async function getMyReservations(req, res) {
  try {
    const list = await Reservation.find({ customer: req.user._id }).sort({ date: 1, time: 1 });
    return res.status(200).json(list);
  } catch (error) {
    return handleError(res, error);
  }
}

// GET /api/reservations  (manager)
async function getAllReservations(req, res) {
  try {
    const list = await Reservation.find().sort({ date: 1, time: 1 });
    return res.status(200).json(list);
  } catch (error) {
    return handleError(res, error);
  }
}

// PATCH /api/reservations/:id  (manager)  Body: { status: "Accepted" | "Declined" }
async function updateReservationStatus(req, res) {
  try {
    const { status } = req.body || {};
    if (!['Accepted', 'Declined'].includes(status)) {
      return res.status(400).json({ message: 'Status must be Accepted or Declined' });
    }
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
    if (reservation.status !== 'Pending') {
      return res.status(400).json({ message: `This booking is already ${reservation.status}` });
    }
    reservation.status = status;
    await reservation.save();
    return res.status(200).json(reservation);
  } catch (error) {
    return handleError(res, error);
  }
}

// PATCH /api/reservations/:id/cancel  (customer, own booking)
async function cancelMyReservation(req, res) {
  try {
    const reservation = await Reservation.findOne({ _id: req.params.id, customer: req.user._id });
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
    if (!ACTIVE_RESERVATION_STATUSES.includes(reservation.status)) {
      return res.status(400).json({ message: `This booking is already ${reservation.status}` });
    }
    reservation.status = 'Cancelled';
    await reservation.save();
    return res.status(200).json(reservation);
  } catch (error) {
    return handleError(res, error);
  }
}

module.exports = {
  createReservation,
  getAvailability,
  getMyReservations,
  getAllReservations,
  updateReservationStatus,
  cancelMyReservation,
};
