import React, { createContext, useContext, useMemo, useReducer } from 'react';
import { mockReservations } from '../data/tables';
import { reservationsReducer } from '../reducers/reservationsReducer';

const ReservationsContext = createContext(undefined);

// Holds all reservations (seeded with mockReservations).
// Business logic lives in the useReservation custom hook, not here.
export function ReservationsProvider({ children }) {
  const [reservations, dispatch] = useReducer(reservationsReducer, mockReservations);
  const value = useMemo(() => ({ reservations, dispatch }), [reservations]);
  return <ReservationsContext.Provider value={value}>{children}</ReservationsContext.Provider>;
}

export function useReservations() {
  const ctx = useContext(ReservationsContext);
  if (ctx === undefined) {
    throw new Error('useReservations must be used inside a <ReservationsProvider>.');
  }
  return ctx;
}

export default ReservationsContext;
