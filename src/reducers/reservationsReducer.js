export const CREATE_RESERVATION = 'CREATE_RESERVATION';
export const CANCEL_RESERVATION = 'CANCEL_RESERVATION';
export const SET_RESERVATION_STATUS = 'SET_RESERVATION_STATUS';

// Reservation status: Pending -> Accepted | Declined, or Cancelled by customer.
export function reservationsReducer(state, action) {
  switch (action.type) {
    case 'HYDRATE':
      return Array.isArray(action.payload) ? action.payload : state;

    case CREATE_RESERVATION:
      return [action.payload, ...state];

    case CANCEL_RESERVATION:
      return state.map((r) => (r.id === action.payload.id ? { ...r, status: 'Cancelled' } : r));

    case SET_RESERVATION_STATUS:
      return state.map((r) => (r.id === action.payload.id ? { ...r, status: action.payload.status } : r));

    default:
      return state;
  }
}

// A reservation blocks its table unless it was cancelled or declined.
export function isActiveReservation(r) {
  return r.status === 'Pending' || r.status === 'Accepted';
}

export default reservationsReducer;
