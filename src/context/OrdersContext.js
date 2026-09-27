import React, { createContext, useCallback, useContext, useMemo } from 'react';
import usePersistentReducer from '../hooks/usePersistentReducer';
import { CANCEL_ORDER, PLACE_ORDER, UPDATE_STATUS, initialOrdersState, ordersReducer } from '../reducers/ordersReducer';

const OrdersContext = createContext(undefined);

export function OrdersProvider({ children }) {
  // useReducer + AsyncStorage persistence (key: @rapp/orders).
  const [state, dispatch, isHydrated] = usePersistentReducer(ordersReducer, initialOrdersState, '@rapp/orders');

  const placeOrder = useCallback(({ user, items, totals, type, tableId, pickupTime, promoCode }) => {
    const now = Date.now();
    const order = {
      id: `ORD-${String(now).slice(-6)}`,
      customerId: user.id,
      customerName: user.fullName,
      items: items.map(({ id, name, price, quantity, note }) => ({ id, name, price, quantity, note })),
      totals,
      total: totals.grandTotal,
      promoCode: promoCode || null,
      type, // 'Dine-in' | 'Takeaway'
      tableId: type === 'Dine-in' ? tableId : null,
      pickupTime: type === 'Takeaway' ? pickupTime : null,
      status: 'Pending',
      timestamp: now,
      manualOverride: false,
      history: [{ status: 'Pending', at: now, by: 'customer' }],
    };
    dispatch({ type: PLACE_ORDER, payload: order });
    return order;
  }, [dispatch]);

  const updateStatus = useCallback(
    (id, status, by = 'system') => dispatch({ type: UPDATE_STATUS, payload: { id, status, by } }),
    [dispatch]
  );

  const cancelOrder = useCallback(
    (id, by = 'customer') => dispatch({ type: CANCEL_ORDER, payload: { id, by } }),
    [dispatch]
  );

  const value = useMemo(
    () => ({ orders: state.orders, dispatch, placeOrder, updateStatus, cancelOrder, isHydrated }),
    [state.orders, dispatch, placeOrder, updateStatus, cancelOrder, isHydrated]
  );

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (ctx === undefined) {
    throw new Error('useOrders must be used inside an <OrdersProvider>.');
  }
  return ctx;
}

export default OrdersContext;
