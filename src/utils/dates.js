// Opening hours: hourly booking slots from 12:00 to 22:00.
export const TIME_SLOTS = Array.from({ length: 11 }, (_, i) => `${String(12 + i).padStart(2, '0')}:00`);

export function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
