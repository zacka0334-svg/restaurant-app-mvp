import React, { createContext, useCallback, useContext, useMemo } from 'react';
import seedMenu from '../data/menu';
import usePersistentReducer from '../hooks/usePersistentReducer';
import { ADD_MENU_ITEM, TOGGLE_AVAILABILITY, UPDATE_PRICE, menuReducer } from '../reducers/menuReducer';

const MenuContext = createContext(undefined);

// Shared menu: the Manager Dashboard edits it, the customer Menu reads it,
// so changes appear on the customer side immediately.
export function MenuProvider({ children }) {
  const [menuItems, dispatch, isHydrated] = usePersistentReducer(menuReducer, seedMenu, '@dastarkhwan/menu');

  const addItem = useCallback(
    ({ name, description, price, category, image }) =>
      dispatch({
        type: ADD_MENU_ITEM,
        payload: {
          id: `m${Date.now()}`,
          name: name.trim(),
          description: description.trim() || 'Chef’s new addition.',
          price: Number(price),
          category,
          image: image || '🍛',
          isSpecial: false,
          isAvailable: true,
        },
      }),
    [dispatch]
  );

  const updatePrice = useCallback((id, price) => dispatch({ type: UPDATE_PRICE, payload: { id, price: Number(price) } }), [dispatch]);
  const toggleAvailability = useCallback((id) => dispatch({ type: TOGGLE_AVAILABILITY, payload: { id } }), [dispatch]);

  const value = useMemo(
    () => ({ menuItems, addItem, updatePrice, toggleAvailability, isHydrated }),
    [menuItems, addItem, updatePrice, toggleAvailability, isHydrated]
  );

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

export function useMenu() {
  const ctx = useContext(MenuContext);
  if (ctx === undefined) {
    throw new Error('useMenu must be used inside a <MenuProvider>.');
  }
  return ctx;
}

export default MenuContext;
