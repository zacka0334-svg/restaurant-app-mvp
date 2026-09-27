import {
  ADD_ITEM, APPLY_PROMO, CLEAR_CART, DECREMENT, INCREMENT, REMOVE_ITEM, REMOVE_PROMO, UPDATE_NOTE,
  cartReducer, initialCartState,
} from '../src/reducers/cartReducer';

const karahi = { id: 'm5', name: 'Chicken Karahi', price: 1800, image: '🍛' };
const lassi = { id: 'm16', name: 'Mango Lassi', price: 420, image: '🥭' };
const line = (item, quantity = 1, note = '') => ({ id: item.id, name: item.name, price: item.price, image: item.image, quantity, note });

// Deep-freeze helper: any mutation of the previous state throws in strict mode.
const freeze = (obj) => {
  Object.values(obj).forEach((v) => v && typeof v === 'object' && freeze(v));
  return Object.freeze(obj);
};

describe('cartReducer', () => {
  it('TC1 ADD_ITEM adds a new line with quantity 1', () => {
    const next = cartReducer(freeze({ ...initialCartState }), { type: ADD_ITEM, payload: karahi });
    expect(next.items).toEqual([line(karahi)]);
  });

  it('TC2 ADD_ITEM on an existing item increases its quantity', () => {
    const state = freeze({ ...initialCartState, items: [line(karahi)] });
    const next = cartReducer(state, { type: ADD_ITEM, payload: karahi });
    expect(next.items).toEqual([line(karahi, 2)]);
    expect(state.items[0].quantity).toBe(1); // previous state untouched
  });

  it('TC3 INCREMENT increases quantity by one', () => {
    const state = freeze({ ...initialCartState, items: [line(karahi, 2)] });
    expect(cartReducer(state, { type: INCREMENT, payload: { id: 'm5' } }).items[0].quantity).toBe(3);
  });

  it('TC4 DECREMENT from 1 removes the item', () => {
    const state = freeze({ ...initialCartState, items: [line(karahi), line(lassi, 2)] });
    const next = cartReducer(state, { type: DECREMENT, payload: { id: 'm5' } });
    expect(next.items).toEqual([line(lassi, 2)]);
  });

  it('TC5 REMOVE_ITEM removes the line whatever its quantity', () => {
    const state = freeze({ ...initialCartState, items: [line(karahi, 4), line(lassi)] });
    expect(cartReducer(state, { type: REMOVE_ITEM, payload: { id: 'm5' } }).items).toEqual([line(lassi)]);
  });

  it('TC6 UPDATE_NOTE stores special instructions', () => {
    const state = freeze({ ...initialCartState, items: [line(karahi)] });
    const next = cartReducer(state, { type: UPDATE_NOTE, payload: { id: 'm5', note: 'no onions' } });
    expect(next.items[0].note).toBe('no onions');
  });

  it('TC7 APPLY_PROMO with a valid code sets code and discount', () => {
    const next = cartReducer(freeze({ ...initialCartState }), { type: APPLY_PROMO, payload: { code: 'feast20' } });
    expect(next.promoCode).toBe('FEAST20');
    expect(next.discountPercent).toBe(20);
  });

  it('TC8 APPLY_PROMO with an invalid code leaves state unchanged', () => {
    const state = freeze({ ...initialCartState });
    expect(cartReducer(state, { type: APPLY_PROMO, payload: { code: 'FREEFOOD' } })).toBe(state);
  });

  it('TC9 REMOVE_PROMO clears the discount', () => {
    const state = freeze({ ...initialCartState, promoCode: 'WELCOME10', discountPercent: 10 });
    const next = cartReducer(state, { type: REMOVE_PROMO });
    expect(next.promoCode).toBeNull();
    expect(next.discountPercent).toBe(0);
  });

  it('TC10 CLEAR_CART returns the initial state', () => {
    const state = freeze({ items: [line(karahi, 3)], promoCode: 'FEAST20', discountPercent: 20 });
    expect(cartReducer(state, { type: CLEAR_CART })).toEqual(initialCartState);
  });

  it('TC11 unknown actions return the same state object', () => {
    const state = freeze({ ...initialCartState });
    expect(cartReducer(state, { type: 'UNKNOWN' })).toBe(state);
  });
});
