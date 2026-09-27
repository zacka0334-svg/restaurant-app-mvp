# Restaurant App MVP (React Native, frontend only)

Assignment 1, Fall 2026. Requirements are in [`A1/SRS.pdf`](A1/SRS.pdf).

## Q4 note: empty dependency array on the filtering effect

If the filtering effect used `[]`, it would run only once after the first render, when `menuItems` is still empty, so the list would stay empty after loading and would not react to category changes (stale closure).

## Q6 note: why Context instead of prop drilling

The logged-in user and the theme are needed by almost every screen, so passing them as props through navigators and intermediate components would be noisy and fragile. Context lets any component read them with `useAuth()` / `useTheme()`. Drawback: every consumer re-renders when the context value changes.

## Q7: Cart reducer test cases

Automated versions of all of these are in `__tests__/cartReducer.test.js` (run with `npm test`). Each test deep-freezes the input state to prove the reducer never mutates it.

| # | Action | Initial state | Expected state |
|---|---|---|---|
| 1 | `ADD_ITEM` Karahi (Rs 1800) | `items: []` | `items: [{Karahi, qty 1, note ''}]` |
| 2 | `ADD_ITEM` Karahi | `items: [{Karahi, qty 1}]` | `items: [{Karahi, qty 2}]` (no duplicate line) |
| 3 | `INCREMENT` m5 | `[{Karahi, qty 2}]` | `[{Karahi, qty 3}]` |
| 4 | `DECREMENT` m5 | `[{Karahi, qty 1}, {Lassi, qty 2}]` | `[{Lassi, qty 2}]` (line removed at 0) |
| 5 | `REMOVE_ITEM` m5 | `[{Karahi, qty 4}, {Lassi, qty 1}]` | `[{Lassi, qty 1}]` |
| 6 | `UPDATE_NOTE` m5 "no onions" | `[{Karahi, note ''}]` | `[{Karahi, note 'no onions'}]` |
| 7 | `APPLY_PROMO` "feast20" | `promoCode: null, discountPercent: 0` | `promoCode: 'FEAST20', discountPercent: 20` |
| 8 | `APPLY_PROMO` "FREEFOOD" | `promoCode: null, discountPercent: 0` | same state object (invalid code rejected; screen shows error) |
| 9 | `REMOVE_PROMO` | `promoCode: 'WELCOME10', discountPercent: 10` | `promoCode: null, discountPercent: 0` |
| 10 | `CLEAR_CART` | 3 × Karahi + FEAST20 | `{ items: [], promoCode: null, discountPercent: 0 }` |
| 11 | unknown action | any state | same state object |

## Q7: `useReducer` vs `useState` for the cart

The cart has many related values (items, quantities, notes, promo code, discount) and eight different ways they can change. With `useReducer`, every transition lives in one pure, testable function. Screens only `dispatch` intent (`INCREMENT`), and rules like "decrement to zero removes the item" are written once instead of in every button handler. With `useState` the same logic would be scattered across the Menu and Cart screens and would be easy to get out of sync. `useState` would have been enough for a cart that only held a list of item ids with no quantities, notes or promo codes.


## Q8: When *not* to use `useMemo` and `useCallback`

Don't use them by default. Each one costs memory and a dependency comparison on every render, and makes code harder to read. Skip `useMemo` for cheap calculations (adding two numbers, filtering a 10-item array) and for values that are only used once in the same component. Skip `useCallback` for handlers passed to plain elements (`<Pressable onPress>`) or to children that are not wrapped in `React.memo`: a stable reference only helps when something compares it. Never use them to "fix" a bug: correctness must not depend on memoisation. Measure first (React DevTools Profiler, console logs). Optimise only where a slow calculation or a large memoised list is actually re-rendering needlessly, as with `MenuItemCard` here.

**How to see the optimisation (screenshots for Q8):** open the Metro terminal or the debugger console. With `React.memo` + `useCallback` in place, tapping one heart logs only one line, e.g. `[MenuItemCard] render: Mutton Biryani`. For the "before" screenshot, temporarily change the last line of `src/components/MenuItemCard.js` to `export default MenuItemCard;` (no memo): now every visible card logs on each tap.

