# Restaurant App MVP (React Native, frontend only)

Assignment 1, Fall 2026. Requirements are in [`A1/SRS.pdf`](A1/SRS.pdf).

## Q4 note: empty dependency array on the filtering effect

If the filtering effect used `[]`, it would run only once after the first render, when `menuItems` is still empty, so the list would stay empty after loading and would not react to category changes (stale closure).
