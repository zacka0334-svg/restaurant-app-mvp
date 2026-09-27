import { useEffect, useState } from 'react';

// Returns `value` only after it has stopped changing for `delay` ms.
// Replaces the manual useRef + setTimeout debounce from Question 5.
export default function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    // Every new keystroke clears the previous timer; also runs on unmount.
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
