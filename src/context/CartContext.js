import React, { createContext, useContext, useMemo, useReducer } from 'react';
import { cartReducer, initialCartState } from '../reducers/cartReducer';

const CartContext = createContext(undefined);

// Exposes { state, dispatch } from useReducer plus a derived item count
// for the tab badge.
export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialCartState);

  const itemCount = useMemo(() => state.items.reduce((sum, i) => sum + i.quantity, 0), [state.items]);

  const value = useMemo(() => ({ state, dispatch, itemCount }), [state, itemCount]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (ctx === undefined) {
    throw new Error('useCart must be used inside a <CartProvider>.');
  }
  return ctx;
}

export default CartContext;
