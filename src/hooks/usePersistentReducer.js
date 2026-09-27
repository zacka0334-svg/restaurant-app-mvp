import { useEffect, useReducer, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Custom hook: useReducer + AsyncStorage persistence.
//  - On mount it loads the saved state and dispatches { type: 'HYDRATE' }.
//  - After loading, every state change is written back to AsyncStorage.
//  - `isHydrated` lets the app show a loading screen until data is ready,
//    so the UI never flashes empty data.
// The wrapped reducer must handle the HYDRATE action.
export default function usePersistentReducer(reducer, initialState, storageKey) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load once when the app starts.
  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(storageKey)
      .then((raw) => {
        if (!cancelled && raw) {
          dispatch({ type: 'HYDRATE', payload: JSON.parse(raw) });
        }
      })
      .catch((err) => console.warn(`[storage] failed to load ${storageKey}`, err))
      .finally(() => {
        if (!cancelled) setIsHydrated(true);
      });
    return () => {
      cancelled = true;
    };
  }, [storageKey]);

  // Save whenever the state changes (only after the first load, otherwise the
  // initial seed data would overwrite what was saved last time).
  useEffect(() => {
    if (!isHydrated) return;
    AsyncStorage.setItem(storageKey, JSON.stringify(state)).catch((err) =>
      console.warn(`[storage] failed to save ${storageKey}`, err)
    );
  }, [state, isHydrated, storageKey]);

  return [state, dispatch, isHydrated];
}
