// Order lifecycle: Pending -> Preparing -> Ready -> Served, or -> Cancelled.
export const ORDER_STATUSES = ['Pending', 'Preparing', 'Ready', 'Served'];
export const CANCELLED = 'Cancelled';

export const PLACE_ORDER = 'PLACE_ORDER';
export const UPDATE_STATUS = 'UPDATE_STATUS';
export const CANCEL_ORDER = 'CANCEL_ORDER';

export const initialOrdersState = { orders: [] };

// Which transitions are allowed (matches the UML state machine).
const TRANSITIONS = {
  Pending: ['Preparing', CANCELLED],
  Preparing: ['Ready', CANCELLED],
  Ready: ['Served'],
  Served: [],
  Cancelled: [],
};

export function canTransition(from, to) {
  return (TRANSITIONS[from] || []).includes(to);
}

export function nextStatus(status) {
  const i = ORDER_STATUSES.indexOf(status);
  return i >= 0 && i < ORDER_STATUSES.length - 1 ? ORDER_STATUSES[i + 1] : null;
}

export function ordersReducer(state, action) {
  switch (action.type) {
    case 'HYDRATE':
      return action.payload && Array.isArray(action.payload.orders) ? action.payload : state;

    case PLACE_ORDER:
      // Newest first.
      return { ...state, orders: [action.payload, ...state.orders] };

    case UPDATE_STATUS: {
      const { id, status, by = 'system' } = action.payload;
      return {
        ...state,
        orders: state.orders.map((o) => {
          if (o.id !== id || !canTransition(o.status, status)) return o;
          return {
            ...o,
            status,
            // Once a manager changes the status, the demo auto-progress stops.
            manualOverride: o.manualOverride || by === 'manager',
            history: [...(o.history || []), { status, at: Date.now(), by }],
          };
        }),
      };
    }

    case CANCEL_ORDER:
      return ordersReducer(state, { type: UPDATE_STATUS, payload: { ...action.payload, status: CANCELLED } });

    default:
      return state;
  }
}

export default ordersReducer;
