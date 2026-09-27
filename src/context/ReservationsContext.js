import React, { createContext, useContext, useMemo } from 'react';
import { mockReservations } from '../data/tables';
import usePersistentReducer from '../hooks/usePersistentReducer';
import { reservationsReducer } from '../reducers/reservationsReducer';

const ReservationsContext = createContext(undefined);

// Holds all reservations (seeded with mockReservations, persisted).
// Business logic lives in the useReservation custom hook, not here.
export function ReservationsProvider({ children }) {
  const [reservations, dispatch, isHydrated] = usePersistentReducer(
    reservationsReducer,
    mockReservations,
    '@dastarkhwan/reservations'
  );

  const value = useMemo(() => ({ reservations, dispatch, isHydrated }), [reservations, dispatch, isHydrated]);

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
