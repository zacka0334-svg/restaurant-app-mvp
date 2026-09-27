import { PROMO_CODES } from '../data/promoCodes';

// Action types
export const ADD_ITEM = 'ADD_ITEM';
export const REMOVE_ITEM = 'REMOVE_ITEM';
export const INCREMENT = 'INCREMENT';
export const DECREMENT = 'DECREMENT';
export const UPDATE_NOTE = 'UPDATE_NOTE';
export const CLEAR_CART = 'CLEAR_CART';
export const APPLY_PROMO = 'APPLY_PROMO';
export const REMOVE_PROMO = 'REMOVE_PROMO';

export const initialCartState = {
  items: [], // [{ id, name, price, image, quantity, note }]
  promoCode: null,
  discountPercent: 0,
};

// Pure reducer: never mutates `state`, always returns a new object
// (or the same object when nothing changes).
export function cartReducer(state, action) {
  switch (action.type) {
    case ADD_ITEM: {
      const item = action.payload;
      const existing = state.items.find((i) => i.id === item.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)),
        };
      }
      return {
        ...state,
        items: [...state.items, { id: item.id, name: item.name, price: item.price, image: item.image, quantity: 1, note: '' }],
      };
    }

    case REMOVE_ITEM:
      return { ...state, items: state.items.filter((i) => i.id !== action.payload.id) };

    case INCREMENT:
      return {
        ...state,
        items: state.items.map((i) => (i.id === action.payload.id ? { ...i, quantity: i.quantity + 1 } : i)),
      };

    case DECREMENT:
      // Quantity 1 -> 0 removes the line entirely.
      return {
        ...state,
        items: state.items
          .map((i) => (i.id === action.payload.id ? { ...i, quantity: i.quantity - 1 } : i))
          .filter((i) => i.quantity > 0),
      };

    case UPDATE_NOTE:
      return {
        ...state,
        items: state.items.map((i) => (i.id === action.payload.id ? { ...i, note: action.payload.note } : i)),
      };

    case CLEAR_CART:
      return initialCartState;

    case APPLY_PROMO: {
      const code = String(action.payload.code || '').trim().toUpperCase();
      const percent = PROMO_CODES[code];
      // Invalid codes leave the state untouched; the screen shows the error.
      if (!percent) return state;
      return { ...state, promoCode: code, discountPercent: percent };
    }

    case REMOVE_PROMO:
      return { ...state, promoCode: null, discountPercent: 0 };

    default:
      return state;
  }
}

export function isValidPromo(code) {
  return Boolean(PROMO_CODES[String(code || '').trim().toUpperCase()]);
}

export default cartReducer;
