import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../api/client';

// Loads data from the server when the screen opens.
//   const { data, loading, error, refetch } = useApi('/menu');
// refetch({ silent: true }) reloads without showing the big spinner
// (used for pull-to-refresh and polling).
// Hook rules: starts with "use", hooks at the top level, returns no JSX.
export default function useApi(path, { initialData = null, skip = false } = {}) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState(null);
  const mounted = useRef(true);

  const refetch = useCallback(
    async ({ silent = false } = {}) => {
      if (!path) return null;
      if (!silent) setLoading(true);
      try {
        const result = await api(path);
        if (mounted.current) {
          setData(result);
          setError(null);
        }
        return result;
      } catch (err) {
        if (mounted.current) setError(err.message);
        return null;
      } finally {
        if (mounted.current && !silent) setLoading(false);
      }
    },
    [path]
  );

  useEffect(() => {
    mounted.current = true;
    if (!skip) refetch();
    // Cleanup: no state updates after the screen is closed.
    return () => {
      mounted.current = false;
    };
  }, [refetch, skip]);

  return { data, loading, error, refetch, setData };
}
