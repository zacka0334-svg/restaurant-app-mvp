import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { MenuProvider, useMenu } from './src/context/MenuContext';
import { CartProvider } from './src/context/CartContext';
import { OrdersProvider, useOrders } from './src/context/OrdersContext';
import { ReservationsProvider, useReservations } from './src/context/ReservationsContext';
import AppNavigator from './src/navigation/AppNavigator';
import LoadingScreen from './src/components/LoadingScreen';

// Waits until every persisted data set has been read from AsyncStorage,
// so the app never flashes empty data on start-up.
function HydrationGate({ children }) {
  const auth = useAuth();
  const menu = useMenu();
  const orders = useOrders();
  const reservations = useReservations();
  const ready = auth.isHydrated && menu.isHydrated && orders.isHydrated && reservations.isHydrated;
  return ready ? children : <LoadingScreen />;
}

function ThemedStatusBar() {
  const { isDark } = useTheme();
  return <StatusBar style={isDark ? 'light' : 'dark'} />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <MenuProvider>
            <OrdersProvider>
              <ReservationsProvider>
                <CartProvider>
                  <ThemedStatusBar />
                  <HydrationGate>
                    <AppNavigator />
                  </HydrationGate>
                </CartProvider>
              </ReservationsProvider>
            </OrdersProvider>
          </MenuProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
