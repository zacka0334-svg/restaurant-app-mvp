// Run with: npm test   (uses Node's built-in test runner, no extra package)
const test = require('node:test');
const assert = require('node:assert');
const { computeTotals, checkStatusChange, checkReservationInput, toDateKey } = require('../utils/rules');

test('totals use 20% discount, then 5% service and 15% tax', () => {
  assert.deepStrictEqual(computeTotals([{ price: 1800, quantity: 2 }], 20), {
    subtotal: 3600, discount: 720, serviceCharge: 144, salesTax: 432, total: 3456,
  });
});

test('status only moves one step forward', () => {
  assert.strictEqual(checkStatusChange('Pending', 'Preparing'), null);
  assert.strictEqual(checkStatusChange('Preparing', 'Ready'), null);
  assert.strictEqual(checkStatusChange('Ready', 'Served'), null);
  assert.ok(checkStatusChange('Pending', 'Ready'));      // skipping a step
  assert.ok(checkStatusChange('Ready', 'Preparing'));    // going back
  assert.ok(checkStatusChange('Served', 'Preparing'));
});

test('cancel only while Pending', () => {
  assert.strictEqual(checkStatusChange('Pending', 'Cancelled'), null);
  assert.ok(checkStatusChange('Preparing', 'Cancelled'));
  assert.ok(checkStatusChange('Cancelled', 'Preparing'));
});

test('reservation input rules', () => {
  const now = new Date(2026, 9, 10, 12, 0);
  const ok = { date: '2026-10-11', time: '19:00', partySize: 4, name: 'Ahmed Ali', phone: '0300-1234567' };
  assert.strictEqual(checkReservationInput(ok, now), null);
  assert.ok(checkReservationInput({ ...ok, date: '2026-10-09' }, now));
  assert.ok(checkReservationInput({ ...ok, partySize: 13 }, now));
  assert.ok(checkReservationInput({ ...ok, phone: '03001234567' }, now));
  assert.ok(checkReservationInput({ ...ok, time: '23:00' }, now));
  assert.ok(checkReservationInput({ ...ok, date: '2026-10-10', time: '12:00' }, now)); // less than 1 hour
  assert.strictEqual(toDateKey(now), '2026-10-10');
});
