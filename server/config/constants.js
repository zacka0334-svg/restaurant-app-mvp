// Values shared by controllers, models and the seed script.

const SERVICE_CHARGE_RATE = 0.05; // 5 %
const SALES_TAX_RATE = 0.15; // 15 %

// Promo code -> discount percent (same codes as the app).
const PROMO_CODES = { WELCOME10: 10, FEAST20: 20 };

const CATEGORIES = ['starters', 'mains', 'desserts', 'drinks'];

// Order lifecycle. Status may only move one step forward.
const ORDER_STATUSES = ['Pending', 'Preparing', 'Ready', 'Served'];
const ORDER_STATUS_ENUM = [...ORDER_STATUSES, 'Cancelled'];

const RESERVATION_STATUS_ENUM = ['Pending', 'Accepted', 'Declined', 'Cancelled'];
// Bookings that still hold a table.
const ACTIVE_RESERVATION_STATUSES = ['Pending', 'Accepted'];

// Hourly booking slots from 12:00 to 22:00.
const TIME_SLOTS = Array.from({ length: 11 }, (_, i) => `${String(12 + i).padStart(2, '0')}:00`);

const PK_MOBILE_REGEX = /^03\d{2}-\d{7}$/; // 03XX-XXXXXXX

module.exports = {
  SERVICE_CHARGE_RATE,
  SALES_TAX_RATE,
  PROMO_CODES,
  CATEGORIES,
  ORDER_STATUSES,
  ORDER_STATUS_ENUM,
  RESERVATION_STATUS_ENUM,
  ACTIVE_RESERVATION_STATUSES,
  TIME_SLOTS,
  PK_MOBILE_REGEX,
};
