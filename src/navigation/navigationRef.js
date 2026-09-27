import { createNavigationContainerRef } from '@react-navigation/native';

// Lets non-screen code (e.g. logout) control navigation.
export const navigationRef = createNavigationContainerRef();

// Logout: wipe the whole stack so "back" cannot return to protected screens.
export function resetToLogin() {
  if (navigationRef.isReady()) {
    navigationRef.reset({ index: 0, routes: [{ name: 'Login' }] });
  }
}
