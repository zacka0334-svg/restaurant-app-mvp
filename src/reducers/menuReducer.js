// Shared menu state edited by the Manager Dashboard and read by the
// customer Menu screen, so edits appear immediately.
export const ADD_MENU_ITEM = 'ADD_MENU_ITEM';
export const UPDATE_PRICE = 'UPDATE_PRICE';
export const TOGGLE_AVAILABILITY = 'TOGGLE_AVAILABILITY';

export function menuReducer(state, action) {
  switch (action.type) {
    case 'HYDRATE':
      return Array.isArray(action.payload) ? action.payload : state;

    case ADD_MENU_ITEM:
      return [...state, action.payload];

    case UPDATE_PRICE:
      return state.map((item) =>
        item.id === action.payload.id ? { ...item, price: action.payload.price } : item
      );

    case TOGGLE_AVAILABILITY:
      return state.map((item) =>
        item.id === action.payload.id ? { ...item, isAvailable: !item.isAvailable } : item
      );

    default:
      return state;
  }
}

export default menuReducer;
