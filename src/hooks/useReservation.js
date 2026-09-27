import { useCallback, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useReservations } from '../context/ReservationsContext';
import { TIME_SLOTS, mockTables, toDateKey } from '../data/tables';
import { CANCEL_RESERVATION, CREATE_RESERVATION, isActiveReservation } from '../reducers/reservationsReducer';

export const MIN_PARTY = 1;
export const MAX_PARTY = 12;
export const PK_MOBILE_REGEX = /^03\d{2}-\d{7}$/; // 03XX-XXXXXXX
const ONE_HOUR = 60 * 60 * 1000;

// "2026-09-28" + "19:00" -> Date in local time
export function toDateTime(dateKey, time) {
  const [y, m, d] = dateKey.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  return new Date(y, m - 1, d, hh, mm, 0, 0);
}

// Tables that can seat `partySize` and are not booked at date+time.
export function getFreeTables(reservations, tables, dateKey, time, partySize) {
  const booked = new Set(
    reservations
      .filter((r) => r.date === dateKey && r.time === time && isActiveReservation(r))
      .map((r) => r.tableId)
  );
  return tables
    .filter((t) => t.seats >= partySize && !booked.has(t.id))
    .sort((a, b) => a.seats - b.seats); // best fit first
}

// Pure validation so it can be unit-tested.
export function validateReservation({ date, time, partySize, name, phone }, now = new Date()) {
  const errors = {};
  if (!date) {
    errors.date = 'Please choose a date.';
  } else if (date < toDateKey(now)) {
    errors.date = 'The date cannot be in the past.';
  }
  if (!time) {
    errors.time = 'Please choose a time slot.';
  } else if (date && toDateTime(date, time).getTime() - now.getTime() < ONE_HOUR) {
    errors.time = 'Bookings must be made at least 1 hour in advance.';
  }
  if (!Number.isInteger(partySize) || partySize < MIN_PARTY || partySize > MAX_PARTY) {
    errors.partySize = `Party size must be between ${MIN_PARTY} and ${MAX_PARTY}.`;
  }
  if (!name || name.trim().length < 3) {
    errors.name = 'Please enter the name for the booking.';
  }
  if (!PK_MOBILE_REGEX.test(phone || '')) {
    errors.phone = 'Use the format 03XX-XXXXXXX.';
  }
  return errors;
}

function buildDates(days = 7) {
  const out = [];
  const base = new Date();
  for (let i = 0; i < days; i += 1) {
    const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i);
    out.push({
      key: toDateKey(d),
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toDateString().slice(0, 10),
    });
  }
  return out;
}

// All reservation business logic lives here; ReservationScreen only renders.
export default function useReservation() {
  const { user } = useAuth();
  const { reservations, dispatch } = useReservations();

  const dates = useMemo(() => buildDates(7), []);
  const [date, setDate] = useState(dates[1].key); // default: tomorrow
  const [time, setTime] = useState(null);
  const [partySize, setPartySizeState] = useState(2);
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [contact, setContact] = useState({ name: user?.fullName || '', phone: '' });
  const [errors, setErrors] = useState({});

  const clearError = useCallback((field) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const { [field]: _removed, ...rest } = prev;
      return rest;
    });
  }, []);

  const selectDate = useCallback((key) => { setDate(key); setTime(null); clearError('date'); clearError('time'); }, [clearError]);
  const selectTime = useCallback((t) => { setTime(t); setSelectedTableId(null); clearError('time'); }, [clearError]);
  const setPartySize = useCallback((n) => {
    setPartySizeState(Math.max(MIN_PARTY, Math.min(MAX_PARTY, n)));
    clearError('partySize');
  }, [clearError]);
  const setContactField = useCallback((field, value) => {
    setContact((prev) => ({ ...prev, [field]: value }));
    clearError(field);
  }, [clearError]);

  // Every hourly slot with its availability for the chosen date + party size.
  const slots = useMemo(() => {
    const now = Date.now();
    return TIME_SLOTS.map((slot) => {
      const tooSoon = toDateTime(date, slot).getTime() - now < ONE_HOUR;
      const free = getFreeTables(reservations, mockTables, date, slot, partySize);
      let reason = null;
      if (tooSoon) reason = 'Too soon';
      else if (free.length === 0) reason = 'Full';
      return { time: slot, isAvailable: !reason, reason, freeCount: free.length };
    });
  }, [date, partySize, reservations]);

  const availableTables = useMemo(
    () => (time ? getFreeTables(reservations, mockTables, date, time, partySize) : []),
    [reservations, date, time, partySize]
  );

  // Derived: the chosen table if still valid, otherwise the best-fit table.
  const selectedTable = useMemo(
    () => availableTables.find((t) => t.id === selectedTableId) || availableTables[0] || null,
    [availableTables, selectedTableId]
  );

  // If the chosen slot became unavailable (e.g. party size grew), drop it.
  const selectedSlot = slots.find((s) => s.time === time);
  const effectiveTime = selectedSlot && selectedSlot.isAvailable ? time : null;

  const validate = useCallback(() => {
    const next = validateReservation({ date, time: effectiveTime, partySize, ...contact });
    if (effectiveTime && !selectedTable) next.time = 'No table is free for this slot.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }, [date, effectiveTime, partySize, contact, selectedTable]);

  const createReservation = useCallback(() => {
    if (!validate()) return null;
    const reservation = {
      id: `RES-${String(Date.now()).slice(-6)}`,
      customerId: user.id,
      name: contact.name.trim(),
      phone: contact.phone,
      date,
      time: effectiveTime,
      partySize,
      tableId: selectedTable.id,
      status: 'Pending',
      createdAt: Date.now(),
    };
    dispatch({ type: CREATE_RESERVATION, payload: reservation });
    setTime(null);
    setSelectedTableId(null);
    return reservation;
  }, [validate, user, contact, date, effectiveTime, partySize, selectedTable, dispatch]);

  const cancelReservation = useCallback((id) => dispatch({ type: CANCEL_RESERVATION, payload: { id } }), [dispatch]);

  const myReservations = useMemo(
    () =>
      reservations
        .filter((r) => user && r.customerId === user.id)
        .sort((a, b) => (a.date + a.time < b.date + b.time ? -1 : 1)),
    [reservations, user]
  );

  return {
    dates,
    date,
    selectDate,
    slots,
    time: effectiveTime,
    selectTime,
    partySize,
    setPartySize,
    availableTables,
    selectedTable,
    selectTable: setSelectedTableId,
    contact,
    setContactField,
    errors,
    validate,
    createReservation,
    cancelReservation,
    myReservations,
  };
}
