// Order lifecycle used by the screens. The SERVER enforces the same rules
// (server/utils/rules.js); these copies only decide which buttons to show.
export const ORDER_STATUSES = ['Pending', 'Preparing', 'Ready', 'Served'];
export const CANCELLED = 'Cancelled';

export function nextStatus(status) {
  const i = ORDER_STATUSES.indexOf(status);
  return i >= 0 && i < ORDER_STATUSES.length - 1 ? ORDER_STATUSES[i + 1] : null;
}

// Cancel is only allowed while the order is still Pending.
export function canCancel(status) {
  return status === 'Pending';
}
