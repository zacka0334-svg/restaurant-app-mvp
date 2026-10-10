// Business rules written as plain functions (no database), so they are
// easy to read and easy to test with `npm test`.
const {
  SERVICE_CHARGE_RATE,
  SALES_TAX_RATE,
  ORDER_STATUSES,
  TIME_SLOTS,
  PK_MOBILE_REGEX,
} = require('../config/constants');

const round = (n) => Math.round(n * 100) / 100;

// lines: [{ price, quantity }]
function computeTotals(lines, discountPercent = 0) {
  const subtotal = round(lines.reduce((sum, l) => sum + l.price * l.quantity, 0));
  const discount = round((subtotal * discountPercent) / 100);
  const taxable = subtotal - discount;
  const serviceCharge = round(taxable * SERVICE_CHARGE_RATE);
  const salesTax = round(taxable * SALES_TAX_RATE);
  const total = round(taxable + serviceCharge + salesTax);
  return { subtotal, discount, serviceCharge, salesTax, total };
}

// Returns null if the change is allowed, otherwise an error message.
// Pending -> Preparing -> Ready -> Served (one step at a time).
// Cancelled is only allowed while the order is still Pending.
function checkStatusChange(from, to) {
  if (to === 'Cancelled') {
    return from === 'Pending' ? null : `Only a Pending order can be cancelled (this order is ${from})`;
  }
  const i = ORDER_STATUSES.indexOf(from);
  const j = ORDER_STATUSES.indexOf(to);
  if (j === -1) return `Unknown status "${to}"`;
  if (i === -1) return `A ${from} order cannot be changed`;
  if (j !== i + 1) return `Status can only move forward one step: ${from} -> ${ORDER_STATUSES[i + 1] || '(none)'}`;
  return null;
}

function toDateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// "2026-10-11" + "19:00" -> Date (server local time)
function toDateTime(date, time) {
  const [y, m, d] = date.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  return new Date(y, m - 1, d, hh, mm);
}

// Returns null if valid, otherwise an error message.
function checkReservationInput({ date, time, partySize, name, phone }, now = new Date()) {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return 'Date is required (YYYY-MM-DD)';
  if (!TIME_SLOTS.includes(time)) return 'Time must be an hourly slot between 12:00 and 22:00';
  const size = Number(partySize);
  if (!Number.isInteger(size) || size < 1 || size > 12) return 'Party size must be between 1 and 12';
  if (!name || String(name).trim().length < 3) return 'Name is required';
  if (!PK_MOBILE_REGEX.test(phone || '')) return 'Phone must be in the format 03XX-XXXXXXX';
  if (date < toDateKey(now)) return 'Date cannot be in the past';
  if (toDateTime(date, time).getTime() - now.getTime() < 60 * 60 * 1000) {
    return 'Bookings must be made at least 1 hour in advance';
  }
  return null;
}

module.exports = { computeTotals, checkStatusChange, checkReservationInput, toDateKey };
