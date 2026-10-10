import { useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';

// Calls refetch every time the user comes BACK to this screen
// (not on the first open, useApi already loads then).
export default function useRefetchOnFocus(refetch) {
  const firstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (firstFocus.current) {
        firstFocus.current = false;
        return;
      }
      refetch({ silent: true });
    }, [refetch])
  );
}
