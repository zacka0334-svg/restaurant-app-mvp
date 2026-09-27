# Restaurant App MVP (React Native, frontend only)

Assignment 1, Fall 2026. Requirements are in [`A1/SRS.pdf`](A1/SRS.pdf).

## Q4 note: empty dependency array on the filtering effect

If the filtering effect used `[]`, it would run only once after the first render, when `menuItems` is still empty, so the list would stay empty after loading and would not react to category changes (stale closure).

## Q6 note: why Context instead of prop drilling

The logged-in user and the theme are needed by almost every screen, so passing them as props through navigators and intermediate components would be noisy and fragile. Context lets any component read them with `useAuth()` / `useTheme()`. Drawback: every consumer re-renders when the context value changes.
