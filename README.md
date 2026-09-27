# 🍛 Dastarkhwan: Restaurant App MVP (React Native, frontend only)

Assignment 1, Fall 2026. This is a working React Native (Expo) prototype of a restaurant app. Diners can browse the menu, search and sort it, fill a cart, apply promo codes, place dine-in or takeaway orders, book tables and track their orders. Managers can run incoming orders, reservations and the menu from a dashboard.

It uses **no backend, no external API and no state-management library**. All data comes from mock files in `src/data`, lives in React state (Context + `useReducer`) and is saved to AsyncStorage.

| Deliverable | Location |
|---|---|
| SRS (Question 1) | [`A1/SRS.pdf`](A1/SRS.pdf) (source: `A1/source/SRS.md`) |
| UML diagrams (Question 2) | [`A1/UML/`](A1/UML) (PNG) and `A1/UML/source/*.puml` (PlantUML) |
| App source (Questions 3–10) | [`src/`](src) and [`App.js`](App.js) |
| Reducer tests (Question 7 bonus) | [`__tests__/`](__tests__) |
| Screenshots | [`docs/screenshots/`](docs/screenshots) |
| Demo video | **ADD YOUR LINK HERE** (max 3 minutes) |

---

## 1. Installation and running

**Requirements**

- **Node.js 20.19.4 or newer** (Node 22 LTS recommended). Check it with `node -v`.
- npm (comes with Node).
- **Expo Go** app on your phone (Play Store / App Store), *or* Android Studio with an Android emulator.
- The project targets **Expo SDK 57** (React Native 0.86, React 19.2).

**Steps**

```bash
git clone https://github.com/zacka0334-svg/restaurant-app-mvp.git
cd restaurant-app-mvp
npm install
npx expo install --check   # optional: makes sure native package versions match the SDK
npm start                  # same as: npx expo start
```

**Run it**

- **On a phone (Expo Go):** connect the phone and computer to the same Wi-Fi, then scan the QR code in the terminal. Android: scan it with the Expo Go app. iPhone: scan it with the Camera app.
- **On an Android emulator:** start an emulator from Android Studio (Device Manager), then press **`a`** in the Expo terminal (or run `npm run android`).
- **iOS simulator (macOS only):** press **`i`**.
- If the phone cannot connect over Wi-Fi, run `npx expo start --tunnel`.

> If Expo Go says the project's SDK is not supported, your Expo Go app is newer or older than SDK 57. Upgrade the project with `npx expo install expo@latest && npx expo install --fix`.

**Tests**

```bash
npm test
```

## 2. Mock login credentials

| Role | Email | Password |
|---|---|---|
| Customer | `customer@dastarkhwan.pk` | `Customer123` |
| Manager | `manager@dastarkhwan.pk` | `Manager123` |

You can also sign up new accounts (as Customer or Manager); they are saved on the device.

**Promo codes:** `WELCOME10` (10 % off) and `FEAST20` (20 % off).

**Demo tip:** tomorrow at **20:00** every table is booked, so that slot is always disabled ("Full") on the Reservation screen. Tomorrow at 19:00 only the large tables are booked, so that slot becomes disabled when the party size is above 4.

## 3. Project structure

```
restaurant-app-mvp/
├── App.js                      # Providers + loading gate + navigator
├── A1/
│   ├── SRS.pdf                 # Question 1
│   ├── source/SRS.md           # SRS source (build_srs.sh → PDF)
│   └── UML/                    # Question 2 (PNG + PlantUML sources)
├── __tests__/                  # Jest tests for cartReducer and pricing
├── docs/screenshots/
└── src/
    ├── components/             # MenuItemCard (React.memo), ui kit, StatusStepper, LoadingScreen
    ├── context/                # Auth, Theme, Cart, Orders, Menu, Reservations providers + hooks
    ├── data/                   # users.js, menu.js, tables.js, promoCodes.js (mock data)
    ├── hooks/                  # useForm, useDebounce, useReservation, usePersistentReducer
    ├── navigation/             # AppNavigator (stack + tabs), navigationRef
    ├── reducers/               # cartReducer, ordersReducer, menuReducer, reservationsReducer
    ├── screens/                # one file per screen
    ├── theme/colors.js         # light + dark palettes (single theme file)
    └── utils/pricing.js        # SERVICE_CHARGE_RATE, SALES_TAX_RATE, computeTotals
```

**Navigation:** a root native stack (`Login`, `Main`) → bottom tabs → a nested stack per tab.
- **Customer tabs:** Menu, Cart (with live badge), Reserve, Orders, Profile.
- **Manager tabs:** Dashboard, Profile. The Dashboard tab only exists when `user.role === 'manager'`.

## 4. Hooks used on each screen

| Screen / module | useState | useEffect | useRef | useContext (via custom consumer hooks) | useReducer | useMemo | useCallback | React.memo | Custom hooks |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|---|
| LoginScreen (Q3, Q6, Q9) | ✅ mode, showPassword, isSubmitting | | | ✅ useAuth, useTheme | | | ✅ goHome | | `useForm` |
| MenuScreen (Q4, Q5, Q8) | ✅ loading, error, refreshing, category, sort, favourites, query, recents, back-to-top | ✅ load on mount + cleanup, recents, header title | ✅ search input, FlatList, render counter, previous query, request | ✅ useTheme, useCart, useMenu | (dispatch to cart) | ✅ visibleItems, quantities | ✅ handleAdd, handleToggleFavourite, renderItem | uses MenuItemCard | `useDebounce` |
| MenuItemCard | | | | ✅ useTheme | | | | ✅ | |
| ProfileScreen (Q6) | | | | ✅ useAuth, useTheme, useCart | | | | | |
| CartScreen (Q7, Q10) | ✅ promo input/error, order type, table, pickup time | | | ✅ useCart, useTheme | ✅ cartReducer via CartProvider | ✅ subtotal, pickup times | | | |
| OrderSummaryScreen (Q8) | ✅ isPlacing | | | ✅ useCart, useOrders, useAuth, useTheme | | ✅ totals | | | |
| ReservationScreen (Q9) | ✅ showConfirm | | | ✅ useTheme | | | | | `useReservation` |
| OrderTrackingScreen (Q10) | ✅ now | ✅ 2 × setInterval + cleanup | | ✅ useOrders, useTheme | | | | | |
| MyOrdersScreen | | | | ✅ useOrders, useAuth, useTheme | | ✅ myOrders | | | |
| ManagerDashboardScreen (Q10) | ✅ tab, showAll, priceDrafts | | | ✅ useOrders, useReservations, useMenu, useTheme | | ✅ lists | | | `useForm` |
| Context providers | ✅ user, isDark | | | | ✅ cart, orders, menu, reservations, users | ✅ context values | ✅ actions | | `usePersistentReducer` |
| `useForm` | ✅ values, errors | | | | | ✅ isValid | ✅ handlers | | – |
| `useDebounce` | ✅ | ✅ timer + cleanup | | | | | | | – |
| `useReservation` | ✅ date, time, party, table, contact, errors | | | ✅ useAuth, useReservations | | ✅ slots, tables, my list | ✅ actions | | – |
| `usePersistentReducer` | ✅ isHydrated | ✅ load + save AsyncStorage | | | ✅ | | | | – |

## 5. Question notes

### Q4: What if the filtering effect's dependency array is empty?

In Question 4 the list was filtered in `useEffect(() => setFilteredItems(...), [selectedCategory, menuItems])`. If that array were left empty (`[]`), the effect would run only once, right after the first render. At that moment `menuItems` is still the empty array (the 1.5 s "fetch" hasn't finished), so `filteredItems` would stay empty. The list would show nothing even after the data arrives. Tapping a category chip would change `selectedCategory`, but the effect would never run again, so the list would not react. The code would also read stale values from the first render (a stale closure). The array tells React *when* to re-run the effect, so it must list every value the effect reads.

### Q5: Why a ref does not re-render but state does

The comment in `MenuScreen.js` explains it. `ref.current` is a plain mutable box that React does not watch, so changing it (the render counter, the debounce timer id, the previous query) never schedules a render. `setState` tells React the UI may be out of date, so React re-renders. Counting renders with state would therefore cause an infinite loop.

### Q6: Why Context instead of prop drilling

The logged-in user and the theme are needed by almost every screen: the navigator, headers, cards, profile and dashboard. With prop drilling, every screen and every intermediate component (including navigators that don't use the data) would have to accept and pass on `user`, `isDark` and `toggleTheme`. That is noisy and fragile when the tree changes. Context lets any component read the value directly with `useAuth()` / `useTheme()`, and those hooks throw a clear error if used outside their provider.

**Drawback:** every component that consumes a context re-renders whenever the context value changes. For example, toggling the theme re-renders all consumers, even ones that only use `colors` for a border. We reduce this by memoising provider values with `useMemo` and by keeping separate contexts (Auth, Theme, Cart, Orders…) so an unrelated change doesn't re-render everything.

### Q7: Cart reducer test cases

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

### Q7: `useReducer` vs `useState` for the cart

The cart has many related values (items, quantities, notes, promo code, discount) and eight different ways they can change. With `useReducer`, every transition lives in one pure, testable function. Screens only `dispatch` intent (`INCREMENT`), and rules like "decrement to zero removes the item" are written once instead of in every button handler. With `useState` the same logic would be scattered across the Menu and Cart screens and would be easy to get out of sync. `useState` would have been enough for a cart that only held a list of item ids with no quantities, notes or promo codes.

### Q8: When *not* to use `useMemo` and `useCallback`

Don't use them by default. Each one costs memory and a dependency comparison on every render, and makes code harder to read. Skip `useMemo` for cheap calculations (adding two numbers, filtering a 10-item array) and for values that are only used once in the same component. Skip `useCallback` for handlers passed to plain elements (`<Pressable onPress>`) or to children that are not wrapped in `React.memo`: a stable reference only helps when something compares it. Never use them to "fix" a bug: correctness must not depend on memoisation. Measure first (React DevTools Profiler, console logs). Optimise only where a slow calculation or a large memoised list is actually re-rendering needlessly, as with `MenuItemCard` here.

**How to see the optimisation (screenshots for Q8):** open the Metro terminal or the debugger console. With `React.memo` + `useCallback` in place, tapping one heart logs only one line, e.g. `[MenuItemCard] render: Mutton Biryani`. For the "before" screenshot, temporarily change the last line of `src/components/MenuItemCard.js` to `export default MenuItemCard;` (no memo): now every visible card logs on each tap.

## 6. Full test flow (Question 10)

1. Sign up as a new customer, which lands you on Menu.
2. Browse the categories, search "karahi" (note the render counter), sort by price, and add some items.
3. On Cart: change quantities, add "no onions", apply `FEAST20`, choose Dine-in and a table, then tap Review order.
4. On Order Summary: check the totals, then tap Place order.
5. On Order Tracking: watch Pending → Preparing (10 s) → Ready (20 s) → Served (30 s).
6. Place a second order, then open Reserve: pick tomorrow, see that 20:00 is disabled, book 19:00, confirm in the modal, and see the booking under My reservations.
7. Open Profile: toggle dark mode, then log out.
8. Log in as `manager@dastarkhwan.pk`: on Incoming Orders, move the customer's order forward; on Reservations, accept the booking; on Menu, add an item, edit a price and switch a dish to unavailable.
9. Log back in as the customer: the menu change is visible immediately and the order shows the manager's status. Close and reopen the app: the data is still there (AsyncStorage).

## 7. Screenshots

Put the images in `docs/screenshots/` with these names so the links below work:

| Question | What to capture | File |
|---|---|---|
| Q3 | Login with validation errors visible | `q3-validation-errors.png` |
| Q3 | Successful login (Menu or Dashboard) | `q3-login-success.png` |
| Q5 | Render counter after typing a search | `q5-render-counter.png` |
| Q8 | Console **before** memo (all cards log) | `q8-console-before.png` |
| Q8 | Console **after** memo (one card logs) | `q8-console-after.png` |
| Q9 | Disabled time slot (tomorrow 20:00) | `q9-disabled-slot.png` |
| Q10 | Order tracking / Manager dashboard | `q10-tracking.png`, `q10-dashboard.png` |

![Validation errors](docs/screenshots/q3-validation-errors.png)
![Login success](docs/screenshots/q3-login-success.png)
![Render counter](docs/screenshots/q5-render-counter.png)
![Console before](docs/screenshots/q8-console-before.png)
![Console after](docs/screenshots/q8-console-after.png)
![Disabled slot](docs/screenshots/q9-disabled-slot.png)
![Tracking](docs/screenshots/q10-tracking.png)
![Dashboard](docs/screenshots/q10-dashboard.png)

## 8. Demo video

▶️ **Demo (≤ 3 min):** _add your YouTube / Google Drive link here_
