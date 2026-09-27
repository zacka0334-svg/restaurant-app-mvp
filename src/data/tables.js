// Mock restaurant tables and seed reservations (no database).

export const mockTables = [
  { id: 't1', number: 1, seats: 2, location: 'Window' },
  { id: 't2', number: 2, seats: 2, location: 'Window' },
  { id: 't3', number: 3, seats: 4, location: 'Main hall' },
  { id: 't4', number: 4, seats: 4, location: 'Main hall' },
  { id: 't5', number: 5, seats: 6, location: 'Family area' },
  { id: 't6', number: 6, seats: 8, location: 'Family area' },
  { id: 't7', number: 7, seats: 12, location: 'Private room' },
];

// Opening hours: hourly slots from 12:00 to 22:00.
export const TIME_SLOTS = Array.from({ length: 11 }, (_, i) => `${String(12 + i).padStart(2, '0')}:00`);

export function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function tomorrowKey() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return toDateKey(d);
}

// Seed data: tomorrow at 20:00 every table is booked, so that slot is shown
// disabled on the Reservation screen (demo for the "disabled slot" screenshot).
// Tomorrow at 19:00 only the large tables are booked, so the slot is disabled
// only for parties larger than 4.
const t = tomorrowKey();
export const mockReservations = [
  ...mockTables.map((table, i) => ({
    id: `seed-20-${table.id}`,
    customerId: 'u2',
    name: 'Sara Khan',
    phone: '0321-1234567',
    date: t,
    time: '20:00',
    partySize: Math.min(table.seats, 2 + i),
    tableId: table.id,
    status: 'Accepted',
    createdAt: Date.now(),
  })),
  ...['t5', 't6', 't7'].map((tableId) => ({
    id: `seed-19-${tableId}`,
    customerId: 'u2',
    name: 'Sara Khan',
    phone: '0321-1234567',
    date: t,
    time: '19:00',
    partySize: 6,
    tableId,
    status: 'Pending',
    createdAt: Date.now(),
  })),
];
